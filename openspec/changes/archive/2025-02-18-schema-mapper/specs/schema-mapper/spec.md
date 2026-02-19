# Schema Mapper — Specification

## ADDED Requirements

### Requirement: Schema Mapper tab is available in the app

The application SHALL provide a Schema Mapper tab alongside Text Tools and Image Tools. The tab SHALL be reachable via the same global navigation pattern used for other tools (e.g. tab or segment control in the header).

#### Scenario: User opens Schema Mapper tab

- **WHEN** the user selects the Schema Mapper tab in the app header
- **THEN** the Schema Mapper view is displayed with source input area, format selectors, and output area

#### Scenario: Layout consistency with other tools

- **WHEN** the user is on the Schema Mapper tab
- **THEN** the layout SHALL follow the same three-column or input/controls/output pattern as Text Tools and Image Tools where applicable

---

### Requirement: User selects source and target format via dropdowns

The system SHALL provide exact source-format and target-format selection via dropdowns (no paste-and-detect). The supported options in both dropdowns SHALL include: TypeScript types, Java Lombok `@Data` class, Zod validation schema, Prisma schema (model definitions), Golang struct, Python Pydantic model, and JSON Schema. JSON Schema SHALL be selectable as both a source and a target format.

#### Scenario: User selects source format from dropdown

- **WHEN** the user selects a source format from the source-format dropdown
- **THEN** the system treats the pasted or entered content as that format for validation and conversion

#### Scenario: User selects target format from dropdown

- **WHEN** the user selects a target format from the target-format dropdown
- **THEN** the system SHALL produce output in that format after conversion

#### Scenario: JSON Schema as source or target

- **WHEN** the user selects JSON Schema as source or as target in the dropdowns
- **THEN** the system SHALL accept (source) or produce (target) JSON Schema like any other format

#### Scenario: Same format as source and target (e.g. JSON Schema to JSON Schema)

- **WHEN** source and target format are the same (including JSON Schema to JSON Schema)
- **THEN** the system SHALL produce output equivalent to the source (e.g. identity or normalized form as defined for that format)

---

### Requirement: Conversion uses JSON Schema as canonical intermediate

The system SHALL perform every conversion by first parsing the source content into JSON Schema, then generating the target format from that JSON Schema. No direct pairwise converters SHALL be used; all conversions SHALL be implemented as parse (source format → JSON Schema) then generate (JSON Schema → target format).

#### Scenario: Conversion from TypeScript to Go

- **WHEN** the user pastes TypeScript type definitions and selects Go struct as target
- **THEN** the system SHALL parse the TypeScript to JSON Schema and then generate Go struct code from that JSON Schema

#### Scenario: Conversion from Zod to Pydantic

- **WHEN** the user pastes Zod schema code and selects Pydantic as target
- **THEN** the system SHALL parse the Zod to JSON Schema and then generate Pydantic model code from that JSON Schema

---

### Requirement: Each format has a validator; transform is gated on validation

Each supported format SHALL have a validator that determines whether the source content is valid for that format. The system SHALL run validation in response to source input changes using debounce (e.g. after the user stops typing for a short period). The transform (convert) action SHALL be enabled only when the validator for the selected source format passes; otherwise the transform control SHALL be disabled and the user SHALL see validation feedback (e.g. error message or invalid state).

#### Scenario: Debounce triggers validator

- **WHEN** the user types or pastes into the source input area
- **THEN** after a debounce delay the system SHALL run the validator for the currently selected source format on the source content

#### Scenario: Validation passes — transform enabled

- **WHEN** the validator for the selected source format passes on the current source content
- **THEN** the transform (convert) button or action SHALL be enabled and the user SHALL be able to trigger conversion

#### Scenario: Validation fails — transform disabled

- **WHEN** the validator for the selected source format fails on the current source content
- **THEN** the transform (convert) button or action SHALL be disabled and the user SHALL receive validation feedback (e.g. error message or inline indication); conversion SHALL NOT be triggerable until validation passes

#### Scenario: Source format change re-runs validation

- **WHEN** the user changes the source format dropdown
- **THEN** the system SHALL re-run validation for the new source format on the current source content and enable or disable the transform control accordingly

---

### Requirement: User can view, copy, and download conversion result

The system SHALL display the conversion result in an output area. The user SHALL be able to copy the result to the clipboard and SHALL be able to download the result as a file (e.g. with an appropriate extension for the target format).

#### Scenario: View result after conversion

- **WHEN** conversion completes successfully
- **THEN** the generated code or schema SHALL be shown in the output area and SHALL be readable and selectable

#### Scenario: Copy result

- **WHEN** the user triggers a copy action (e.g. Copy button)
- **THEN** the current conversion result SHALL be copied to the clipboard

#### Scenario: Download result

- **WHEN** the user triggers a download action (e.g. Download button)
- **THEN** the system SHALL offer a file download containing the conversion result with a filename/extension appropriate to the target format

---

### Requirement: Conversion errors are surfaced to the user

The system SHALL validate or parse the source content and SHALL surface clear error messages when the source is invalid for the selected source format or when conversion fails. The user SHALL not be left with no feedback when conversion fails.

#### Scenario: Invalid source for selected format

- **WHEN** the user runs conversion and the source content cannot be parsed for the selected source format
- **THEN** the system SHALL display an error message indicating that the input is invalid or could not be parsed, and SHALL not show a successful result

#### Scenario: Generation failure

- **WHEN** parsing succeeds but generation to the target format fails (e.g. unsupported construct)
- **THEN** the system SHALL display an error message describing the failure and SHALL not show partial or incorrect output as success

---

### Requirement: Supported formats are implemented as parsers and generators

Each supported format SHALL have exactly one parser (format → JSON Schema) and one generator (JSON Schema → format), except JSON Schema, which SHALL be supported as both source and target via identity or normalized handling. Each format SHALL also have a validator used for enabling the transform control. New formats SHALL be added by implementing one parser, one generator, and one validator. Format versions SHALL be pinned: Zod SHALL be supported as version 4 (Zod v4); TypeScript types SHALL be supported as TypeScript 5.

#### Scenario: Adding a new format

- **WHEN** a new format is added to the system
- **THEN** it SHALL be implemented as a single parser to JSON Schema, a single generator from JSON Schema, and a single validator, and SHALL participate in all conversions to/from every other supported format without additional pairwise logic

#### Scenario: Zod and TypeScript version support

- **WHEN** the user selects Zod as source or target
- **THEN** the system SHALL use Zod v4 semantics and APIs for validation, parsing, and generation

- **WHEN** the user selects TypeScript types as source or target
- **THEN** the system SHALL use TypeScript 5 semantics for parsing and generation

---

### Requirement: Prisma input supports multiple models and enums only

When the source format is Prisma schema, the system SHALL accept a single paste containing multiple `model` and `enum` blocks. The parser SHALL process only `model` and `enum` blocks; all other Prisma input (e.g. `datasource`, `generator`, and any other blocks or tokens) SHALL be ignored and SHALL NOT be included in the JSON Schema or in generated output.

#### Scenario: Prisma paste with multiple models and enums

- **WHEN** the user pastes Prisma schema content containing one or more `model` and/or `enum` blocks
- **THEN** the system SHALL parse only those blocks into the canonical JSON Schema (e.g. one or more schema roots or combined structure as defined by the implementation) and SHALL ignore all other content

#### Scenario: Prisma paste with datasource and generator

- **WHEN** the user pastes Prisma schema content that includes `datasource`, `generator`, or other non-model non-enum blocks
- **THEN** the parser SHALL ignore those blocks and SHALL use only `model` and `enum` blocks for conversion; generated output SHALL NOT contain datasource or generator content
