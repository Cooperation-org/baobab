# Contract

The rules every piece follows. GovKit (`dash.workers.vc`) already follows them and is the
dashboard for workers.vc; it is not changed to fit this document.

## The pieces

| Piece | Is | Owns |
|---|---|---|
| **backend** | a system with its own data: one made from the backend template, or an existing one (Odoo CRM, Taiga, any open source tool that signs in with OIDC) | its data, who may see it, and its own web components |
| **dashboard app** | where a person lands. GovKit, or one made from the dashboard template | sign-in ids, the nav bar, dashboards, each person's layout |
| **amebo** | the agent | knows every system and acts across them (section 3) |

A web component belongs to its backend and talks only to it. A dashboard only arranges
components; it holds no data of theirs and no permissions. Backends do not know about each
other.

## 1. Sign-in

- Every piece signs in with LinkedTrust (OIDC). The issuer is `OIDC_ISSUER`, default
  `https://live.linkedtrust.us`. Once signed in, going to another piece is a redirect, not a
  login page.
- Each app registers its own client: `trust_claim_backend/scripts/register-oidc-client.ts`,
  steps in the generated README under "Sign-in".
- Access comes from the sign-in, in each system's own rules. A mapping of "person is user N
  in system S" never grants access.
- A sign-in links to an existing account by email only when the provider marks it verified
  and exactly one account has it (`person_for` in the templates' `auth.py`). Anything looser
  lets whoever holds a matching email take over an account.

## 2. Web components

A backend ships `static/embed/<slug>.js`: vanilla custom elements, no framework, no build
step, no shadow DOM, so a dashboard with ten of them loads no framework ten times.

- Each takes `data-up`: the base URL of its backend. It never contains a hostname.
- Every fetch is `credentials: 'include'`; every write also sends `X-Embed: 1` (section 5).
- It may keep a live connection to its own backend (a socket, server-sent events); that is
  the backend's choice.
- Nothing to show (signed out, not allowed, error, empty): it sets `hidden` and renders
  nothing. No placeholders, no sample data.
- DOM writes are `textContent` and attributes only.
- Styling comes from the host page: tag selectors and the theme variables (section 7).
- One that changes something dispatches `<slug>:changed` on `document`, `{detail: {type, id}}`.
- One that lists things takes `data-limit`; its API takes `?limit=` (latest first).

`embed/kit.js` does the common parts (fetch with credentials, hide on failure, change
events). It is copied into each backend, not shared.

In use: GovKit's `govkit.js`, amebo's `amebo.js`, the CRM's `crm-reachout.js`.

### Sensitive data

- A web component never carries a sensitive record. It may show counts, or items that are
  not sensitive; the records stay on the system's own pages.
- Those pages load no script from another piece, including the nav.

## 3. Across systems

- **A record is referred to by its URL in the system that owns it.** A task links to a CRM
  contact by the contact's URL; the CRM decides whether the person following it may see it.
- **Backends do not call each other.** Work across systems (a retro note becomes a Taiga
  task; look up a person in the CRM or abra) is done by amebo's tools, under the rules in
  `amebo/docs/BOUNDARIES.md`: as the person with their permissions, or as a team's own
  service identity; no credential that bypasses scope; every write records who it was done
  as. amebo generally does not contact people; it reads what it needs, and outbound
  messages wait in its approval queue.

## 4. Links

Every piece lists its URL shapes in its README under "Links". Once published, a shape only
gains redirects; it is never removed or reshaped.

In use: Chiku `/projects/<slug>/board/<ref>`, Elm `/c/<campaignId>`, GovKit
`/o/<org>/{pie,drops,votes,members,projects,open}/`.

## 5. Security between pieces

- **Each backend checks, on every request, what the signed-in person may see.** An attribute
  on a page is never a permission.
- **Writes need `X-Embed: 1` and an `Origin` in `EMBED_ORIGINS`.** A custom header forces a
  CORS preflight, which only listed origins pass. `SameSite=Lax` alone does not stop another
  subdomain of the same domain.
- **A dashboard loads scripts only from its list of apps** and sets its
  `Content-Security-Policy` `script-src` from that list. A script on a dashboard can act as
  the viewer against every backend, so that list is the trust boundary.
- **A token is never handed to page JavaScript.** Every script on a page could read it.
- **Refusals are logged server-side**, even though the component only hides.
- Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax`, host-only.

## 6. Nav bar

The dashboard app serves `/static/embed/nav.js`, `<site-nav data-up="<dashboard app>">`: one
bar with every place a person works, including existing systems (Taiga, the CRM). Any app
that loads it looks like part of one place. Places are data in the dashboard app: a label and
a URL. On workers.vc the bar is `<cohort-nav>` (`workers.vc/static/embed/cohort-nav.js`).

## 7. Theme

The dashboard app serves `/static/embed/theme.css`: CSS custom properties only, prefix
`--theme-`. Starting values are GovKit's (`govkit/static/govkit.css`).

## 8. Dashboard app data

Its tables are exactly these; anything else needs the project owner's OK:

| Table | Holds |
|---|---|
| identities | the provider's id (`sub`) for each person |
| apps | `slug`, `app_url`, `api_url`, `embed_url` for each app it shows |
| nav places | label, URL, order |
| layouts | person, dashboard, layout JSON |

A dashboard is a file, `dashboards/<name>.json`: its cards in default order. `api_url`
becomes `data-up`, `embed_url` the script.

## 9. Dashboards

- `<dashboard-grid>` places the cards, on GridStack.js (MIT). Two views: all cards, or one at
  a time. GovKit has its own copy as `<baobab-grid>`.
- A person's layout is theirs. Code never rewrites it; a card newly added to a default goes at
  the end. Reset to default is one click and undoable.
- What a card shows is decided by its backend, per person.

## 10. Settings

The same names in every piece. Adding a name needs the project owner's OK. A piece's own
settings use its slug as prefix (`PLANNER_…`).

| Setting | Default | In |
|---|---|---|
| `OIDC_ISSUER` | `https://live.linkedtrust.us` | all |
| `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` | none, required | all |
| `AUTH_PROVIDERS` | `linkedtrust` | all |
| `EMBED_ORIGINS` | none | all: origins of pages that read this piece with credentials |

A setting that is unset turns its feature off. It never means a broken page.

## 11. Same site

Web components send cookies with their fetches, so a dashboard and the backends whose
components it shows answer on one registrable domain (as `*.workers.vc` does). Links (section
3) have no such limit.

## 12. Bringing an existing system in

An existing system (Odoo, Taiga, an app of ours not made from the templates) joins
by meeting these rules, not by being rebuilt:

1. **Sign-in** through LinkedTrust (section 1). Odoo: `auth_oauth`; Taiga:
   `taiga-contrib-linkedtrust-auth`; a Django app: copy `template/backend/api/auth.py` and
   its `Identity` model.
2. **Permissions stay its own**, checked on every request.
3. **Web components**, if it has any: `static/embed/<slug>.js`, starting from a copy of
   `template/backend/api/static/embed/kit.js`. Whoever runs the dashboard adds it under Apps.
4. **Links:** a "Links" section in its README (section 4).
5. **The nav bar**, if it wants to look like one place: load `<site-nav>` (section 6).

## 13. When a card shows nothing

A card hides on any failure, so a misconfiguration looks like "nothing yet". In the browser's
network tab on the dashboard page:

1. The script loaded (not blocked by the `Content-Security-Policy`: its origin must be an
   app's).
2. Its API call answered 200, not 401 (not signed in to that system yet), 403 (not allowed),
   or a CORS error (the page's origin is missing from that backend's `EMBED_ORIGINS`, which
   lists origins exactly: scheme, host, port).
3. The answer has rows.

The dashboard app's log says why a card was left out of a dashboard.
