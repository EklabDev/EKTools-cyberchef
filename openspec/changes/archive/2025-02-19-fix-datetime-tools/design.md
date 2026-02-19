## Context

Date & Time tools live in `mcp/date.ts` (tool definitions and handlers), `lib/transformers/date.ts` (Luxon-based logic), and `app/components/CyberChef.tsx` (dynamic form from Zod schemas). The UI currently renders one input per schema key (text/number/select from type inference). There is no shared data module for timezones, format presets, or duration units; formats and zones are free text. This change adds structured inputs (format select, timezone autocomplete, duration + unit, format presets) without changing tool names or result shapes.

## Goals / Non-Goals

**Goals:**
- Let users choose datetime input/output format from ~10 presets and optionally custom (Luxon tokens) with validation.
- Let users choose timestamp unit (seconds vs milliseconds) for datetime ↔ timestamp tools.
- Provide timezone autocomplete (3-letter code + full name, searchable) for all tools that take a zone.
- Split datetime_add into duration (number) + unit (select); share the same unit list with datetime_diff.
- Support free-text format with validation and preset autocomplete for datetime_format (input + output format).

**Non-Goals:**
- Changing MCP/API contracts or tool names; backward compatibility when new params are omitted.
- Adding new runtime dependencies; use Luxon and existing UI patterns only.
- Changing behavior of tools that already work (e.g. datetime_diff start/end from textarea or params).

## Decisions

1. **Where to define presets and lists**  
   - **Decision:** Add `lib/date-time/` (or similar) with `format-presets.ts`, `timezones.ts`, and `units.ts` so CyberChef and MCP can share the same canonical lists.  
   - **Rationale:** Single source of truth for ~10 format presets, IANA timezones (e.g. via Luxon), and duration/diff units; avoids drift between UI and handlers.  
   - **Alternative:** Inline in CyberChef only — rejected because MCP handlers need to interpret format/unit names consistently.

2. **Timezone list source**  
   - **Decision:** Use Luxon’s `DateTime.now().setZone(zone).isValid` plus a static list of common IANA zones (or Luxon’s built-in list if exposed) to drive autocomplete; display as "CODE – Full Name" (e.g. "UTC – Coordinated Universal Time").  
   - **Rationale:** No new dependency; Luxon already used. If Luxon doesn’t expose a full list, maintain a curated list of common zones in `lib/date-time/timezones.ts`.  
   - **Alternative:** External API for timezones — rejected to avoid network and extra dependency.

3. **Format presets**  
   - **Decision:** ~10 named presets (e.g. ISO 8601, DD/MM/YY, DD MMM YYYY, etc.) each mapping to a Luxon format string; store in `lib/date-time/format-presets.ts`. Preset id + optional custom format string passed through schema; transformer resolves preset id to format string before calling Luxon.  
   - **Rationale:** Same preset set for datetime_to_timestamp, timestamp_to_datetime, and datetime_format; custom format still supported for power users.  
   - **Alternative:** Only free-text format — rejected because proposal asks for discoverable presets.

4. **Duration units**  
   - **Decision:** One shared list: years, months, days, hours, minutes, seconds, milliseconds (Luxon-supported units). Used for both datetime_add (duration + unit) and datetime_diff (units select). Define in `lib/date-time/units.ts`.  
   - **Rationale:** Keeps datetime_add and datetime_diff consistent and avoids maintaining two lists.  
   - **Alternative:** Separate lists — rejected per proposal.

5. **UI for autocomplete**  
   - **Decision:** Use a combobox-style control: filterable list (by code or name), single selection, display "CODE – Full Name" for timezones and preset label (and optionally token string) for formats. Implement within existing CyberChef param-render path (e.g. detect zone/format fields and render combobox instead of plain input).  
   - **Rationale:** No new component library; keep patterns consistent with existing selects.  
   - **Alternative:** Full design-system combobox — use only if already present in the app.

6. **Backward compatibility**  
   - **Decision:** All new parameters (inputFormat, outputFormat, outputTimestampUnit, duration amount/unit, timezone as code) optional or with defaults. If omitted, preserve current behavior (e.g. ISO parse, milliseconds, free-text duration).  
   - **Rationale:** Proposal explicitly requires no breaking changes to MCP/API.

## Risks / Trade-offs

- **Risk:** Timezone list may be incomplete or outdated.  
  **Mitigation:** Prefer Luxon-backed list; document that list is curated if maintained manually.

- **Risk:** Custom format strings can be invalid and cause runtime errors.  
  **Mitigation:** Validate format (e.g. try Luxon format on a fixed date) before run; show validation error in UI and return clear error from handler.

- **Trade-off:** More schema fields and UI branches may make CyberChef.tsx harder to maintain.  
  **Mitigation:** Extract date-time param rendering (format select, timezone combobox, duration+unit) into a small helper or subcomponent; keep main loop simple.

## Migration Plan

- Deploy as a single release: new params are additive; existing callers unchanged.
- No data migration; no feature flags required.
- Rollback: revert deploy; old clients continue to work.

## Open Questions

- Exact list of ~10 format preset names and Luxon token strings to be fixed in implementation (design can reference "e.g. ISO 8601, DD/MM/YY, DD MMM YYYY").
- Whether to expose timezone list from a single Luxon API or maintain a static file; confirm during implementation.
