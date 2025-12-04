import { z } from "zod";
import { ToolDefinition } from "./tools";
import * as transformers from "../lib/transformers/date";

export const tools: ToolDefinition[] = [
  {
    name: "timestamp_to_datetime",
    description: "Convert timestamp (ms/sec) to Human Datetime (ISO).",
    inputSchema: z.object({ input: z.union([z.string(), z.number()]), zone: z.string().optional() }),
    handler: async (args) => {
      try { return { output: transformers.timestampToDatetime(args.input, args.zone) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "datetime_to_timestamp",
    description: "Convert Human Datetime to Timestamp (ms).",
    inputSchema: z.object({ input: z.string(), zone: z.string().optional() }),
    handler: async (args) => {
      try { return { output: transformers.datetimeToTimestamp(args.input, args.zone) }; }
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
    description: "Add duration to Datetime (e.g. '3 days', '-1 hour').",
    inputSchema: z.object({ input: z.string(), duration: z.string(), zone: z.string().optional() }),
    handler: async (args) => {
      try { return { output: transformers.datetimeAdd(args.input, args.duration, args.zone) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "datetime_diff",
    description: "Difference between two datetimes.",
    inputSchema: z.object({ start: z.string(), end: z.string(), units: z.array(z.string()).optional() }),
    handler: async (args) => {
      try { return { output: transformers.datetimeDiff(args.start, args.end, args.units) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "datetime_format",
    description: "Format Datetime using Luxon format strings.",
    inputSchema: z.object({ input: z.string(), format: z.string(), zone: z.string().optional() }),
    handler: async (args) => {
      try { return { output: transformers.datetimeFormat(args.input, args.format, args.zone) }; }
      catch (e: any) { return { error: e.message }; }
    }
  }
];


