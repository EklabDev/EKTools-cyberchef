## 1. Shared date-time data and presets

- [x] 1.1 Add lib/date-time/format-presets.ts with ~10 preset names and Luxon format token strings (e.g. ISO 8601, MM/DD/YYYY, DD MMM YYYY)
- [x] 1.2 Add lib/date-time/units.ts with canonical list: years, months, days, hours, minutes, seconds, milliseconds (for datetime_add and datetime_diff)
- [x] 1.3 Add lib/date-time/timezones.ts with IANA zones and display strings "CODE – Full Name" (or use Luxon-backed list); export for UI and handlers

## 2. Transformers: format, unit, and timestamp output

- [x] 2.1 Update lib/transformers/date.ts: datetimeToTimestamp to accept optional inputFormat (preset id or Luxon string) and outputUnit ('seconds' | 'milliseconds'); resolve preset to format before parsing
- [x] 2.2 Update lib/transformers/date.ts: timestampToDatetime to accept optional inputUnit ('seconds' | 'milliseconds') and optional outputFormat (preset id or Luxon string); resolve preset before toFormat
- [x] 2.3 Update lib/transformers/date.ts: datetimeAdd to accept durationAmount (number) and durationUnit (from canonical list) in addition to or instead of duration string; keep backward compat when duration string provided
- [x] 2.4 Update lib/transformers/date.ts: datetimeFormat to accept optional inputFormat and outputFormat (preset or custom); validate custom format before use; parse input with inputFormat when provided
- [x] 2.5 Ensure datetimeDiff uses same unit list from lib/date-time/units.ts for default and validation

## 3. MCP schemas and handlers

- [x] 3.1 Update mcp/date.ts: datetime_to_timestamp inputSchema with optional inputFormat, outputUnit; handler passes to transformer
- [x] 3.2 Update mcp/date.ts: timestamp_to_datetime inputSchema with optional inputUnit, outputFormat; handler passes to transformer
- [x] 3.3 Update mcp/date.ts: datetime_add inputSchema with optional durationAmount (number) and durationUnit (string from list), keep duration (string) optional for compat; handler maps to transformer
- [x] 3.4 Update mcp/date.ts: datetime_format inputSchema with optional inputFormat and outputFormat; handler passes to transformer
- [x] 3.5 Ensure timezone_convert and all tools that take zone accept same IANA zone values (no schema change required if already string)

## 4. CyberChef UI: format and unit controls

- [x] 4.1 In CyberChef (or shared param renderer), add support for format fields: render select with preset options plus "Custom" with text input; validate custom format on blur or before run
- [x] 4.2 Add timezone combobox: searchable list with "CODE – Full Name", value = IANA zone; use for zone, fromZone, toZone params when present
- [x] 4.3 Add duration+unit: for datetime_add render duration (number input) and unit (select from lib/date-time/units); map to durationAmount and durationUnit (and/or legacy duration string if needed)
- [x] 4.4 For datetime_diff render units as multi-select or comma-separated select from same unit list; pass as array to handler
- [x] 4.5 Wire timestamp output unit (seconds/milliseconds) for datetime_to_timestamp and input unit for timestamp_to_datetime as select
- [x] 4.6 Wire input/output format for datetime_format with preset select + custom input and validation

## 5. Validation and edge cases

- [x] 5.1 Add format validation helper (try Luxon format on fixed date) and use in UI and optionally in handlers for custom format
- [x] 5.2 Ensure datetime_diff start/end from textarea (two lines) still works; form params override textarea when both present
- [x] 5.3 Add tests for new transformer options (format, unit, seconds vs ms) and for shared unit/list behavior
