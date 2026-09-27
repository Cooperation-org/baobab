# Scratch

People building with these templates write here: what did not fit, what you had to guess,
what should change. One entry per point, at the bottom:

```
## YYYY-MM-DD · <your app> · <dashboard | frontend | backend>
What happened, with the file and line. What should change.
```

Answered entries are deleted; `git log -p SCRATCH.md` keeps them.

---

## 2026-09-27 · volkit · dashboard
How a person becomes a member of an org: nothing says, except an admin adding them. A new
volunteer who signs in lands on an empty page, while RTV's volunteer list already lives in
the cases app and in Taiga project memberships.

## 2026-09-27 · volkit · connectors
A system with only a site-wide key (Ghost Admin API) cannot act as the person (CONTRACT.md
section 3). Needs a stated rule: narrowest credential, person matched by verified email,
filtered to the person, refusals logged, read-only unless the owner says otherwise.

## 2026-09-27 · volkit, projectkit · connectors
Matching by email fails silently: a person whose Taiga or Ghost email differs from their
LinkedTrust email gets a card that hides. No one place records "this person is user N in
system S", and no page shows the person which systems are linked.

## 2026-09-27 · projectkit · frontend on an existing system
Nothing says where web components come from when the system itself must serve them (an Odoo
addon, because that host has the session cookie), or where that addon gets `kit.js`.
