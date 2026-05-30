# Sources

The cradle-to-cradle ethics that govern this project (see
[`.specify/memory/constitution.md`](../.specify/memory/constitution.md),
Core Principles I–V) come from two William McDonough talks.

**The cleaned transcripts are vendored into this repo at
[`knowledge/construction/`](../knowledge/construction/)** so the local
semantic-RAG MCP server (see [`knowledge/rag/`](../knowledge/rag/)) can index
them in-repo — they must survive a fresh clone, which rules out symlinks into a
sibling repo. The **upstream source-of-truth** remains the sibling
[`TranScripts`](https://github.com/TortoiseWolfe/TranScripts) repo, whose whole
purpose is being a transcript archive. The copies here are downstream:
when a transcript changes upstream, re-copy it from `TranScripts` and relaunch
the RAG (the index regenerates on startup). Do not edit the vendored copies as
if they were canonical.

## The two talks

| Talk                             | Event / Year               | Video                        | Cleaned transcript (in TranScripts)                                                              |
| -------------------------------- | -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| **Cradle to Cradle Design**      | TED, 2007                  | https://youtu.be/IoRjz8iTVoo | `TranScripts/Construction/Construction_Edited/cradle_to_cradle_design_mcdonough_ted2007.md`      |
| **Resource Abundance by Design** | World Economic Forum, 2015 | https://youtu.be/uKlqL_nuh_c | `TranScripts/Construction/Construction_Edited/resource_abundance_by_design_mcdonough_wef2015.md` |

Both cleaned transcripts carry clickable `[H:MM:SS](url?t=SECONDS)` anchors that
jump to the exact moment in the source video. The constitution's principle
citations (e.g. `?t=175`) point into these.

Upstream path (this machine): `~/repos/TranScripts/Construction/Construction_Edited/`
Vendored copies (indexed by the RAG): [`knowledge/construction/`](../knowledge/construction/)

## Terminal RAG (semantic search MCP server)

The vendored transcripts back a **local semantic-search MCP server** that any
Claude Code session in this repo can query — see
[`knowledge/rag/README.md`](../knowledge/rag/README.md) for full setup. It
exposes `search_transcripts(query, k)`, returning the most relevant sections by
meaning, each prefixed with its clickable `[M:SS](url?t=SEC)` anchor so results
self-cite. Ask it to find the passage behind a principle, evaluate whether a
material is a biological vs. technical nutrient, or surface the source for a
book page.

Runs as a host `uv run --script` process (PEP 723 inline deps, `fastembed` +
`BAAI/bge-small-en-v1.5`, no API key, ~64 MB one-time model cache). The index
rebuilds from the in-repo markdown at startup, so adding a transcript needs no
rebuild step. **Registration is per-machine** (`~/.claude.json`, not committed)
— a fresh clone re-runs the `claude mcp add` command in the RAG README.

## No-fabrication

When writing book content or amending the constitution, **return to these
sources** — read the actual passage at the cited timestamp rather than
paraphrasing from memory. Do not attribute quotes or claims to McDonough that
aren't present in these transcripts.
