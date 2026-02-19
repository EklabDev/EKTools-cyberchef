# Text Compare — Specification

## ADDED Requirements

### Requirement: Text Compare is available under Text Tools

The application SHALL provide a Text Compare tool under the Text Tools tab. The tool SHALL appear in a "Text compare" category alongside existing categories (e.g. Encoding, Encryption, Conversion). When the user selects the Text Compare operation, the UI SHALL display the four-quadrant compare layout.

#### Scenario: User selects Text Compare in Text Tools

- **WHEN** the user is on the Text Tools tab and selects the "Text compare" category and the Text Compare (or Diff) operation
- **THEN** the four-quadrant layout SHALL be displayed with source input (top left), target input (top right), source-perspective diff (bottom left), and target-perspective diff (bottom right)

#### Scenario: Layout matches four-quadrant design

- **WHEN** the user is viewing the Text Compare tool
- **THEN** the layout SHALL consist of four quadrants: top-left (source input), top-right (target input), bottom-left (diff from source perspective), bottom-right (diff from target perspective)

---

### Requirement: User can enter source and target text

The system SHALL provide editable input areas for source text (top left) and target text (top right). Both inputs SHALL support multi-line text and SHALL be clearly labeled.

#### Scenario: User pastes or types source text

- **WHEN** the user pastes or types text into the source input (top left)
- **THEN** the text SHALL be accepted and displayed; the system MAY compute or update the diff when both source and target are available

#### Scenario: User pastes or types target text

- **WHEN** the user pastes or types text into the target input (top right)
- **THEN** the text SHALL be accepted and displayed; the system MAY compute or update the diff when both source and target are available

---

### Requirement: Diff is shown from source and target perspectives

The system SHALL compute a diff between source and target text and SHALL display the result from two perspectives. The bottom-left quadrant SHALL show the diff from the **source perspective** (e.g. removals or changes relative to source). The bottom-right quadrant SHALL show the diff from the **target perspective** (e.g. additions or changes relative to target). The diff presentation SHALL be git-style (e.g. line-based or character-based with clear add/remove indicators).

#### Scenario: Diff computed when both inputs present

- **WHEN** both source and target inputs contain text (or the user triggers compare)
- **THEN** the system SHALL compute the diff and SHALL display source-perspective diff in the bottom-left quadrant and target-perspective diff in the bottom-right quadrant

#### Scenario: Source-perspective diff shows removals and changes

- **WHEN** the diff has been computed
- **THEN** the bottom-left quadrant SHALL show what was removed or changed relative to the source (e.g. lines or segments that differ when viewed from source)

#### Scenario: Target-perspective diff shows additions and changes

- **WHEN** the diff has been computed
- **THEN** the bottom-right quadrant SHALL show what was added or changed relative to the target (e.g. lines or segments that differ when viewed from target)

---

### Requirement: Compare runs on user action or debounce

The system SHALL run diff computation when both source and target text are available. The trigger SHALL be either explicit user action (e.g. "Compare" button) or a short debounce after the user stops typing. The implementation SHALL avoid blocking the UI during computation for large inputs.

#### Scenario: User triggers compare

- **WHEN** the user triggers the compare (e.g. by clicking a Compare button or after debounce)
- **THEN** the system SHALL compute the diff and SHALL update both bottom quadrants with the result

#### Scenario: Empty or missing input

- **WHEN** either source or target input is empty
- **THEN** the system MAY show placeholder or empty state in the diff quadrants; the system SHALL NOT show incorrect or stale diff for the other quadrant
