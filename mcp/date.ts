import { z } from "zod";
import { ToolDefinition } from "./tools";
import * as transformers from "../lib/transformers/date";
import { DURATION_UNITS } from "../lib/date-time/units";

const durationUnitEnum = z.enum(DURATION_UNITS as unknown as [string, ...string[]]);

export const tools: ToolDefinition[] = [
  {
    name: "timestamp_to_datetime",
    description: "Convert timestamp to Human Datetime.",
    inputSchema: z.object({
      input: z.union([z.string(), z.number()]),
      zone: z.string().optional(),
      inputUnit: z.enum(['seconds', 'milliseconds']).optional(),
      outputFormat: z.string().optional(),
    }),
    handler: async (args) => {
      try { return { output: transformers.timestampToDatetime(args.input, args.zone, args.inputUnit, args.outputFormat) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "datetime_to_timestamp",
    description: "Convert Human Datetime to Timestamp.",
    inputSchema: z.object({
      input: z.string(),
      zone: z.string().optional(),
      inputFormat: z.string().optional(),
      outputUnit: z.enum(['seconds', 'milliseconds']).optional(),
    }),
    handler: async (args) => {
      try { return { output: transformers.datetimeToTimestamp(args.input, args.zone, args.inputFormat, args.outputUnit) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "timezone_convert",
    description: "Convert Datetime between timezones.",
    inputSchema: z.object({ input: z.string(), fromZone: z.string(), toZone: z.string() }),
    handler: async (args) => {
      try { return { output: transformers.timezoneConvert(args.input, args.fromZone, args.toZone) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "datetime_add",
    description: "Add duration to Datetime.",
    inputSchema: z.object({
      input: z.string(),
      duration: z.string().optional(),
      zone: z.string().optional(),
      durationAmount: z.number().optional(),
      durationUnit: durationUnitEnum.optional(),
    }),
    handler: async (args) => {
      try { return { output: transformers.datetimeAdd(args.input, args.duration, args.zone, args.durationAmount, args.durationUnit) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "datetime_diff",
    description: "Difference between two datetimes.",
    inputSchema: z.object({
      start: z.string(),
      end: z.string(),
      units: z.array(durationUnitEnum).optional(),
    }),
    handler: async (args) => {
      try { return { output: transformers.datetimeDiff(args.start, args.end, args.units) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "datetime_format",
    description: "Format Datetime using format strings or presets.",
    inputSchema: z.object({
      input: z.string(),
      outputFormat: z.string(),
      zone: z.string().optional(),
      inputFormat: z.string().optional(),
    }),
    handler: async (args) => {
      try { return { output: transformers.datetimeFormat(args.input, args.format, args.zone, args.inputFormat) }; }
      catch (e: any) { return { error: e.message }; }
    }
  }
];
