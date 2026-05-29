# Transcript RAG — semantic search MCP server

A local [Model Context Protocol](https://modelcontextprotocol.io) server that gives
any Claude Code session in this repo **semantic search over the William McDonough
cradle-to-cradle transcripts** that ground the project's constitution. Use it while
writing the book to find — and cite, with a clickable YouTube timestamp — the exact
passage that supports a page.

## What it indexes

`../construction/*.md` — the two cleaned McDonough transcripts (TED 2007 + WEF 2015).
Each `## ` section becomes one searchable chunk. Section headers carry a clickable
`[M:SS](https://youtu.be/ID?t=SEC) Title` anchor, returned verbatim so every result
self-cites.

- `*_SYSTEM_PROMPT.md` is **excluded** (it's instructions, not source content).
- Non-timestamp `## ` sections (e.g. the WEF doc's "Comparison with the TED 2007 Talk")
  are indexed but flagged `(non-timestamped section)` — searchable, but no deep link.
- **Adding a transcript needs no rebuild step.** Drop a conforming `*.md` into
  `../construction/` and relaunch; the index regenerates at startup.

## The tool

```
search_transcripts(query: str, k: int = 5) -> str
```

Returns the top-`k` sections by semantic similarity, each block:
`[score] <anchor>\n<body>`, separated by `---`.

## How it runs

- **Host process via `uv run`** with [PEP 723](https://peps.python.org/pep-0723/) inline
  dependencies — `uv` provisions an isolated, cached env on first launch. No system
  `pip`, no `sudo`, no separate install step. (This is an auxiliary Python dev tool; the
  repo's Docker-first rule governs the Node/pnpm web app, not this.)
- **Embeddings:** `fastembed` with `BAAI/bge-small-en-v1.5` (384-dim, ONNX, no PyTorch).
  One-time **~64 MB** model download to `~/.cache/fastembed` on first run; fully offline
  thereafter. No API key, ever.
- **Index:** in-memory NumPy cosine, rebuilt from the in-repo markdown at startup.
  Survives a fresh clone (no committed binary index). Brute-force is exact and instant
  at this corpus size; migrate to a vector DB only past ~10k–100k chunks.

## Setup on a fresh clone

The server code and corpus are committed, but **MCP registration is per-machine** — it
lives in `~/.claude.json`, not in git. After cloning:

1. **Warm the cache + self-test** (downloads the model once, proves the pipeline):

   ```bash
   uv run --script knowledge/rag/server.py --selftest
   ```

   Good output: `[selftest] indexed 36 chunks` then three ranked passages for
   "buildings that work like trees", the top hit a tree/biology section with a
   `?t=` anchor (live: `[0.739] [4:36](…?t=276) Buildings Like Trees`).

   > **Note:** the deps are declared as [PEP 723](https://peps.python.org/pep-0723/)
   > inline script metadata, so the invocation is `uv run --script server.py`
   > (script mode). `uv run --project … python server.py` does NOT read inline
   > metadata and will fail with `ModuleNotFoundError: numpy`.

2. **Register with Claude Code** (run from the repo root so local scope keys to this project):

   ```bash
   claude mcp add hatscoatsandboots-transcript-rag --scope local -- \
     uv run --script "$PWD/knowledge/rag/server.py"
   ```

3. **Verify:** open a Claude Code session here, run `/mcp` — the server shows
   `connected` — then ask it to `search_transcripts` something.

## Why this exists

The cradle-to-cradle ethics in `.specify/memory/constitution.md` come from these two
talks. Rather than re-reading both transcripts in full every session, this server
retrieves the relevant passage on demand, with the citation attached. See
[`../../docs/SOURCES.md`](../../docs/SOURCES.md) for the full source provenance.
