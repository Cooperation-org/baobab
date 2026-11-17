# Reconciliation

For figures that must agree exactly with a source of truth. Nothing is ranked and nothing is
left out. The owner, on project money: it "has to be able to automatically reconcile against
a bank, has to be able to reconcile against tickets, but have a page where it's kind of human
checked and human verified. There need to be different sections of like reconciling against
the budget, reconciling against the banks, or different kinds of reconciliations that should
be done with like accounting standards."

## Rules (AI-written)

1. **A reconciliation has two named sides and an as-of date**, or a period where the source
   has one (a statement). One side is the source as it arrived (the bank's statement, the
   budget as written, the tracker's tasks). The other is the app's own books. Use the standard
   form for the kind: a bank reconciliation for a bank; budget versus actual, a variance per
   line, for a budget; where no standard form exists (tickets), state the two sides in the
   app's terms file before building.
2. **It shows both totals, the difference, and the items that explain the difference.** What
   is left unexplained is shown as a number. A difference is a finding to show. Never adjust
   a figure so the sides agree. Explaining items are computed (in transit, not in the books).
   A person may add a note to an item; a note does not make the difference zero.
3. **One page, one section per reconciliation.** Each kind (bank, budget, tickets) is its own
   section with its own two sides. Adding a kind adds a section; it does not change another.
   Where a kind already has its own page, the section summarises and links to it; nothing
   moves.
4. **The automation suggests. A person verifies.** Two facts, two records: a suggestion on
   one item (the rule that produced it; accepted or rejected, by whom, when), and a sign-off
   on one reconciliation as of a date (who, when, the figures seen). Item suggestions exist
   only where the source arrives as lines to classify (a bank file). A comparison of totals
   (budget, tickets) has no suggestions; it has differences and a sign-off. Sign-off is never
   refused; the unexplained amount is stored with it. Totals say how much a person accepted
   and how much is only suggested. A person's correction stands and the automation never
   suggests over it. The app's terms file names the on-screen words.
5. **Matching rules are code, stated in a sentence a person can read on the page.** Exact
   rules first (amount, date, reference). Two candidates is no suggestion. A tolerance (days)
   is a setting shown in the rule sentence. An LLM may suggest where no rule matches; its
   suggestion is marked as such and counts as unverified like any other.
6. **The source is kept as it arrived**, and every figure opens down to the lines and the
   original file behind it.
7. **A total is never summed across currencies.**
8. **A reconciliation is against what is expected at its own level.** A bank statement
   reconciles a balance against the books. It is not a claim that every bank line belongs to
   one project line. Ask before matching across levels.

## In an app

The app's own docs decide the words and the models. Where this file and the app's
requirements disagree, stop and ask; do not pick one.
