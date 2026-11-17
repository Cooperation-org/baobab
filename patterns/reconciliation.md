# Reconciliation

For figures that must agree exactly with a source of truth. Nothing is ranked and nothing is
left out. The owner, on project money: it "has to be able to automatically reconcile against
a bank, has to be able to reconcile against tickets, but have a page where it's kind of human
checked and human verified. There need to be different sections of like reconciling against
the budget, reconciling against the banks, or different kinds of reconciliations that should
be done with like accounting standards."

## Rules (AI-written)

1. **A reconciliation has two named sides and a period.** One side is the source as it
   arrived (the bank's statement, the budget as written, the tracker's tasks). The other is
   the app's own books. Name both in the standard accounting words; do not invent a word.
2. **It shows both totals, the difference, and the items that explain the difference.** What
   is left unexplained is shown as a number. A difference is a finding to show. Never adjust
   a figure so the sides agree.
3. **One page, one section per reconciliation.** Each kind (bank, budget, tickets) is its own
   section with its own two sides. Adding a kind adds a section; it does not change another.
4. **The automation proposes. A person verifies.** A proposed match is stored as proposed,
   with the rule that produced it. Verified is a separate fact: who, when. Totals say how
   much is verified and how much is only proposed. A person's correction stands and the
   automation never re-proposes over it.
5. **Matching rules are code, stated in a sentence a person can read on the page.** Exact
   rules first (amount, date, reference). An LLM may propose where no rule matches; its
   proposal is marked as such and counts as unverified like any other.
6. **The source is kept as it arrived**, and every figure opens down to the lines and the
   original file behind it.
7. **A total is never summed across currencies.**
8. **A reconciliation is against what is expected at its own level.** A bank statement
   reconciles a balance against the books. It is not a claim that every bank line belongs to
   one project line. Ask before matching across levels.

## In an app

The app's own docs decide the words and the models. Where this file and the app's
requirements disagree, stop and ask; do not pick one.
