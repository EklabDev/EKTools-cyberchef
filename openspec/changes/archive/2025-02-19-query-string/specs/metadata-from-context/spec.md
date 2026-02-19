## ADDED Requirements

### Requirement: Document title reflects current context

The system SHALL set the document title so that it reflects the current section and, when applicable, the active tool or operation. The title MUST include the section name and SHOULD include the tool or operation name (e.g. "Date & Time – datetime_format | EK Tools" or "Image Tools – Vectorize | EK Tools"). When the URL or in-app state that represents the effective context changes, the document title MUST be updated to match.

#### Scenario: Title on load with tool in URL

- **WHEN** the user loads a URL that specifies Text Tools, Date & Time, and tool datetime_format
- **THEN** the document title reflects that context (e.g. includes "Date & Time" and "datetime_format" or equivalent)

#### Scenario: Title updates when user changes tool

- **WHEN** the user changes the selected tool or section in the UI and the URL is updated
- **THEN** the document title is updated to match the new section and tool or operation

### Requirement: Optional meta description from context

The system MAY set a meta description (e.g. `meta name="description"`) based on the current section and tool or operation. If implemented, the description MUST be updated whenever the effective context (section/tool/operation) changes so that it remains accurate for the current view.

#### Scenario: Description present and context-specific

- **WHEN** the app supports meta description and the user is viewing a specific tool
- **THEN** the meta description reflects that tool or section (e.g. tool description or category summary)
