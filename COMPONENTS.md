# Components

Every web component the team has, and where to load it from. Before building a card,
look here: it may exist. When you ship one, add a row here and in
[components/components.json](components/components.json) (the same list, for code and agents).

**See them running: https://demos.linkedtrust.us/baobab/components/**

Checked 2026-09-26 by searching every repo for `customElements.define`. "Contract" says
whether it follows CONTRACT.md section 2 (vanilla, no shadow DOM, `data-up`, textContent
only, hides when empty).

## Library (this repo, `components/`, no sign-in needed)

Load from `https://demos.linkedtrust.us/baobab/components/<file>`.

| Tag | What | Attributes | Contract |
|---|---|---|---|
| `<lt-claims>` | Recent LinkedTrust claims, filtered, checked again every minute | `data-up`, `data-query`, `data-filter` (ratings, credentials), `data-subject`, `data-claim`, `data-issuer`, `data-limit`, `data-refresh` | yes |
| `<atproto-thread>` | Comments on a page, made by replying to a Bluesky post; replies show within a minute; stored only on Bluesky | `data-up` (an app view, e.g. `https://public.api.bsky.app`), `data-post`, `data-depth`, `data-refresh`, `data-reply` (show Reply on Bluesky; set only for a viewer signed in with Bluesky) | yes |
| `<atproto-feed>` | Latest posts from one Bluesky account | `data-up`, `data-actor`, `data-limit`, `data-replies`, `data-refresh` | yes |

## Dashboard pieces

| Tag | What | Load from | Attributes | Contract |
|---|---|---|---|---|
| `<baobab-grid>` | Holds a page's cards; each person drags, resizes, hides, sees one at a time; saved per person | frame: `/static/embed/grid.js`; GovKit: `dash.workers.vc/static/embed/grid.js` | `data-up`, `data-dashboard`; children `data-card`, `data-w`, `data-autohide`, `data-tool` | yes |
| `<baobab-nav>` | The frame's bar, places filtered per viewer, account menu with Sign out | frame: `/static/embed/nav.js` | `data-up` (default: the frame that served it) | yes |
| `<cohort-nav>` | The workers.vc bar (reads GovKit `accounts/me`) | `workers.vc/static/embed/cohort-nav.js` | `data-org`, `data-current`, `data-site-url`, `data-org-name`, `data-vc-org`, `data-chat-url`, `data-calendar-url` | yes; builds hosts from its domain |

## Org, equity and tasks (GovKit)

`dash.workers.vc/static/embed/govkit.js`. All take `data-up` and most `data-org`.

| Tag | What |
|---|---|
| `<govkit-tasks>` | Open tasks from the team's Taiga, read server-side by GovKit; drag to reorder saves to Taiga. `data-limit`, `data-tasks-app` (Chiku base for links) |
| `<govkit-checklist>` | The curriculum checklist. `data-week`, `data-reading`, `data-tasks-app` |
| `<govkit-pie>` | Who holds what share, with legend |
| `<govkit-feed>` | Earned on tasks. `data-limit` |
| `<govkit-money>` | Projects, deals, totals |
| `<govkit-activity>` | The org's attention rail |
| `<govkit-ventures>` | Every venture, with raise-a-hand. No `data-org` |
| `<govkit-news>` | What ventures did about the viewer. No `data-org` |

Contract: yes.

## Team agent (amebo)

`amebo.workers.vc/embed/amebo.js` (and `api.amebo.linkedtrust.us/embed/amebo.js`). Org comes
from the session, never an attribute.

| Tag | What |
|---|---|
| `<amebo-ask>` | Ask amebo a question |
| `<amebo-goals>` | The org's goals, edited in place |
| `<amebo-skills>` | Buttons that open amebo chat with a question ready. `data-audience` |
| `<amebo-claws>`, `<amebo-goal>`, `<amebo-create-claw>` | amebo's running jobs: list, one, create |
| `<amebo-digest>` | amebo's digest |

Contract: yes.

## CRM (Odoo addon crm-outreach-runner)

`crm-<org>.workers.vc/crm_outreach_runner/static/src/embed/crm-reachout.js`

| Tag | What |
|---|---|
| `<crm-reachout>` | People to reach out to next. `data-up`, `data-limit` |
| `<crm-heard>` | The newest things people said, from lead notes |

Contract: yes. The Odoo session cookie is the auth; the org is the hostname.

## Trust and claims (LinkedTrust)

`live.linkedtrust.us/<file>.js`. **These do not follow the contract yet:** shadow DOM,
`innerHTML`, and a host attribute with a hardcoded default instead of `data-up`. They
work as embeds today.

| Tag | File | What | Attributes |
|---|---|---|---|
| `<linked-badge>` | `badge.js` | One verified claim as a badge (used for testimonials on linkedtrust.us) | `claim-id`, `layout`, `theme`, `api-base` |
| `<linked-claims-feed>` | `claims-feed.js` | Claims about one subject (default: the page's URL) | `subject`, `api`, `repo`, `limit`, `theme` |
| `<linked-claims-atproto>` | `atproto-claims.js` | `com.linkedclaims.claim` records from AT Proto | `subject` (`*` = all), `repo` (DIDs), `api`, `limit`, `theme`, `compact` |
| `<linked-claim-request>` | `claim-request.js` | Ask someone for a recommendation | `subject`, `subject-name`, `requester-name`, `aspect`, `api-base`, `theme` |
| `<linked-video-recorder>` | `video-recorder.js` | Record a short video and upload it | `api-base`, `max-duration`, `video-url` |

## Other

| Tag | Load from | What |
|---|---|---|
| `<civic-actions-feed>` | `action.cooperation.org/embed/feed.js` | Civic Works actions near an org. `org-slug`, `type`, `count`, `api-base` |
| `<simple-tip>` | `demos.linkedtrust.us/simpletip/simpletip.js` | Tip a person |
| `<tip-wallet>`, `<tip-wallet-setup>` | `demos.linkedtrust.us/tippingwallet/tip-wallet.js` | Interledger tipping |

## Wanted, not built

- **Claims pushed the moment they are made.** `<lt-claims>` checks on a timer, because
  LinkedTrust has no push to browsers, and adding one means changing its production backend.
  It has no date filter for the same reason.
- **Commenting from the page itself.** `<atproto-thread>` sends people to Bluesky to reply.
  Posting from the page needs Bluesky sign-in in the browser, or a small service like the
  blog's Ghost fork has (Cooperation-org/Zombie, branch `bluesky-integration`, which posts
  as the commenter or as the blog's account).
- `<civic-actions-feed>` cannot be used from other sites: `action.cooperation.org/feed.json`
  sends no CORS header (checked 2026-09-26).
