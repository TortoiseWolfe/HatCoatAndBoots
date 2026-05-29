# Sources

The cradle-to-cradle ethics that govern this project (see
[`.specify/memory/constitution.md`](../.specify/memory/constitution.md),
Core Principles I–V) come from two William McDonough talks.

**These transcripts are NOT vendored into this repo.** Their source-of-truth
home is the sibling [`TranScripts`](https://github.com/TortoiseWolfe/TranScripts)
repo, whose whole purpose is being a transcript archive. Copying them here
would create a second source of truth that drifts; symlinking them would break
on every fresh clone. Instead, this repo _cites_ them by path — and the
constitution distills their principles directly, so the book can be built
without the transcript files present.

## The two talks

| Talk                             | Event / Year               | Video                        | Cleaned transcript (in TranScripts)                                                              |
| -------------------------------- | -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| **Cradle to Cradle Design**      | TED, 2007                  | https://youtu.be/IoRjz8iTVoo | `TranScripts/Construction/Construction_Edited/cradle_to_cradle_design_mcdonough_ted2007.md`      |
| **Resource Abundance by Design** | World Economic Forum, 2015 | https://youtu.be/uKlqL_nuh_c | `TranScripts/Construction/Construction_Edited/resource_abundance_by_design_mcdonough_wef2015.md` |

Both cleaned transcripts carry clickable `[H:MM:SS](url?t=SECONDS)` anchors that
jump to the exact moment in the source video. The constitution's principle
citations (e.g. `?t=175`) point into these.

Local path (this machine): `~/repos/TranScripts/Construction/Construction_Edited/`

## Claude Project (RAG)

These two transcripts are uploaded to a **"Sustainable Design & Construction"
Claude Project** at claude.ai as its knowledge base, with
`TranScripts/Construction/Construction_Edited/CONSTRUCTION_SYSTEM_PROMPT.md` as
the Project Instructions. That Project is the AI assistant scoped to this
book's source material — ask it to explain a principle, evaluate whether a
material is a biological vs. technical nutrient, or critique a design against
the cradle-to-cradle goal.

The upload is a manual step in the claude.ai web UI; the files are not synced
from git. When the transcripts change in TranScripts, re-upload them to the
Project to keep the knowledge base current.

## No-fabrication

When writing book content or amending the constitution, **return to these
sources** — read the actual passage at the cited timestamp rather than
paraphrasing from memory. Do not attribute quotes or claims to McDonough that
aren't present in these transcripts.
