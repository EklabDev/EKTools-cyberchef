## ADDED Requirements

### Requirement: Deep-linkable URL structure

The system SHALL support URLs that uniquely identify the active section and tool or operation. The path MUST encode the section (Text Tools, Image Tools, or Schema Mapper) and, for Text Tools, the category. Query parameters MUST encode the tool id (Text Tools), operation (Image Tools), or source and target formats (Schema Mapper). Text Tools URLs SHALL follow the form `baseUrl/TextTools/<category>?tool=<toolId>`. Image Tools URLs SHALL follow the form `baseUrl/ImageTools?operation=<operationId>`. Schema Mapper URLs SHALL follow the form `baseUrl/SchemaMapper?source=<sourceFormat>&target=<targetFormat>`.

#### Scenario: Direct load to Date & Time tool

- **WHEN** the user navigates to a URL with path segment for Text Tools and "Date & Time" category and query `tool=datetime_format`
- **THEN** the app renders Text Tools mode, Date & Time category, and the datetime_format tool

#### Scenario: Direct load to Image Tools operation

- **WHEN** the user navigates to a URL with path for Image Tools and query `operation=Vectorize`
- **THEN** the app renders Image Tools mode with Vectorize operation selected

#### Scenario: Direct load to Schema Mapper with source and target

- **WHEN** the user navigates to a URL with path for Schema Mapper and query `source=Typescript&target=JSON%20Schema`
- **THEN** the app renders Schema Mapper with source Typescript and target JSON Schema selected

### Requirement: URL as source of truth on load

On initial load or when the browser navigates to a new URL (e.g. back/forward or direct entry), the system SHALL read the path and search parameters and SHALL set the application state (mode, category, tool, operation, source/target) so that the rendered view matches the URL. Invalid or missing values SHALL be handled by falling back to a defined default (e.g. first section, first category, first tool) without throwing.

#### Scenario: Load with valid URL

- **WHEN** the page loads with path and query indicating Text Tools, Date & Time, and tool datetime_format
- **THEN** the UI shows Text Tools tab, Date & Time category, and datetime_format tool without requiring user interaction

#### Scenario: Load with missing or invalid query

- **WHEN** the page loads with path for Text Tools but missing or unknown `tool` query parameter
- **THEN** the system selects the first tool in the selected category (or first category if category is also missing) and SHALL update the URL to reflect the effective selection

### Requirement: State changes update the URL

When the user changes the active section, category, tool, or operation (e.g. by clicking a tab or selecting a tool), the system SHALL update the browser URL (path and/or query) to reflect the new selection so that the address bar always matches the current context. The update SHALL use a method that avoids creating a new history entry for every small change (e.g. replaceState) unless otherwise required for back/forward semantics.

#### Scenario: User switches to a different tool

- **WHEN** the user is on Text Tools, Date & Time and selects a different tool from the tool dropdown
- **THEN** the URL query parameter `tool` is updated to the selected tool id and the address bar shows the new URL

#### Scenario: User switches section

- **WHEN** the user clicks the Image Tools tab
- **THEN** the URL path and query are updated to the Image Tools pattern (e.g. baseUrl/ImageTools with operation param if applicable)

### Requirement: Back and forward navigation

When the user uses the browser back or forward button and the target URL differs from the current one, the system SHALL treat the navigated-to URL as the source of truth and SHALL update application state so that the rendered view matches that URL.

#### Scenario: Back to previous section

- **WHEN** the user had navigated from Text Tools to Image Tools and then presses back
- **THEN** the app shows Text Tools again with the same category and tool that were active when they left
