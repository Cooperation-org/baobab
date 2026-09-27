# Contract

The rules every piece follows. GovKit (`dash.workers.vc`) already follows them and is the
working reference; it is not changed to fit this document.

## The three kinds

| Kind | Is | Owns | Stack |
|---|---|---|---|
| **dashboard** | where a person lands. One per community (GovKit is the one for workers.vc), many dashboards in it | sign-in, orgs, members and roles, the nav, the list of other pieces, dashboards and each person's saved layout, the theme | Django |
| **frontend** | an app for one job, plus web components that dashboards show | its screens and its web components; no data | React: Vite, TanStack Router + Query, Tailwind, shadcn |
| **backend** | an API for data no existing system holds | its own data, as JSON under `/api/` | Django + DRF |

A frontend reads one of two things:

- **a new backend** made from this template;
- **an existing system** (Taiga, Odoo, anything with OIDC and an API). The system keeps its
  data and its own sign-in. When its web components cannot read it from the browser
  (section 2, "Where a web component reads from"), the connector runs server-side in a
  backend or the dashboard app (section 3).

## 1. Sign-in

- Every piece signs in with OIDC. The issuer is `OIDC_ISSUER`, default
  `https://live.linkedtrust.us`. Discovery (`/.well-known/openid-configuration`) is the only
  thing a piece reads about the provider.
- Each app registers its own client: `trust_claim_backend/scripts/register-oidc-client.ts`,
  steps in the generated README under "Sign-in".
- One sign-in, no re-login: LinkedTrust keeps its own session, so when a second piece sends
  the person to `/oauth/authorize` they come straight back without a login page.
- Dashboard app and backend: `django-linkedtrust-auth` for the redirect and code exchange;
  `person_for` in the templates' `auth.py` decides the account. It links a sign-in to an
  existing account only when the provider marks the email verified, exactly one account has
  it, and that account has no id from this provider yet. Anything looser lets whoever holds
  a matching email take over an account.
- Frontend on a new backend: the backend does the sign-in; the frontend sends the person to
  the backend's login and uses its session cookie.
- Frontend on an existing system: the system's own OIDC (Taiga:
  `taiga-contrib-linkedtrust-auth`; Odoo: `auth_oauth`), reached through `VITE_SIGNIN_URL`.
- Login buttons: `AUTH_PROVIDERS`, default `linkedtrust`. Only `linkedtrust` shows a button
  today.

## 2. Web components (cards)

A frontend ships `embed/<slug>.js`: one file of vanilla custom elements. On a dashboard each
one sits in a card.

- No framework, no build step, no shadow DOM, so a dashboard with ten cards loads no
  framework ten times.
- Every web component takes `data-up`: the base URL of the backend it reads. The dashboard
  app supplies it from its list of pieces (section 8). A web component never contains a
  hostname.
- Org comes as `data-org` when the backend needs it. It is a hint for building the URL,
  never a permission (section 5).
- Every fetch is `credentials: 'include'`. Every write also sends `X-Embed: 1` (section 5).
- Nothing to show (signed out, not a member, error, empty): it sets `hidden` and renders
  nothing. No placeholders, no sample data. The backend logs refusals.
- DOM writes are `textContent` and attributes only.
- Styling comes from the host page: tag selectors and the theme variables (section 7).
- One that changes something dispatches `<slug>:changed` on `document`, with
  `{detail: {type, id}}`.
- Each has one link into the full app (section 4).
- One that lists things takes `data-limit`, and its API takes `?limit=` (latest first).

`embed/kit.js` does the common parts (fetch with credentials, hide on failure, dispatch change
events). The generator copies it in; there is no shared library to version.

GovKit's `govkit.js`, amebo's `amebo.js` and the CRM's `crm-reachout.js` follow these rules.
GovKit's write header is `X-Govkit-Embed`.

### Where a web component reads from

From a backend that has the person's session cookie: a new backend, the dashboard app, or an
existing system that accepts the browser's session from the dashboard's site.

- Odoo on `crm-<org>.workers.vc` does: its session cookie is sent same-site.
- Taiga does not: its API takes a bearer token. GovKit reads Taiga server-side for this
  reason (`govkit/apps/tasksources/adapters.py`).

A token is never handed to page JavaScript. Every script on a dashboard runs in the same page
and could read it.

### Sensitive data

- A web component never carries a sensitive record, not even the person's own. It may show
  counts, or items that are not sensitive; the records stay on the system's own pages.
- Those pages load no script from another piece, including the nav.
- A backend never caches sensitive data.

## 3. Connectors to existing systems

- A connector runs server-side, in a backend or the dashboard app. In the dashboard app it
  adds no tables: it reads through, checks membership per request, and may cache for a
  stated time.
- It acts as the signed-in person: it exchanges the person's login for the system's own
  token, and the system's credentials never reach the browser.
- Where a system has no per-person token (Taiga), it uses an application token, matches the
  person to their user in that system by email, and checks the person's rights itself.
  GovKit's Taiga connector works this way.
- A connector never copies the system into our database. Writes go to the system's own API.

## 4. Links into apps

Every frontend and backend lists its URL shapes in its README under "Links". Once published,
a shape only gains redirects; it is never removed or reshaped. A piece lists only its own
shapes: a web component's link points into our own frontend, never into a third-party system.

In use: Chiku `/projects/<slug>/board/<ref>`, Elm `/c/<campaignId>`, GovKit
`/o/<org>/{pie,drops,votes,members,projects,open}/`.

## 5. Security between pieces

- **Org scope is checked by the backend on every request.** The org comes from the URL path;
  the backend checks the person's membership and role. `data-org` is never trusted.
- **Writes need `X-Embed: 1` and an `Origin` in `EMBED_ORIGINS`.** A custom header forces a
  CORS preflight, which only listed origins pass. `SameSite=Lax` alone does not stop another
  subdomain of the same domain.
- **The dashboard app loads scripts only from its list of pieces** and sets its
  `Content-Security-Policy` `script-src` from that list. A script on a dashboard can act as
  the viewer against every backend, so that list is the trust boundary.
- **Refusals are logged server-side** (who, what, when), even though the card only hides.
- Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax`, host-only.

## 6. Nav

- The dashboard app serves `/static/embed/nav.js`, `<site-nav data-up="<dashboard app>">`.
  Its places (label, URL, roles that see it) are data in the dashboard app.
- A frontend reads `NAV_SRC` (script URL) and `NAV_TAG` (tag name). Set: it mounts that nav
  and drops its own top bar. Unset: its own top bar.
- On workers.vc the nav is `<cohort-nav>` (`workers.vc/static/embed/cohort-nav.js`).

## 7. Theme

- The dashboard app serves `/static/embed/theme.css`: CSS custom properties only, prefix
  `--theme-`. Starting values are GovKit's (`govkit/static/govkit.css`).
- A frontend reads `THEME_CSS`; set, it loads that file after its own CSS, so those values
  win.

## 8. Dashboard app data

Its tables are exactly these; anything else needs the project owner's OK:

| Table | Holds |
|---|---|
| people, orgs, members | who, which orgs, which role in each |
| peers | each frontend and backend: `slug`, `app_url`, `api_url`, `embed_url` |
| identities | the provider's id (`sub`) for each person |
| nav places | label, URL, roles that see it |
| layouts | person, dashboard, layout JSON |

A dashboard is a file, `dashboards/<name>.json`: the roles that see it and its cards in
default order. `api_url` becomes `data-up`, `embed_url` the script, `app_url` the link base.

## 9. Dashboards

- `<dashboard-grid>` places the cards, on GridStack.js (MIT). Two views: all cards, or one at
  a time. GovKit has its own copy as `<baobab-grid>`.
- A person's layout is saved in the dashboard app. Code never rewrites it; a card newly added
  to a default goes at the end. Reset to default is one click and undoable.
- Who sees a dashboard: its roles. Who sees a card's data: that card's backend.

## 10. Settings

The same names in every piece. Adding a name here needs the project owner's OK. A piece's own
settings use its slug as prefix (`PLANNER_…`).

| Setting | Default | In |
|---|---|---|
| `OIDC_ISSUER` | `https://live.linkedtrust.us` | all |
| `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` | none, required | all |
| `AUTH_PROVIDERS` | `linkedtrust` | all |
| `EMBED_ORIGINS` | none | dashboard app, backend, an existing system that serves web components |
| `DASHBOARD_URL`, `S2S_TOKEN` | none, required | backend (section 14) |
| `NAV_SRC`, `NAV_TAG` | none, `site-nav` | frontend |
| `THEME_CSS` | none | frontend |
| `API_URL` | none, required | frontend |
| `SIGNIN_URL` | none | frontend on an existing system |

A setting with no default that is not required turns its feature off when unset. It never
means a broken page.

## 11. Same site

Web components send cookies with their fetches, so the dashboard app, the web components and
their backends answer on one registrable domain (as `*.workers.vc` does). A piece can run on
any machine, but it needs a hostname under the dashboard's domain. Decide the hostname before
building.

## 12. Bringing an existing app in

An app that was not generated (Chiku, Elm, a Django app with its own users) joins by meeting
these rules, not by being regenerated. Copy code from the templates.

1. **Sign-in** through OIDC (section 1). A Django app copies `template/backend/api/auth.py`
   and its `Identity` model.
2. **Permissions stay the app's own**, checked server-side on every request. Orgs it shares
   with the dashboard app come from the URL path and are checked with it
   (`template/backend/api/security.py`).
3. **Nav and theme** (sections 6, 7): `NAV_SRC`, `NAV_TAG`, `THEME_CSS`. Unset: it keeps its own bar and look.
4. **Web components:** `static/embed/<slug>.js`, starting from a copy of
   `template/frontend/public/embed/kit.js`. Whoever runs the dashboard app adds it to Peers
   (admin) and to a `dashboards/*.json`.
5. **Links:** a "Links" section in its README (section 4).

## 13. When a card shows nothing

A card hides on any failure, so a misconfiguration looks like "nothing yet". In the browser's
network tab on the dashboard page:

1. The script loaded (not blocked by the `Content-Security-Policy`: its origin must be a
   peer's).
2. Its API call answered 200, not 401 (not signed in to that piece yet), 403 (not a member),
   or a CORS error (the page's origin is missing from that piece's `EMBED_ORIGINS`, which
   lists origins exactly: scheme, host, port).
3. The answer has rows.

The dashboard app's log says why a card was left out of a dashboard.

## 14. Who is in which org

A backend asks the dashboard app, in GovKit's shape:
`GET <DASHBOARD_URL>/api/v1/accounts/s2s/identity/<provider>/<subject>/` with
`Authorization: Bearer <S2S_TOKEN>` answers
`{display_name, email, pool, memberships: [{org_slug, org_name, role}]}`, 404 for a stranger
(`govkit/apps/accounts/api.py`, `s2s_identity`). So `DASHBOARD_URL` may be GovKit or a
dashboard app made from these templates. The backend caches the answer for a minute.

## Not tested

- A backend asking GovKit (section 14): the tests use a mocked answer.
- A frontend on an existing system (`VITE_SIGNIN_URL`) against Odoo.
