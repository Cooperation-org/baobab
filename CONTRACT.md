# Contract

The rules every piece follows. Design draft, under review. Facts about the existing apps
are cited from their repos; everything else is proposed.

## The four kinds

| Kind | Is | Owns | Stack |
|---|---|---|---|
| **baobab** (frame) | where a person lands | sign-in, orgs and members, the nav, dashboards and each person's saved layout, the landing page, the list of peers, the theme | Django |
| **frond** | a front end for one job | its screens and its cards; no data | React: Vite, TanStack Router + Query, Tailwind, shadcn (the Chiku `revamp/chiku` stack) |
| **root** | a new backend | its own data, as JSON under `/api/` | Django + DRF |
| **vine** | a connector to a system that exists | nothing; the system keeps its data | config + a small client in the frond |

A frond has exactly one backend: a root or a vine.

## 1. Sign-in

- Every piece signs in with OIDC. The issuer is configuration, default
  `https://live.linkedtrust.us`. Discovery (`/.well-known/openid-configuration`) is the only
  thing a piece reads about the provider.
- One sign-in, no re-login. LinkedTrust keeps its own session cookie (`lt_idp_session`,
  `trust_claim_backend/src/api/oidcApi.ts:14`). When a second app sends the person to
  `/oauth/authorize` and that session exists, the provider redirects straight back without
  a login page (`oidcApi.ts:137-155`). So each piece may run its own OIDC login, and the
  person sees one sign-in.
- Frame and root are Django and use `django-linkedtrust-auth`.
- An existing system signs in through its own OIDC support: Taiga through
  `taiga-contrib-linkedtrust-auth`, Odoo through stock `auth_oauth`.
- Which login buttons show: `AUTH_PROVIDERS`, default `linkedtrust`. Other values
  (`google`, `bluesky`) add buttons in the order given.

## 2. Cards (embedded components)

A frond ships `embed/<slug>.js`: one file of vanilla custom elements.

- No framework, no build step, no shadow DOM. The frond app can be React; its cards are not,
  so a dashboard with ten cards loads no framework ten times.
- Every card takes `data-up`: the base URL of its backend (root, or the frame). A card never
  contains a hostname.
- Org comes as `data-org` when the backend needs it.
- Every fetch is `credentials: 'include'`.
- Nothing to show (signed out, not a member, error, empty): the card sets `hidden` and
  renders nothing. No placeholders, no sample data.
- DOM writes are `textContent` and attributes only.
- Styling comes from the host: tag selectors and the theme variables (section 6).
- A card that changes something dispatches `<slug>:changed` on `document`, with
  `{detail: {type, id}}`.
- Each card has one expand link into the full app (section 4).

These rules are the existing contract (`govkit/docs/COMPOSITION.md`, "Mount"), which
govkit.js, amebo.js and crm-reachout already follow. New: the `changed` event, and
`embed/kit.js` below.

`embed/kit.js`: about 100 lines every cards file starts from (fetch with credentials,
hide on failure, subscribe to live updates, dispatch change events). The generator
copies it in, so there is no shared runtime library to version.

### Where a card reads from

A card reads from a backend that has the member's session cookie: a root, or the frame.
A card cannot read from a vine directly unless that system accepts a browser session from
the dashboard's site. Today:

- Odoo on `crm-<org>.workers.vc` does: its session cookie is sent same-site
  (`elm/README.md`, "Multi-org by hostname").
- Taiga does not: its API takes a bearer token, which Chiku keeps in `localStorage` on its
  own origin. GovKit reads Taiga server-side for this reason
  (`govkit/apps/tasksources/adapters.py`).

**Open decision A:** cards over a vine that takes tokens (Taiga). Either the frame or a root
reads it server-side (today's GovKit way), or the frame hands its LinkedTrust access token to
cards and the system accepts it. LinkedTrust access tokens are JWTs any service can verify
from JWKS, issuer + subject + `client_id`, 1 hour
(`trust_claim_backend/src/lib/oidc.ts:216-229`).

## 3. Live updates

- Each Django piece (frame, root) serves `GET /api/live/`, server-sent events.
- A message is `{topic, type, id}`; topics are org-scoped (`<org>/<thing>`).
- A card subscribes through `kit.js` and refetches when a message for its topic arrives.
  Without live updates a card fetches once, as today.
- Server side: ASGI (uvicorn) and Postgres `LISTEN/NOTIFY`, so no new service. GovKit runs
  WSGI gunicorn today (`govkit/Dockerfile:24`); a live piece runs uvicorn workers.
- Setting `LIVE`, default `on` for new pieces.

## 4. Deep links (expand targets)

Every frond publishes its URL shapes in its README, and they do not change once
published. Changing one breaks every dashboard that links to it.

Today: Chiku `/projects/<slug>/board/<ref>` (the `/p/<slug>/board?story=<ref>` shape
redirects), Elm `/c/<campaignId>`, GovKit `/o/<org>/{pie,drops,votes,members,projects,open}/`.

## 5. Nav

- The frame serves `/embed/nav.js`, one custom element. Its places (label, URL, who sees
  it) are frame data, edited in the frame, not concatenated from hostnames.
- A frond reads `NAV_SRC` (script URL) and `NAV_TAG` (tag name). Set: it mounts that nav on
  top and drops its own top bar. Unset: its own minimal top bar.
- Today's `cohort-nav.js` builds every URL from the page's domain
  (`workers.vc/doorway/static/embed/cohort-nav.js`); the frame's nav replaces that.

## 6. Theme

- The frame serves `/embed/theme.css`: CSS custom properties only, prefix `--bb-`.
- A frond reads `THEME_CSS`; set, it loads that file after its own CSS, so the frame's values
  win. Its Tailwind theme maps to the same `--bb-` names.
- The starting values are GovKit's (`govkit/static/govkit.css`, `--gk-*`).

## 7. Dashboards

- A dashboard is a frame page listing cards. Its default layout is a file in the frame
  repo.
- `<baobab-grid>` places the cards. Built on GridStack.js (MIT, vanilla, drag, resize,
  save/load). Two views: overview (grid) and one at a time (tabs).
- A person's own layout is a frame table: person, dashboard, layout JSON. Reset returns to
  the default.
- A page that must not move (a sensitive record, a form) does not use the grid.

## 8. Config

All cross-piece URLs are settings. Same names in every piece:

| Setting | Default | In |
|---|---|---|
| `OIDC_ISSUER` | `https://live.linkedtrust.us` | all |
| `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` | none, required | all |
| `AUTH_PROVIDERS` | `linkedtrust` | all |
| `EMBED_ORIGINS` | none | frame, root: shells allowed to fetch with credentials |
| `LIVE` | `on` | frame, root |
| `NAV_SRC`, `NAV_TAG` | none, `baobab-nav` | frond |
| `THEME_CSS` | none | frond |
| `API_URL` | none, required | frond: its root or vine |
| `PEERS` | none | frame: where each frond and root lives |

An unset optional setting means the feature is off. It never means a broken page.

## 9. Same site

Cards send cookies with credentialed fetches, so the frame, its fronds' cards and their
backends sit under one registrable domain (as `*.workers.vc` does today). A deployment
split across domains needs decision A's token route.

## Open decisions

- **A.** Cards over a token-only existing system (section 2).
- **B.** `AUTH_PROVIDERS` beyond LinkedTrust. The LinkedTrust sign-in page is per client
  (`/sso/<clientId>`, `oidcApi.ts:145-150`), but the client record has no list of providers
  (`trust_claim_backend/prisma/schema.prisma:334-345`). Showing only chosen providers
  means either a field on that record, or the app's own buttons.
- **C.** Frame and root both need orgs and members. Proposed: the frame owns them; a root
  reads membership from the frame's API, or later from the LinkedTrust `trust` claim
  (`earnkit/docs/SSO-AND-TEAMS.md`, section 2).
