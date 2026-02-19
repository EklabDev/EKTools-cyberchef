# Text Compare — Design

## Context

EKTools has a Text Tools tab (CyberChef) with categories (Encoding, Encryption, Conversion, Date & Time, Binary, Schema) and operations selected via category + dropdown. Users often need to compare two versions of text (e.g. before/after a transform, or two snippets) but have no built-in diff view. Adding a git-style four-quadrant compare under Text Tools will fill this gap. The existing layout is three-column (Input | Controls | Output); Text Compare will use a custom four-quadrant layout when that operation is selected.

## Goals / Non-Goals

**Goals:**

- Add a "Text compare" category and one operation (e.g. "Diff" or "Text Compare") under Text Tools.
- Render a four-quadrant layout: top-left (source), top-right (target), bottom-left (diff from source perspective), bottom-right (diff from target perspective).
- Compute diff client-side and display git-style add/remove indicators from both perspectives.
- Keep UX consistent with existing Text Tools (same tab, same navigation pattern).

**Non-Goals:**

- Full-featured merge/resolve UI (no conflict resolution).
- Server-side diff or persistence of compare sessions.
- Integration with version control (git) beyond visual style of diff.

## Decisions

### 1. Diff algorithm and library

**Decision:** Use a well-established client-side diff library (e.g. `diff` npm package or similar) that supports line-based and optionally character-based diff. Prefer line-based by default for readability; character-based can be an option if needed.

**Rationale:** Keeps implementation small, no backend required, works offline. Line-based diff matches "git-style" expectation for most text compare use cases.

**Alternatives considered:**

- Custom LCS-based diff: more control but more code and maintenance.
- Server-side diff: unnecessary for in-browser text; adds latency and complexity.

### 2. Where diff runs

**Decision:** Run diff computation in the browser (client-side). No new API routes for diff.

**Rationale:** Aligns with existing EKTools pattern (many tools run client-side). Avoids server load and keeps compare fast for typical paste/compare workflows.

### 3. Four-quadrant layout when Text Compare is selected

**Decision:** When the user selects the Text Compare operation, replace the default three-column (Input | Controls | Output) layout with a dedicated four-quadrant view: two inputs on top, two diff outputs on bottom. Use the same overall Text Tools container and category/tool selection pattern.

**Rationale:** Matches the specified UX (source/target inputs, two diff perspectives). Reuse existing category + operation selector; only the content area changes for this operation.

### 4. Trigger for running diff

**Decision:** Support explicit "Compare" button; optionally debounce (e.g. 300–500 ms) after typing in either input so diff updates automatically. Prefer button as primary trigger for predictability with large input.

**Rationale:** Button gives clear control; debounce improves UX for small edits. For very large text, debounce-only could be noisy; button ensures user intent.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Very large inputs may slow or freeze UI | Run diff in a single synchronous pass; consider size limit or warning (e.g. 100k chars); optional Web Worker later if needed. |
| Line-based diff less useful for single long lines | Default to line-based; document that very long lines are compared as whole lines; character-based could be a future option. |
| Two diff views may duplicate logic | Share one diff result; derive "source perspective" (removals/changes from source) and "target perspective" (additions/changes from target) from the same computed changes. |

## Migration Plan

- **Deploy:** Add "Text compare" category and Diff/Text Compare operation; add four-quadrant component and wire to existing tool selection. No data migration.
- **Rollback:** Remove category and operation and four-quadrant view; revert to previous tool list.
- **Feature flag:** Optional; can ship behind a flag for staged rollout.

## Open Questions

- Whether to add a "Compare" button only, or also debounce auto-compare (recommendation: both; debounce optional/configurable).
- Exact diff library choice (e.g. `diff` package) to be confirmed at implementation time.
