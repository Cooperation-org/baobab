# Contract

The rules every piece follows. Design draft, under review. Facts about the existing apps
are cited from their repos; everything else is proposed.

## The three kinds

| Kind | Is | Owns | Stack |
|---|---|---|---|
| **frame** (baobab) | where a person lands. One per community (workers.vc is one), many dashboards in it. | sign-in, orgs, members and roles, the nav, peers, dashboards and each person's saved layout, the landing page, the theme | Django |
| **frond** | a front end for one job | its screens and its cards; no data | React: Vite, TanStack Router + Query, Tailwind, shadcn (the Chiku `revamp/chiku` stack) |
| **root** | a new backend | its own data, as JSON under `/api/` | Django + DRF |

A frond has one backend, and it is one of two things:

- **a root**: new data that no existing system holds.
- **a vine**: an existing system (Taiga, Odoo, anything with OIDC and an API). The frond app
  talks to the system's API directly. The system keeps its data and its own sign-in.

A vine is a choice inside a frond, not a separate app. When a vine's cards cannot read the
system from the browser (section 2, "Where a card reads from"), the connector code runs
server-side in a root or in the frame; see Open decision A.

## 1. Sign-in

- Every piece signs in with OIDC. The issuer is configuration, default
  `https://live.linkedtrust.us`. Discovery (`/.well-known/openid-configuration`) is the only
  thing a piece reads about the provider.
- One sign-in, no re-login. LinkedTrust keeps its own session cookie (`lt_idp_session`,
  `trust_claim_backend/src/api/oidcApi.ts:14`). When a second app sends the person to
  `/oauth/authorize` and that session exists, the provider redirects straight back without
  a login page (`oidcApi.ts:137-155`). So each piece runs its own OIDC login, and the
  person sees one sign-in.
- Frame and root: `django-linkedtrust-auth` (Cooperation-org, v1.2.0) for the redirect and
  code exchange; the templates' `person_for` decides the account. It links a sign-in to an
  existing account only when the provider marks the email verified, exactly one account has
  it, and that account has no id from this provider yet. Anything looser lets whoever holds
  a matching email take over an account.
- Frond on a root: the root does the sign-in; the frond app sends the person to the root's
  login and uses the root's session cookie.
- Frond on a vine: the system does the sign-in through its own OIDC support (Taiga:
  `taiga-contrib-linkedtrust-auth`; Odoo: stock `auth_oauth`).
- Which login buttons show: `AUTH_PROVIDERS`, default `linkedtrust` (Open decision B for more).

## 2. Cards (embedded components)

A frond ships `embed/<slug>.js`: one file of vanilla custom elements.

- No framework, no build step, no shadow DOM. The frond app can be React; its cards are not,
  so a dashboard with ten cards loads no framework ten times.
- Every card takes `data-up`: the base URL of the backend it reads. It is the same address
  the frond app calls `API_URL`; the frame supplies it from its peer list (section 8). A card
  never contains a hostname.
- Org comes as `data-org` when the backend needs it. It is a hint for building the URL,
  never a permission (section 5).
- Every fetch is `credentials: 'include'`. Every write also sends the header
  `X-Baobab: 1` (section 5).
- Nothing to show (signed out, not a member, error, empty): the card sets `hidden` and
  renders nothing. No placeholders, no sample data. The backend logs refusals (section 5).
- DOM writes are `textContent` and attributes only.
- Styling comes from the host: tag selectors and the theme variables (section 7).
- A card that changes something dispatches `<slug>:changed` on `document`, with
  `{detail: {type, id}}`.
- Each card has one expand link into the full app (section 4).
- A card that lists things takes `data-limit` for how many, and its API takes `?limit=`
  (latest first).

These rules are the existing contract (`govkit/docs/COMPOSITION.md`, "Mount"), which
govkit.js, amebo.js and crm-reachout already follow. New: the write header, the
`changed` event, and `embed/kit.js`.

`embed/kit.js`: the small file every cards file starts from (fetch with credentials, hide
on failure, subscribe to live updates, dispatch change events). The generator copies it
in, so there is no shared runtime library to version. It exists once the frond template
is built.

### Where a card reads from

A card reads from a backend that has the member's session cookie: a root, the frame, or a
vine system that accepts the browser's session from the dashboard's site. Today:

- Odoo on `crm-<org>.workers.vc` does: its session cookie is sent same-site
  (`elm/README.md`, "Multi-org by hostname").
- Taiga does not: its API takes a bearer token, which Chiku keeps in `localStorage` on its
  own origin. GovKit reads Taiga server-side for this reason
  (`govkit/apps/tasksources/adapters.py`).

A token is never handed to page JavaScript so that cards can use it. Every card script on
a dashboard runs in the same page and could read it.

### Sensitive data

- A card never carries a sensitive record, not even one of the person's own. A system with
  sensitive data may ship cards that show counts, or items that are not sensitive; the
  records stay on its own pages.
- Those pages are fixed pages, not grid pages, and load no script from another piece,
  including the nav. They link to the frame instead.
- A root never caches sensitive data.

## 3. Live updates

- Each Django piece (frame, root) serves `GET /api/live/`, server-sent events.
- A message is `{topic, type, id}`; topics are org-scoped (`<org>/<thing>`). A message
  carries ids only; the card refetches through the normal API, which applies permissions.
- On subscribe, the backend checks the person is a member of every org in the topics
  requested, the same check as the API (section 5).
- A card subscribes through `kit.js` and refetches when a message for its topic arrives.
  Without live updates a card fetches once, as today.
- Server side: ASGI and Postgres `LISTEN/NOTIFY`, so no new service. This is a deploy
  change for an existing Django app: GovKit runs WSGI gunicorn today
  (`govkit/Dockerfile:24`), and a live piece runs uvicorn workers.

## 4. Deep links (expand targets)

Every frond and root lists its URL shapes in its README under "Links". Once published, a
shape only gains redirects; it is never removed or reshaped.

Today: Chiku `/projects/<slug>/board/<ref>` (the `/p/<slug>/board?story=<ref>` shape
redirects), Elm `/c/<campaignId>`, GovKit `/o/<org>/{pie,drops,votes,members,projects,open}/`.

## 5. Security between pieces

- **Org scope is checked by the backend, every request.** The org comes from the URL path;
  the backend checks the signed-in person's membership and role. `data-org` and topics are
  never trusted on their own.
- **Writes need the `X-Baobab: 1` header and an `Origin` in `EMBED_ORIGINS`.** A custom
  header forces a CORS preflight, which only listed origins pass. This matters because
  every subdomain of one registrable domain is same-site, so `SameSite=Lax` alone does not
  stop another subdomain. (GovKit already requires a custom header, `x-govkit-embed`,
  `govkit/config/settings.py:188`.)
- **The frame loads card scripts only from its peer list** and sets its
  `Content-Security-Policy` `script-src` from that list. A card script on a dashboard can
  act as the viewer against every backend, so the peer list is the trust boundary.
- **Refusals are logged server-side** (who, what, when), even though the card only hides.
- Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax`, host-only.

## 6. Nav

- The frame serves `/static/embed/nav.js`, one custom element, `<baobab-nav data-up="<frame>">`. Its places (label, URL, which roles
  see it) are frame data, edited in the frame, not concatenated from hostnames.
- A frond reads `NAV_SRC` (script URL) and `NAV_TAG` (tag name). Set: it mounts that nav on
  top and drops its own top bar. Unset: its own minimal top bar.
- Today's `cohort-nav.js` builds every URL from the page's domain
  (`workers.vc/doorway/static/embed/cohort-nav.js`); the frame's nav replaces that.

## 7. Theme

- The frame serves `/static/embed/theme.css`: CSS custom properties only, prefix `--bb-`.
- A frond reads `THEME_CSS`; set, it loads that file after its own CSS, so the frame's values
  win. Its Tailwind theme maps to the same `--bb-` names.
- The starting values are GovKit's (`govkit/static/govkit.css`, `--gk-*`).

## 8. Frame data

The frame's tables are exactly these; anything else needs the project owner's OK:

| Table | Holds |
|---|---|
| people, orgs, members | who, which orgs, which role in each |
| peers | each frond and root: `slug`, `app_url`, `api_url`, `embed_url` |
| identities | the provider's id (`sub`) for each person |
| nav places | label, URL, roles that see it |
| layouts | person, dashboard, layout JSON |

A dashboard is not a table: it is a file in the frame repo, `dashboards/<name>.json`, with
the roles that see it and its cards in default order.

The frame hands `api_url` to cards as `data-up`, `embed_url` becomes the card script, and
`app_url` is the expand link base.

## 9. Dashboards

- `<baobab-grid>` places the cards. Built on GridStack.js (MIT, vanilla, drag, resize,
  save/load). Two views: overview (grid) and one at a time (tabs).
- A person's own layout is saved in the frame. Code never rewrites it; a card newly added
  to a default goes at the end of the person's layout. Reset to default is one click and
  undoable.
- Who sees a dashboard: its roles. Who sees a card's data: the card's backend.

## 10. Config

Shared names, the same in every piece. Adding a name to this table needs the project
owner's OK. A piece's own settings use its slug as prefix (`PLANNER_…`) and need no OK.

| Setting | Default | In |
|---|---|---|
| `OIDC_ISSUER` | `https://live.linkedtrust.us` | all |
| `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` | none, required | all |
| `AUTH_PROVIDERS` | `linkedtrust` | all |
| `EMBED_ORIGINS` | none | frame, root, and a vine system that serves cards: origins allowed to fetch with credentials |
| `LIVE` | `true` | frame, root |
| `NAV_SRC`, `NAV_TAG` | none, `baobab-nav` | frond |
| `THEME_CSS` | none | frond |
| `API_URL` | none, required | frond: its root or vine system |

A setting with no default and not required turns its feature off when unset. It never
means a broken page.

## 11. Same site

Cards send cookies with credentialed fetches, so the frame, its fronds' cards and their
backends sit under one registrable domain (as `*.workers.vc` does today). A deployment
split across domains is not supported yet.

## 12. Bringing an existing app in

An app that was not generated (Chiku, Elm, a Django app with its own users) joins by
meeting the contract, not by being regenerated. Copy code from the templates rather than
writing it again.

1. **Sign-in** through OIDC against `OIDC_ISSUER` (section 1). A Django app copies
   `template/root/api/auth.py` and its `Identity` model, which link an existing account
   only by a verified, unambiguous email. Existing password logins can stay until the
   project owner says otherwise.
2. **Permissions stay the app's own**, checked server-side on every request. If the app has
   orgs that the frame also has, the org comes from the URL path and is checked with the
   frame (template/root `api/security.py`).
3. **Nav and theme:** the same setting names without the `VITE_` prefix: `NAV_SRC`,
   `NAV_TAG`, `THEME_CSS`. Unset: the app keeps its own bar and look.
4. **Cards:** `static/embed/<slug>.js`, starting from a copy of
   `template/frond/public/embed/kit.js`, following section 2. Whoever runs the frame adds
   the app to its Peers (admin) and its card to a `dashboards/*.json`.
5. **Links:** a "Links" section in its README (section 4).

## 13. When a card shows nothing

A card hides on any failure, so a misconfiguration looks the same as "nothing yet". Check,
in order, in the browser's network tab on the dashboard page:

1. The card's script loaded (not blocked by the page's `Content-Security-Policy`: its origin
   must be a peer's).
2. Its API call answered 200, not 401 (the person has not signed in to that piece yet), 403
   (not a member of the org), or a CORS error (the page's origin is missing from that
   piece's `EMBED_ORIGINS`, which must list origins exactly: scheme, host, port).
3. The answer has rows.

The frame's log says why a card was left out of a dashboard.

## Open decisions

- **A.** Cards over a vine system that only takes bearer tokens (Taiga). The connector runs
  server-side in a root or the frame (today's GovKit way). A connector in a frame adds no
  tables: it reads through, checks membership per request, and may cache for a stated time. Open: whether it reads as the
  signed-in person (exchanging their LinkedTrust login for a system token, as the Taiga
  plugin does at login) or as a service account that checks the person's rights itself.
  LinkedTrust access tokens are JWTs any service can verify from JWKS: issuer, subject,
  `client_id`, 1 hour (`trust_claim_backend/src/lib/oidc.ts:216-229`).
- **B.** `AUTH_PROVIDERS` beyond LinkedTrust. The LinkedTrust sign-in page is per client
  (`/sso/<clientId>`, `oidcApi.ts:145-150`), but the client record has no list of providers
  (`trust_claim_backend/prisma/schema.prisma:334-345`). Showing only chosen providers
  means either a field on that record, or the app's own buttons.
- **C.** How a root learns orgs and roles. Built in the templates: the frame owns them and
  answers `GET /api/s2s/membership/?sub=&org=` to a root holding `S2S_TOKEN`; the root
  asks on every org-scoped request, cached a minute. Later, the LinkedTrust `trust` claim
  (`earnkit/docs/SSO-AND-TEAMS.md`, section 2).

## What is not done yet

Verified 2026-09-26 against the templates as they are.

- Live updates (cards refetching when data changes, `/api/live/`) have not run end to end
  against Postgres. The code is in `live.py`; the tests cover only the refusal of topics
  outside a person's orgs.
- Signing out of the frame does not sign out of LinkedTrust (it has no sign-out endpoint),
  so the next sign-in is one click.
- `AUTH_PROVIDERS` values other than `linkedtrust` show no button yet (Open decision B).
- Cards over a vine that only takes bearer tokens (Open decision A). Working example to
  copy: `<govkit-tasks>` on the workers.vc dash reads Taiga through GovKit, server-side, with
  an application token (`govkit/apps/tasksources/adapters.py`), and saves drag order back.
- GovKit and workers.vc are not made from these templates. GovKit's `grid.js` is the same
  element on GovKit's own API (`/api/v1/accounts/me/layouts/`, header `X-Govkit-Embed`).
