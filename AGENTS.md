# For agents working in baobab, or in anything made from it

Read [PRINCIPLES.md](PRINCIPLES.md), then [CONTRACT.md](CONTRACT.md). Below: the rules as
checks on a diff.

## Checks

- **One home per fact.** Before adding a model, name who owns the fact. People, orgs,
  members, nav, layouts: the dashboard app. Tasks: Taiga. Contacts: Odoo. Then do not add it
  here. A frontend has no database. A backend never stores a copy of another system's data;
  it may cache, with a stated expiry.
- **Nothing points up.** A frontend never names a dashboard app: what it knows arrives as
  `NAV_SRC`, `NAV_TAG`, `THEME_CSS`. A backend never names a frontend. A web component gets
  its backend as `data-up`. `grep -rn "workers.vc\|linkedtrust.us"` finds only defaults in
  the settings file and docs.
- **No shared code between pieces.** Only OIDC, HTTP + JSON under `/api/`, CORS with
  credentials, custom elements, and `CustomEvent`s named `<slug>:<verb>`. `embed/kit.js` is
  copied, not imported.
- **Every address of another piece is a setting; unset means off.** Names in CONTRACT.md
  section 10. Unset optional setting: the feature is absent, no error. Defaults point at
  nothing, or at LinkedTrust for `OIDC_ISSUER`.
- **Existing systems stay the record.** A connector reads through; never a sync job. Writes
  go to the system's own API as the signed-in person (CONTRACT.md section 3).
- **Sign-in.** `django-linkedtrust-auth` in Django pieces; the system's own OIDC for an
  existing system. No password path. Never keep a token where page JavaScript can read it.
- **Accounts.** Link a sign-in to an existing account by email only when the provider marks
  it verified and exactly one account matches (`person_for` in `auth.py`).
- **Security** (CONTRACT.md section 5). Org membership checked from the URL path on every
  request; `data-org` is never a permission. Writes need `X-Embed: 1` and an `Origin` in
  `EMBED_ORIGINS`. No sensitive record in a web component. Log refusals.
- **A card with nothing to show hides.** Any non-200, bad payload or empty list: `hidden`.
  No "Loading…", no "Sign in to see this", no sample data. `textContent` only, never
  `innerHTML` with data.
- **A person's layout is theirs.** Code never rewrites it; reset is one click and undoable.
- **Published links never change.** Every piece lists its URL shapes in its README under
  "Links"; a shape only gains redirects.

## Web components

Before building one, check [COMPONENTS.md](COMPONENTS.md). When you ship one, add its row
there and in `components/components.json`, even when it lives in another repo.

## Stop and ask before

- A new kind, a new shared setting name, a new generator question.
- Anything that makes one piece require another to be running.
- A dashboard app table not in CONTRACT.md section 8.
- Any change to a published link shape.
- Any change to GovKit or LinkedTrust.

Write what did not fit, or what you had to guess, in [SCRATCH.md](SCRATCH.md).
