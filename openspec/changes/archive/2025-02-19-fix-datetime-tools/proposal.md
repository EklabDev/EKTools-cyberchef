## Why

The Date & Time tools are currently hard to use: users must guess datetime formats, remember timezone codes, and type duration as free text. Enhancing them with explicit format selection, timezone autocomplete, structured duration inputs, and format validation will make the tools discoverable and reliable without memorizing codes or syntax.

## What Changes

- **datetime_to_timestamp**
  - Input: user selects datetime format from a fixed set (e.g. ISO 8601, DD/MM/YY, DD MMM YYYY, etc.; support up to ~10 common types). Parser uses the selected format.
  - Output: user chooses timestamp in **seconds** or **milliseconds**.

- **timestamp_to_datetime**
  - Input: user chooses whether timestamp is in seconds or milliseconds.
  - Output: user selects datetime format from the same ~10 format types for display.

- **Timezone inputs (all tools that use zone)**
  - Replace free-text timezone with **autocomplete**: searchable list showing 3-letter code plus full name (e.g. "UTC – Coordinated Universal Time", "PST – Pacific Standard Time"). User can search and choose instead of typing unknown codes.

- **datetime_add**
  - Replace single "duration" text with **two inputs**: (1) **duration** (numeric), (2) **unit** (select: e.g. days, hours, years, months, minutes, seconds, milliseconds). Unit set must match the units used in datetime_diff for consistency.

- **datetime_diff**
  - Keep existing behavior; **unit** options (select) must be the same set as datetime_add (days, hours, years, months, minutes, seconds, milliseconds, etc.) so both tools share one canonical unit list.

- **datetime_format**
  - **Input format** and **output format**: support free-text with validation (e.g. Luxon tokens), plus **autocomplete** for ~10 common format presets (same set as datetime_to_timestamp / timestamp_to_datetime) so users can pick a known format or enter a custom one.

- **General**
  - Tools that accept a single main "input" (e.g. datetime_diff with start/end) continue to support pasting two lines in the main textarea where applicable; UX improvements above do not remove that.

No **BREAKING** changes to MCP/API contracts: existing tool names and result shapes stay the same; only input UX and optional parameters (e.g. format, unit) are added or made explicit.

## Capabilities

### New Capabilities

- **date-time-tools**: Enhanced Date & Time tool UX in the CyberChef UI and backing logic: format selection (input/output) for datetime ↔ timestamp and datetime_format; timezone autocomplete; structured duration (value + unit) for datetime_add; shared unit select for datetime_add and datetime_diff; optional format presets (~10) with validation and autocomplete.

### Modified Capabilities

- *(None – no existing specs in `openspec/specs/`.)*

## Impact

- **UI**: `app/components/CyberChef.tsx` (and any shared form components) – format selects, timezone autocomplete, duration + unit inputs, format input/output with validation and preset autocomplete.
- **Tools / MCP**: `mcp/date.ts` – input schemas and handlers updated to accept format, unit, and timezone choices; preserve backward compatibility where callers omit new fields.
- **Transformers**: `lib/transformers/date.ts` – support for explicit input/output formats, seconds vs milliseconds, and structured duration (numeric + unit); timezone handling unchanged in contract.
- **Data**: Shared lists for timezones (e.g. IANA or Luxon list), format presets (~10), and units (shared between datetime_add and datetime_diff) – can live in `lib/` or alongside date tools.
- **Dependencies**: No new runtime dependencies required; Luxon already used for parsing/formatting. Autocomplete can use existing UI patterns (e.g. combobox/select with search).
