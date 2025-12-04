import { z } from "zod";
import { ToolDefinition } from "./tools";
import * as transformers from "../lib/transformers/convert";

export const tools: ToolDefinition[] = [
  {
    name: "bytes_to_utf8",
    description: "Convert Bytes (decimal string) to UTF-8 text",
    inputSchema: z.object({ input: z.string(), delimiter: z.string().optional() }),
    handler: async (args) => {
      try { return { output: transformers.bytesToText(args.input, args.delimiter) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "utf8_to_bytes",
    description: "Convert UTF-8 text to Bytes (decimal string)",
    inputSchema: z.object({ input: z.string(), delimiter: z.string().optional() }),
    handler: async (args) => {
      try { return { output: transformers.textToBytes(args.input, args.delimiter) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "endian_swap",
    description: "Swap Endianness of Hex string. Width in bytes (default 4).",
    inputSchema: z.object({ input: z.string(), width: z.number().optional() }),
    handler: async (args) => {
      try { return { output: transformers.endiannessSwap(args.input, args.width) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "number_base_convert",
    description: "Convert number base. Support 2-36.",
    inputSchema: z.object({
      input: z.string(),
      fromBase: z.number(),
      toBase: z.number()
    }),
    handler: async (args) => {
      try { return { output: transformers.numberBaseConvert(args.input, args.fromBase, args.toBase) }; }
      catch (e: any) { return { error: e.message }; }
    }
  }
];


