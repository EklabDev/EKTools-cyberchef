import { z } from "zod";
import { ToolDefinition } from "./tools";
import * as transformers from "../lib/transformers/binary";

export const tools: ToolDefinition[] = [
  {
    name: "xor",
    description: "XOR input with key. Returns Hex string.",
    inputSchema: z.object({ input: z.string(), key: z.string() }),
    handler: async (args) => {
      try { return { output: transformers.xor(args.input, args.key) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "bitwise_op",
    description: "Bitwise AND/OR/NOT. Returns Hex string.",
    inputSchema: z.object({ input: z.string(), op: z.enum(['AND', 'OR', 'NOT']), value: z.string().optional() }),
    handler: async (args) => {
      try { return { output: transformers.bitwiseOp(args.input, args.op, args.value) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "bitwise_shift",
    description: "Bitwise Shift Left/Right. Returns Hex string.",
    inputSchema: z.object({ input: z.string(), shift: z.number(), direction: z.enum(['Left', 'Right']) }),
    handler: async (args) => {
      try { return { output: transformers.bitwiseShift(args.input, args.shift, args.direction) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "crc32",
    description: "CRC32 Checksum (Hex).",
    inputSchema: z.object({ input: z.string() }),
    handler: async (args) => {
      try { return { output: transformers.crc32(args.input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "adler32",
    description: "Adler32 Checksum (Hex).",
    inputSchema: z.object({ input: z.string() }),
    handler: async (args) => {
      try { return { output: transformers.adler32(args.input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  }
];


