# Text Compare — Proposal

## Why

Many tools in EKTools require fine-tuning of specific sections within large text. Without a dedicated text compare tool, users must rely on the naked eye to spot differences, which is error-prone and slow. A git-style diff view integrated into the Text Tools tab will make it easy to compare source and target text side-by-side and see exactly what changed from each perspective.

## What Changes

- **New tool: Text Compare** under the Text Tools tab, in a **Text Compare** category (alongside existing categories such as Encoding, Encryption, Conversion, etc.).
- **Four-quadrant layout** (git-style):
  - **Top left**: Source input (editable textarea).
  - **Top right**: Target input (editable textarea).
  - **Bottom left**: Diff output from **source perspective** (e.g. what was removed or changed relative to source).
  - **Bottom right**: Diff output from **target perspective** (e.g. what was added or changed relative to target).
- Diff computation runs when the user has provided both source and target (e.g. on demand or after a short debounce); results are displayed in the two bottom quadrants.
- No changes to existing Text Tools operations or to Image Tools / Schema Mapper.

## Capabilities

### New Capabilities

- **text-compare**: Text Compare tool and UI. Covers the four-quadrant layout (source/target inputs, source-perspective diff, target-perspective diff), placement under Text Tools in a "Text compare" category, and the requirement that diff is computed and shown from both source and target perspectives.

### Modified Capabilities

- *(none)*

## Impact

- **Text Tools (CyberChef)**: New category "Text compare" and one new operation (e.g. "Diff" or "Text Compare") that renders the four-quadrant compare view when selected. Existing categories and operations unchanged.
- **Dependencies**: Likely a diff library (e.g. for line- or character-based diff) to compute changes; no new backend APIs required if diff runs client-side.
- **Scope**: Additive only; no breaking changes to existing tools or navigation.
