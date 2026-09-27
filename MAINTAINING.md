# Maintaining baobab

For whoever keeps these templates right while other people build with them: a person, or
an agent session started with the prompt at the bottom.

## Who depends on this

| What | Where | Uses |
|---|---|---|
| VolKit (volunteer dashboard) | Raise-the-Voices/volkit | the frame template, plus a Ghost connector and Taiga |
| The content planner | its own repo | frond + root, delivering through Postiz |
| The workers.vc dash | `workers.vc/dash/<org>/` | GovKit's copy of `<baobab-grid>` (see Copies) |
| The component gallery | demos.linkedtrust.us/baobab/components/ | `components/` here |

## The loop

1. `git pull`, then read SCRATCH.md from the last `→` answer down.
2. For each entry:
   - It fits PRINCIPLES.md and the contract says nothing against it: change the template,
     the contract or the docs, in one commit.
   - The contract leaves it open: decide by PRINCIPLES.md and the standing answers below,
     and write the decision into CONTRACT.md. SCRATCH.md holds architecture feedback only,
     never questions for the project owner.
3. `scripts/check.sh` (renders frame, root and frond; runs their tests and build). It must
   end with `== all passed` before any push that touches `template/`.
4. Commit, push, and write the answer under the entry, starting with `→` and the date: what
   changed, in which file.

Standing answers from the project owner:

- When two rules conflict, keep things working, and write down which rule gave way and why.
- Match people across systems by email when a system has no better id.

## Copies to keep in step

| Thing | Copies | How they differ |
|---|---|---|
| `<baobab-grid>` | `template/frame/frame/static/embed/grid.js`, `govkit/static/embed/grid.js` | API path (`/api/me/layouts/` vs `/api/v1/accounts/me/layouts/`), write header (`X-Baobab` vs `X-Govkit-Embed`), CSS variable names (`--bb-*` vs unprefixed); the frame copy also has `data-autohide`. Port a fix to both. |
| `kit.js` | `template/frond/public/embed/kit.js`, `template/frame/frame/static/embed/kit.js` | none; copy one over the other |
| sign-in (`auth.py`) | `template/frame/frame/auth.py`, `template/root/api/auth.py` | the login template name only |
| `live.py` | frame and root templates | none |
| the gallery | `components/` here, served from `/var/www/demos/baobab/components/` | after changing `components/`: `cp components/* /var/www/demos/baobab/components/` |

## Where to look first

- What is not built yet: CONTRACT.md, "What is not done yet".
- Every component and its attributes: COMPONENTS.md and `components/components.json`.
- Why a rule exists: the commit that added it (`git log -S '<phrase>' -- CONTRACT.md`).

## Starting an agent session to maintain this

```
You maintain /opt/shared/repos/baobab. Read MAINTAINING.md, then PRINCIPLES.md,
AGENTS.md, CONTRACT.md. Then run the loop in MAINTAINING.md once: answer every
SCRATCH.md entry below the last → answer, change what fits, run scripts/check.sh,
push. Report in under 10 lines: what you changed.
```
