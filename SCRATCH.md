# Scratch

People building with these templates write here: what did not fit, what you had to guess,
what should change. One entry per point, at the bottom:

```
## YYYY-MM-DD · <your app> · <dashboard | backend | existing system>
What happened, with the file and line. What should change.
```

Answered entries are deleted; `git log -p SCRATCH.md` keeps them.

---

## 2026-11-14 · elm Next list · existing system
Making Next usable (`elm/src/lib/OutreachList.svelte`, `rank.js`) hit these; each is a pattern, not an elm bug.
- **Lists rank rows but never balance groups.** A campaign with many researched rows filled Next. Fixed in elm with `spread()` (campaigns take turns, N per campaign). Should change: a "take turns by group" step every ranked list can use, with N as a visible setting.
- **Agents write notes under a person's account.** Research notes ("[researched …, AI-collected]") are authored by a team member's user, so the list cannot tell a person's words from an agent's. Should change: agents always post as an agent user; readers already drop agent authors.
- **Mail import keeps its own header and the whole quoted thread in the message body.** Every reader has to strip the poller line, forward headers and quotes (elm `saidText` in `server/odoo.ts`). Should change: the importer stores the new words as the body and keeps the raw message elsewhere.
- **One person, several rows.** The same contact sits in two campaigns, sometimes as two partner records. Next now shows a person once. Should change: one person record, many campaign links; a merge step for duplicates.
- **One list component serves every list through flags.** Next is now a branch inside a ~700-line component shared with grants, news and campaign lists. Should change: small parts (row, reach buttons, quick record) that each list puts together.
- **No write for "reached them".** The list could post a note but not set the contacted date. Added `PATCH /api/lead/<id> {contacted:true}`. Should change: reaching out is one event (channel, date, come-back date) in the contract, not a note plus fields.
- **Contact details live twice.** Research "Do:" lines carry an email address in prose that can differ from the row's email field. Should change: the Do line names the action; the address comes from the field.
