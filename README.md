# baobab

Templates for adding functionality to startups with single sign-on and shared context. The
front end is malleable and modifiable; the back end is compatible and consistent. Web
components compose into dashboards.

GovKit (`dash.workers.vc`) is the working example of these rules and the dashboard for
workers.vc. It does not change to fit this repo.

Read: [PRINCIPLES.md](PRINCIPLES.md), then [CONTRACT.md](CONTRACT.md). Agents:
[AGENTS.md](AGENTS.md). Web components that exist: [COMPONENTS.md](COMPONENTS.md), running at
https://demos.linkedtrust.us/baobab/components/.

## Pick one

| You are building | Pick | You get |
|---|---|---|
| A front end for one job (tasks, planning, money) whose web components show on a dashboard | **frontend** | React app + a web components file |
| The API a frontend needs, when no existing system has the data | **backend** | Django API |
| Where people land (sign-in, orgs, nav, dashboards) for a community outside workers.vc | **dashboard** | Django app |

For workers.vc startups, build a frontend (and a backend if needed) and show it on GovKit's
dashboard. A frontend over Taiga, Odoo or another system with OIDC and an API needs no new
backend: pick **frontend**, then "an existing system".

An app that already exists with its own pages joins by
[CONTRACT.md section 12](CONTRACT.md#12-bringing-an-existing-app-in).

```
uvx copier copy --trust gh:Cooperation-org/baobab my-app
```

## How they fit

```
          LinkedTrust sign-in (OIDC)
                   │
   ┌───────────────┼──────────────────┐
   ▼               ▼                  ▼
dashboard ──► frontend's ──reads──► backend (new data)
(GovKit, or   web components   or   existing system (Taiga, Odoo)
 this one)
```

Nothing points back up: a frontend does not know which dashboard shows it; a backend does not
know which frontend reads it.

## Status

`scripts/check.sh` generates all three and runs their tests and build; it passes. Built on
them: VolKit (Raise-the-Voices/volkit, a dashboard, deployed, not yet reachable by people).
Not tested yet: CONTRACT.md, "Not tested".

Keeping the templates right: [MAINTAINING.md](MAINTAINING.md).
