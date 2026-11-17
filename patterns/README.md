# Patterns

Shapes that repeat across apps. Pick the one that fits before designing; say so in
`../SCRATCH.md` when none fits. Quoted lines are the project owner's words. The rest is
AI-written from them and is corrected here when wrong.

| The work | Pattern |
|---|---|
| Many inputs, narrowed to the few facts one audience needs today (contacts to reach, news to act on, tasks) | [inputs-to-views.md](inputs-to-views.md) |
| Figures that must agree exactly with a source of truth (bank, budget, tickets, a signed document) | [reconciliation.md](reconciliation.md) |

The two are different. A view of top things may leave things out. A reconciliation may not.

Both follow one direction: "you want any type of llm assistant to take a lot of input, narrow
it down, rank it, surface it, and then you want to actually turn that into a formal system so
it's not always leaning on an llm and you reduce the role of the llm in the system."
