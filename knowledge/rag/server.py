# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "mcp>=1.27,<2",
#   "fastembed>=0.8",
#   "numpy",
# ]
# ///
"""
Local semantic-RAG MCP server for HatsCoatsAndBoots.

Exposes `search_transcripts(query, k)` — semantic search over the William
McDonough cradle-to-cradle construction transcripts (TED 2007 + WEF 2015),
returning the top-k matching sections, each prefixed with its clickable
YouTube timestamp anchor [M:SS](url?t=SEC) for citation while writing the
sustainable-building kids' book.

Runtime: host process via `uv run` (PEP 723 inline deps above). No system pip,
no sudo, no API key. Embeddings via fastembed (ONNX BAAI/bge-small-en-v1.5,
~64MB one-time cache to ~/.cache/fastembed). Index is in-memory NumPy cosine,
rebuilt at startup from the in-repo markdown so it survives a fresh clone.

Add a new transcript: drop a conforming `*.md` into knowledge/construction/
and relaunch — it's auto-indexed. `*_SYSTEM_PROMPT.md` is excluded by design.

Self-test (also warms the model cache):
    uv run --project knowledge/rag python knowledge/rag/server.py --selftest
"""

import os
import re
import sys
from pathlib import Path

import numpy as np
from fastembed import TextEmbedding
from mcp.server.fastmcp import FastMCP

# Corpus path. Claude Code injects CLAUDE_PROJECT_DIR into the spawned server's
# env; parents[2] of knowledge/rag/server.py is the repo root — the correct
# fallback for the host self-test where CLAUDE_PROJECT_DIR is unset.
PROJECT_DIR = Path(os.environ.get("CLAUDE_PROJECT_DIR", Path(__file__).resolve().parents[2]))
CORPUS_DIR = PROJECT_DIR / "knowledge" / "construction"

# Timestamped section header, e.g.:
#   ## [5:37](https://youtu.be/uKlqL_nuh_c?t=337) Section Title
# Tolerant of 1-2 digit minutes.
HEADER_RE = re.compile(
    r"^##\s+\[(?P<ts>\d{1,2}:\d{2})\]\((?P<url>https://youtu\.be/[^)]+\?t=\d+)\)\s+(?P<title>.+)$"
)


def load_chunks():
    """One chunk per `## ` section. Preamble before the first `## ` (the
    `# Title`, `Source:`, `Speaker:`, blockquote) is document metadata and is
    discarded. Timestamped headers carry a clickable anchor; non-timestamp
    `## ` headers (e.g. the WEF doc's `## Comparison with the TED 2007 Talk`)
    are still indexed but flagged non-citable. Every non-timestamp section is
    logged to stderr so content decisions are visible at index time."""
    chunks = []
    # Any future *.md transcript dropped in knowledge/construction/ is
    # auto-indexed on next launch; *_SYSTEM_PROMPT.md is excluded by design.
    md_files = sorted(
        p for p in CORPUS_DIR.glob("*.md") if not p.name.endswith("_SYSTEM_PROMPT.md")
    )

    for path in md_files:
        doc = path.name
        lines = path.read_text(encoding="utf-8").splitlines()
        cur = None  # the open chunk dict, or None while in preamble

        def close(cur):
            if cur is not None:
                cur["body"] = "\n".join(cur["_body_lines"]).strip()
                del cur["_body_lines"]
                cur["embed_text"] = f"{cur['title']}\n{cur['body']}"
                chunks.append(cur)

        for line in lines:
            if line.startswith("## "):
                close(cur)
                m = HEADER_RE.match(line)
                if m:
                    title = m.group("title").strip()
                    cur = {
                        "doc": doc,
                        "title": title,
                        "ts": m.group("ts"),
                        "url": m.group("url"),
                        # Verbatim header text minus the leading "## " — self-citing.
                        "anchor": line[3:].strip(),
                        "_body_lines": [],
                    }
                else:
                    title = line[3:].strip()
                    print(f"[index] non-timestamp section: {title} in {doc}", file=sys.stderr)
                    cur = {
                        "doc": doc,
                        "title": title,
                        "ts": None,
                        "url": None,
                        "anchor": f"{doc} — {title} (non-timestamped section)",
                        "_body_lines": [],
                    }
            elif cur is not None:
                cur["_body_lines"].append(line)
            # else: preamble before first `## ` — discard
        close(cur)

    return chunks


# Build the index once at import so it's ready before the first tool call.
# Using passage_embed/query_embed is the fastembed-recommended path; for
# bge-small-en-v1.5 the asymmetric query/passage prefix is "not so necessary"
# per the model card, so this is harmless correctness, not a promised ranking
# win. (.embed() would be an acceptable symmetric fallback for this model.)
model = TextEmbedding()  # defaults to BAAI/bge-small-en-v1.5
chunks = load_chunks()

if not chunks:
    print(
        f"[index] WARNING: corpus empty at {CORPUS_DIR} — did you `git add knowledge/`?",
        file=sys.stderr,
    )
    mat = np.zeros((0, 384), dtype="float32")
else:
    mat = np.array(list(model.passage_embed([c["embed_text"] for c in chunks])), dtype="float32")
    mat /= np.linalg.norm(mat, axis=1, keepdims=True)
    print(f"[index] embedded {len(chunks)} chunks from {CORPUS_DIR}", file=sys.stderr)

mcp = FastMCP("hatscoatsandboots-transcript-rag")


@mcp.tool()
def search_transcripts(query: str, k: int = 5) -> str:
    """Semantic search over the William McDonough cradle-to-cradle construction
    transcripts (TED 2007 + WEF 2015). Returns the top-k matching sections, each
    prefixed with its clickable YouTube timestamp anchor [M:SS](url?t=SEC) for
    citation while writing the sustainable-building kids' book."""
    if not chunks:
        return "No transcripts indexed. Check that knowledge/construction/*.md exist."
    q = np.array(list(model.query_embed(query)), dtype="float32")[0]
    q /= np.linalg.norm(q)
    scores = mat @ q
    k = max(1, min(k, len(chunks)))
    top = np.argsort(-scores)[:k]
    blocks = [f"[{scores[i]:.3f}] {chunks[i]['anchor']}\n{chunks[i]['body']}" for i in top]
    return "\n\n---\n\n".join(blocks)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        print(f"[selftest] indexed {len(chunks)} chunks from {CORPUS_DIR}")
        print()
        print(search_transcripts("buildings that work like trees", 3))
        sys.exit(0)
    mcp.run(transport="stdio")
