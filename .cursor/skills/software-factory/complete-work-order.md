# Complete Work Order Phase

## Purpose
Run final verification, complete the work order, and capture handoff notes.

## Workflow

1. **Review the checklist** — open `scratch/wo-execution/WO-<number>/checklist.md` and confirm:
   - All phase certifications are checked
   - No unchecked items remain (every item is checked or marked `[SKIP]` with a reason)
   - Notes and summaries are filled in

2. **Review the context file** — open `scratch/wo-execution/WO-<number>/context.md` and confirm:
   - Work order identifiers are filled in
   - User request summary is captured in 1-2 sentences
   - Requirement and blueprint document ID + title are filled in
   - Pull request URL is up to date

3. **Review the review log** — open `scratch/wo-execution/WO-<number>/review-log.md` and confirm:
   - The final round's verdict is **REVIEW AGENT APPROVED ✅** (zero blocking findings)
   - If the verdict is **REVIEW AGENT REQUESTED CHANGES ❌**, resolve the blocking findings and run another review round before proceeding

4. **Verify delivery state:**
   - All intended files committed (`git status` clean for intended scope)
   - PR exists (use `create-pr` skill if needed)
   - PR title/body mentions work order number and work order name

5. **Call `complete_work_order`** for the intended work order number with a summary of:
   - What was delivered (work order scope)
   - Review log verdict and final round number
   - Test results summary
   - Any remaining risks or follow-up tasks

## Why This Matters

Completion is not just "code is done." It is proof that the checklist was followed, the review converged on a pass, and the work is ready for human review. Capturing handoff details in the same phase prevents context loss after state transition.
