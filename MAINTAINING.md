# Maintaining baobab

## Who depends on this

| What | Where | Uses |
|---|---|---|
| VolKit | Raise-the-Voices/volkit | a copy of an earlier dashboard template (with orgs and members), not updated |
| The component gallery | demos.linkedtrust.us/baobab/components/ | `components/`; after changing it: `cp components/* /var/www/demos/baobab/components/` |

A generated app is a copy. A template fix reaches it only by porting it by hand (same
function, same tests) or `copier update` in that app.

## The loop

1. `git pull`, read SCRATCH.md.
2. For each entry that fits CONTRACT.md: change the template or the docs in
   one commit, and delete the entry. Anything needing the project owner: leave it.
3. `scripts/check.sh` (generates both templates, runs their tests). It must end with
   `== all passed` before any push that touches `template/`.

Standing answers from the project owner:

- When two rules conflict, keep things working, and write down which rule gave way and why.
- Match people across systems by email when a system has no better id.

## Copies to keep in step

| Thing | Copies | Differ in |
|---|---|---|
| the grid | `template/dashboard/dashboard/static/embed/grid.js`, GovKit `static/embed/grid.js` (`<baobab-grid>`) | tag, API path, write header, CSS variable names. GovKit is changed only with care. |
| `kit.js` | `template/backend/api/static/embed/kit.js`, `template/dashboard/dashboard/static/embed/kit.js` | nothing |
| `auth.py` | `template/dashboard/dashboard/auth.py`, `template/backend/api/auth.py` | the login template name |
