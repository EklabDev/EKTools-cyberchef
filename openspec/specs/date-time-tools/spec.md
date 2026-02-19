## ADDED Requirements

### Requirement: Datetime-to-timestamp format and output unit

The datetime_to_timestamp tool SHALL accept an optional input datetime format (from a fixed set of ~10 presets or a custom Luxon format string) and SHALL accept an optional output timestamp unit (seconds or milliseconds). When format is provided, the system MUST parse the input using that format; when omitted, behavior MUST remain backward compatible (e.g. ISO then SQL fallback). When output unit is provided, the result MUST be in that unit; when omitted, output MUST default to milliseconds.

#### Scenario: User selects preset format and seconds output

- **WHEN** user provides input "01/15/2024", selects input format "MM/DD/YYYY", and selects output "seconds"
- **THEN** the system parses the input with the chosen format and returns the timestamp in seconds

#### Scenario: Omitted format and unit

- **WHEN** user provides ISO input and omits format and output unit
- **THEN** the system parses as today and returns timestamp in milliseconds (existing behavior)

### Requirement: Timestamp-to-datetime input unit and output format

The timestamp_to_datetime tool SHALL accept an optional input timestamp unit (seconds or milliseconds) and an optional output datetime format (from the same ~10 presets or custom). When input unit is provided, the system MUST interpret the input number in that unit; when omitted, behavior MUST remain backward compatible (existing heuristic). When output format is provided, the result MUST be formatted with that format; when omitted, output MUST default to ISO.

#### Scenario: User selects milliseconds input and preset output format

- **WHEN** user provides timestamp "1705305600000", selects input unit "milliseconds", and selects output format "DD MMM YYYY"
- **THEN** the system interprets the value as milliseconds and returns the datetime in the chosen format

#### Scenario: Omitted unit and format

- **WHEN** user provides a small number and omits unit and format
- **THEN** the system uses existing heuristic and returns ISO (existing behavior)

### Requirement: Timezone autocomplete

All Date & Time tools that accept a timezone parameter SHALL expose a searchable autocomplete (combobox) for zone selection. Each option MUST display a 3-letter code plus full name (e.g. "UTC – Coordinated Universal Time"). The user MUST be able to search by code or name and select an option. The value sent to the handler MUST be a valid IANA timezone identifier.

#### Scenario: User searches and selects timezone

- **WHEN** user types "pac" in the zone field and selects "PST – Pacific Standard Time"
- **THEN** the handler receives a valid IANA zone (e.g. America/Los_Angeles or equivalent) and the operation uses that zone

#### Scenario: Zone optional and omitted

- **WHEN** user leaves zone empty where it is optional
- **THEN** the system uses default zone (e.g. UTC) and the operation succeeds

### Requirement: Datetime add duration and unit inputs

The datetime_add tool SHALL accept duration as two separate inputs: (1) a numeric duration amount and (2) a unit selected from a fixed list (years, months, days, hours, minutes, seconds, milliseconds). The unit list MUST be the same canonical list used by datetime_diff. The handler MUST compute the result by adding the given duration in the chosen unit to the input datetime. Backward compatibility: if a single "duration" string is still accepted for API compatibility, it MAY be supported in addition to amount + unit.

#### Scenario: User enters amount and selects unit

- **WHEN** user provides datetime "2024-01-15T12:00:00Z", duration amount "3", and unit "days"
- **THEN** the system returns the datetime 3 days later in the same format/zone

#### Scenario: Negative duration

- **WHEN** user provides duration amount "-2" and unit "hours"
- **THEN** the system subtracts 2 hours from the input datetime

### Requirement: Datetime diff shared unit list

The datetime_diff tool SHALL accept an optional units parameter as a list of unit names. The allowed units MUST be the same canonical set as datetime_add (years, months, days, hours, minutes, seconds, milliseconds). The UI SHALL present these as a select (single or multi as needed). When omitted, the system MUST use a sensible default (e.g. days, hours, minutes, seconds).

#### Scenario: User selects units for diff

- **WHEN** user provides start and end datetimes and selects units ["days", "hours"]
- **THEN** the system returns the difference as an object containing only days and hours

#### Scenario: Units omitted

- **WHEN** user provides start and end and omits units
- **THEN** the system returns the difference in the default unit set (existing behavior)

### Requirement: Datetime format input and output format with presets

The datetime_format tool SHALL accept an optional input format and a required or optional output format. Both SHALL support: (1) selection from ~10 preset format names (same set as datetime_to_timestamp / timestamp_to_datetime), and (2) free-text custom format (Luxon tokens) with validation. The UI SHALL offer autocomplete for the presets and SHALL validate custom format before run (e.g. try formatting a fixed date). When input format is provided, the system MUST parse the input using that format; when omitted, parsing MUST remain backward compatible (e.g. ISO).

#### Scenario: User selects preset output format

- **WHEN** user provides ISO input and selects output format preset "DD/MM/YYYY HH:mm"
- **THEN** the system returns the datetime formatted with the preset's Luxon tokens

#### Scenario: User enters custom format with validation

- **WHEN** user enters custom output format "yyyy-MM-dd" and the format is valid for Luxon
- **THEN** the system returns the datetime in that format

#### Scenario: Invalid custom format

- **WHEN** user enters an invalid custom format string
- **THEN** the system shows a validation error and does not run the operation (or returns a clear error from the handler)

### Requirement: Start/end from textarea for datetime_diff

The datetime_diff tool SHALL continue to support providing start and end via the main input textarea as two lines (first line = start, second line = end). When both start and end are provided via form params, those values MUST take precedence over parsing from the textarea.

#### Scenario: User pastes two lines in textarea

- **WHEN** user pastes "2024-01-01T00:00:00Z" on first line and "2024-01-15T00:00:00Z" on second line and runs datetime_diff
- **THEN** the system uses the first line as start and the second as end and returns the difference

#### Scenario: User fills form fields

- **WHEN** user fills the start and end form fields (and optionally uses textarea)
- **THEN** the system uses the form field values for start and end
