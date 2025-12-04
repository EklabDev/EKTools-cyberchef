import { z } from "zod";
import { ToolDefinition } from "./tools";
import * as transformers from "../lib/transformers/encoding";

export const tools: ToolDefinition[] = [
  {
    name: "base64_encode",
    description: "Encode text to Base64",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.base64Encode(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "base64_decode",
    description: "Decode Base64 to text",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.base64Decode(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "base32_encode",
    description: "Encode text to Base32",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.base32Encode(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "base32_decode",
    description: "Decode Base32 to text",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.base32Decode(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "url_encode",
    description: "URL Encode text",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.urlEncode(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "url_decode",
    description: "URL Decode text",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.urlDecode(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "html_escape",
    description: "Escape HTML entities",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.htmlEntityEncode(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "html_unescape",
    description: "Unescape HTML entities",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.htmlEntityDecode(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "text_to_hex",
    description: "Convert text to Hex",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.textToHex(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "hex_to_text",
    description: "Convert Hex to text",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.hexToText(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "binary_to_text",
    description: "Convert Binary string to text",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.binaryToText(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "text_to_binary",
    description: "Convert text to Binary string",
    inputSchema: z.object({ input: z.string() }),
    handler: async ({ input }) => {
      try { return { output: transformers.textToBinary(input) }; }
      catch (e: any) { return { error: e.message }; }
    }
  }
];


