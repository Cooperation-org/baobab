# For agents working in baobab, or in anything made from it

Read in order: [PRINCIPLES.md](PRINCIPLES.md) (what matters), this file (what it means in
code), [CONTRACT.md](CONTRACT.md) (the full spec).

Each element from PRINCIPLES.md, as rules you can check in a diff.

## One home per fact

- Before adding a model, name the piece that owns the fact. If it is the frame (people,
  orgs, members, nav places, dashboards, layouts) or an existing system (tasks in Taiga,
  contacts in Odoo), do not add it here.
- A frond has no database. Its state is the URL, its backend, or `localStorage` for
  per-viewer conveniences only (a remembered tab).
- A root never stores a copy of another system's data. It may cache, with a stated expiry.

## Nothing points up

- A frond never names a frame. No frame hostname, no frame slug, no `if (inWorkersVc)`.
  What it knows about a frame arrives as `NAV_SRC`, `NAV_TAG`, `THEME_CSS`.
- A root never names a frond. It serves `/api/`; whoever is allowed in `EMBED_ORIGINS` reads it.
- A card never names its own backend. It gets `data-up`.
- Check: `grep -rn "workers.vc\|linkedtrust.us"` in a frond or root finds only defaults in
  the settings file and docs.

## Standards between pieces, not shared code

- Between pieces only: OIDC, HTTP + JSON under `/api/`, CORS with credentials, custom
  elements, `text/event-stream` at `/api/live/`, DOM `CustomEvent`s named `<slug>:<verb>`.
- No package that two pieces must both import at the same version. `embed/kit.js` is
  copied by the generator, not imported from a shared URL.
- A card is vanilla JS: no framework, no build step, no shadow DOM. The frond app may be
  React; its cards are not.

## Existing systems stay the record

- A vine is config and a client, never a sync job that copies the system into ours.
- Writes go to the system's own API, as the signed-in person, so the person's name is on
  the change there.
- Sign-in to the system goes through that system's own OIDC support (Taiga:
  `taiga-contrib-linkedtrust-auth`; Odoo: `auth_oauth`). Do not add a password path.

## Every cross-piece address is a setting; unset means off

- Every URL to another piece is read from settings (Django: env via `django-environ`;
  frond: `import.meta.env.VITE_*`). Names are in CONTRACT.md section 8. Do not invent a
  new name for a setting that has one.
- Unset optional setting: the feature is absent. No exception, no broken link, no error
  banner.
- Defaults point at nothing, or at LinkedTrust for `OIDC_ISSUER`. Never at another
  deployment's hosts.

## One sign-in

- Frame and root: `django-linkedtrust-auth`. Frond app: OIDC authorization code with PKCE
  against `OIDC_ISSUER`. Vine: the system's own OIDC.
- Never chain logins in the foreground ("log into A, then B, then C"). Each piece signs in
  on first use; the provider's session makes that a redirect, not a form.
- Never keep a token in a place another origin can read. Session cookies are
  `HttpOnly`, `Secure`, `SameSite=Lax`.

## Security (CONTRACT.md section 5)

- The backend checks org membership from the URL path on every request, including
  `/api/live/` subscriptions. `data-org` is never a permission.
- Writes require `X-Baobab: 1` and an `Origin` in `EMBED_ORIGINS`.
- Never hand a token to page JavaScript for cards to use.
- A card never shows a sensitive record; a root never caches sensitive data.
- Log refusals server-side.

## Accounts

- Never link a sign-in to an existing account by email unless the provider marks the email
  verified and exactly one account matches (templates: `person_for` in `auth.py`).

## A card with nothing to show hides

- Any non-200, bad payload, or empty list: `this.hidden = true` and return.
- No "Loading…", no "Sign in to see this", no sample data, no error text in a card.
- DOM writes by `textContent` and attributes. Never `innerHTML` with data.

## A person's layout is theirs

- Only the person changes their layout. Code never rewrites it, including on deploy; a new
  card in a dashboard's default goes at the end of their layout, not over it.
- Reset to default is always one click and always undoable.

## Published links never change

- Every frond and root lists its URL shapes in its README under "Links". Once there, a shape
  only gains redirects; it is never removed or reshaped.

## One question at the top

- The generator asks the kind first, then a short name. Every other question has a default
  a person can accept by pressing Enter.
- Adding a generator question, or a name to the shared settings table (CONTRACT.md
  section 10), needs the project owner's OK. A piece's own settings, prefixed with its slug,
  do not.

## Components

- Before building a card, check [COMPONENTS.md](COMPONENTS.md). Mount what exists.
- When you ship a card, add its row to baobab's COMPONENTS.md and components/components.json
  (commit to the baobab repo, even when the card lives in another repo).
- A frond and its root use the same slug.
- A card that shows nothing: CONTRACT.md section 13.
- Write what did not fit, or what you had to guess, in [SCRATCH.md](SCRATCH.md).

## Stop and ask before

- A new kind, a new setting name, a new cross-piece protocol.
- Anything that makes one piece require another to be running.
- A frame table not listed in CONTRACT.md section 8.
- Any change to a published link shape.
