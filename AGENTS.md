# For agents working in baobab, or in anything made from it

Read [CONTRACT.md](CONTRACT.md). Below: its rules as checks on a diff.

## Checks

- **One home per fact.** Before adding a model, name the system that owns the fact (contacts:
  the CRM; tasks: Taiga). If it is another system, do not add it here; link to it by URL.
- **Backends do not call each other.** No client for another backend in a backend. Work
  across systems belongs in amebo's tools (CONTRACT.md section 3).
- **Access comes from the sign-in**, checked by this backend on its own data, every request.
  Never grant access from a mapping of accounts between systems. `data-*` attributes are
  never a permission.
- **A web component talks only to its own backend**, given as `data-up`. No hostname in the
  file. `grep -rn "workers.vc\|linkedtrust.us"` finds only defaults in settings and docs.
- **No shared code between pieces.** `embed/kit.js` is copied, not imported.
- **Unset setting means off**, never an error. Names in CONTRACT.md section 10.
- **Sign-in** with `django-linkedtrust-auth`. No password path. No token where page
  JavaScript can read it. Link to an existing account by email only when verified and unique.
- **Writes** need `X-Embed: 1` and an `Origin` in `EMBED_ORIGINS`. Log refusals.
- **A card with nothing to show hides.** No "Loading…", no "Sign in to see this", no sample
  data. `textContent` only, never `innerHTML` with data. No sensitive record in a component.
- **A person's layout is theirs.** Code never rewrites it.
- **Published links never change.** List URL shapes in the README under "Links".

## Web components

Before building one, check [COMPONENTS.md](COMPONENTS.md). When you ship one, add its row
there and in `components/components.json`, even when it lives in another repo.

## Stop and ask before

- A new shared setting name or generator question.
- A dashboard app table not in CONTRACT.md section 8.
- Anything that makes one piece require another to be running.
- Any change to a published link shape, to GovKit, or to LinkedTrust.

Write what did not fit in [SCRATCH.md](SCRATCH.md).
