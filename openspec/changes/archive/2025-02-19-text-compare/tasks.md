# Text Compare — Tasks

## 1. Text Tools integration

- [x] 1.1 Add "Text compare" category to Text Tools (alongside Encoding, Encryption, Conversion, etc.)
- [x] 1.2 Add one Text Compare (or Diff) operation under the Text compare category
- [x] 1.3 When Text Compare operation is selected, render the four-quadrant layout instead of the default Input | Controls | Output layout

## 2. Diff computation

- [x] 2.1 Add a client-side diff library (e.g. `diff` package) and wire it for line-based diff
- [x] 2.2 Implement diff helper: given source and target text, compute changes and return structured result (additions, removals, unchanged)
- [x] 2.3 Derive source-perspective output (removals/changes from source) and target-perspective output (additions/changes from target) from the same diff result for display in bottom quadrants

## 3. Four-quadrant UI

- [x] 3.1 Implement four-quadrant layout: top-left (source input), top-right (target input), bottom-left (source-perspective diff), bottom-right (target-perspective diff)
- [x] 3.2 Add labeled, editable textareas for source (top left) and target (top right)
- [x] 3.3 Add read-only diff display areas for bottom-left (source perspective) and bottom-right (target perspective) with git-style add/remove styling (e.g. red for removed, green for added)
- [x] 3.4 Add "Compare" button to trigger diff computation when both inputs are available
- [x] 3.5 Optionally debounce diff computation after typing (e.g. 300–500 ms) so diff updates automatically; ensure Compare button remains primary trigger

## 4. Edge cases and polish

- [x] 4.1 Handle empty source or target: show placeholder or empty state in diff quadrants; do not show stale or incorrect diff
- [x] 4.2 Consider size limit or warning for very large input (e.g. 100k chars) to avoid UI freeze; document behavior if limited
