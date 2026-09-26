# baobab

Templates for apps that compose into one dashboard, and work on their own.

**Read first: [PRINCIPLES.md](PRINCIPLES.md).** Agents: [AGENTS.md](AGENTS.md).

Status: design draft, under review. The templates below are not generated yet.

## Pick one

| You are building | Pick | You get |
|---|---|---|
| The place people land: sign-in, their orgs, the nav, the dashboard | **baobab** (frame) | Django app |
| A front end for one job (tasks, CRM, planning) that also gives the dashboard cards | **frond** | React app + a cards file |
| The backend a frond needs, when no existing system has the data | **root** | Django API |
| A frond on top of a system that already exists (Taiga, Odoo, anything with OIDC and an API) | **vine** | a connector, no new backend |

```
uvx copier copy gh:Cooperation-org/baobab my-app
```

The first question is which of the four. Everything after that has a default.

## How they fit

```
                 LinkedTrust (or any OIDC provider)
                          │  one sign-in
      ┌───────────────────┼───────────────────────┐
      │                   │                       │
 ┌────▼─────┐        ┌────▼─────┐           ┌─────▼──────┐
 │ baobab   │ mounts │ frond    │  reads    │ root       │  a new Django API
 │ (frame)  ├───────►│ cards    ├──────────►│   or       │
 │ nav,grid,│ links  │ frond app│  or       │ vine ──────┼─► Taiga, Odoo, ...
 │ layouts  ├───────►│          ├──────────►│            │  an existing system
 └──────────┘        └──────────┘           └────────────┘
```

Nothing points back up. A frond does not know which frame shows it. A root or an existing
system does not know which frond reads it.

The rules both sides follow: [CONTRACT.md](CONTRACT.md).

## Where this came from

The workers.vc composition: GovKit, Chiku (Taiga), Elm (Odoo), amebo and the workers.vc
shell. Its current contract is `govkit/docs/COMPOSITION.md`. baobab replaces that document
once the templates exist.
