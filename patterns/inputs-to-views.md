# Inputs to views

"Accept inputs from broad sets of sources, have some kind of a router node that then decides
where those inputs should be forwarded to ... each of those kind of database views needs to
run a prioritization and a summary for an audience and then it can be a view for that
audience of the top things that are relevant to them, with not an AI generated summary but
just surfacing the key facts that are relevant to them. So at the end of the pipeline is the
surfacing of a winnowed set of key facts in a certain format for a certain view."

## The parts, as the owner named them

| Part | What it is | Exists today |
|---|---|---|
| Inputs | Email, chat, news, bank files, task changes, a person's instruction | varies by app |
| Router node | Decides which app databases an input goes to | amebo (work across systems, `amebo/docs/BOUNDARIES.md`) |
| Importance, risk, trust, customer databases | "who's interested in those inputs and who should have access to those inputs", they inform the router | CRM, LinkedTrust, abra |
| App database | "almost like a view of all the inputs that have come in that were routed to them that they chose to keep" | Elm, Taiga, StoryKit, a model law library |
| App view | "the prioritize score depending on the audience viewer" | each app's pages and web components |

## Rules (AI-written)

1. An app database keeps what it chose to keep, each record with where it came from and when.
   It stays the one home for that fact (`../CONTRACT.md` section 3).
2. Ranking is stored in the app database, per audience, with the date it was computed and the
   inputs it used. The view reads the stored ranking; it does not rank on page load.
3. A new input re-ranks. So does a person's change: a reassignment, an edit, a dismissal. The
   test: the view a person opens today reflects what they put in over the last days.
4. The view shows facts that exist in the record: names, dates, numbers, sources, verbatim
   quotes. No generated summary text.
5. A person's change stands over the ranking. A dismissed or reassigned item does not return
   on its own.
6. Start with an LLM where the rule is not known yet. Each time its decision repeats, write the
   rule as code or data (a rubric row, a routing table) and take the LLM out of that step.

## Not this pattern

Money that must add up, or anything where leaving an item out is an error:
[reconciliation.md](reconciliation.md).
