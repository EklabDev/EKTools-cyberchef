import { z } from "zod";
import { ToolDefinition } from "./tools";
import * as transformers from "../lib/transformers/crypto";

export const tools: ToolDefinition[] = [
  {
    name: "aes_encrypt",
    description: "AES Encrypt (CBC/CTR). Default mode: CBC.",
    inputSchema: z.object({
      input: z.string(),
      key: z.string(),
      iv: z.string().optional(),
      mode: z.enum(['CBC', 'CTR']).optional()
    }),
    handler: async (args) => {
      try {
        return { output: transformers.aesEncrypt(args.input, args.key, args.iv, args.mode) };
      } catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "aes_decrypt",
    description: "AES Decrypt (CBC/CTR). Default mode: CBC.",
    inputSchema: z.object({
      input: z.string(),
      key: z.string(),
      iv: z.string().optional(),
      mode: z.enum(['CBC', 'CTR']).optional()
    }),
    handler: async (args) => {
      try {
        return { output: transformers.aesDecrypt(args.input, args.key, args.iv, args.mode) };
      } catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "rsa_encrypt",
    description: "RSA Encrypt (OAEP). Requires Public Key PEM.",
    inputSchema: z.object({
      input: z.string(),
      publicKey: z.string()
    }),
    handler: async (args) => {
      try {
        return { output: transformers.rsaEncrypt(args.input, args.publicKey) };
      } catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "rsa_decrypt",
    description: "RSA Decrypt (OAEP). Requires Private Key PEM.",
    inputSchema: z.object({
      input: z.string(),
      privateKey: z.string()
    }),
    handler: async (args) => {
      try {
        return { output: transformers.rsaDecrypt(args.input, args.privateKey) };
      } catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "sha_hash",
    description: "Calculate SHA/MD5 Hash. Algos: SHA1, SHA256, SHA512, MD5.",
    inputSchema: z.object({
      input: z.string(),
      algo: z.enum(['SHA1', 'SHA256', 'SHA512', 'MD5'])
    }),
    handler: async (args) => {
      try {
        return { output: transformers.shaHash(args.input, args.algo) };
      } catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "hmac",
    description: "Calculate HMAC. Algos: SHA1, SHA256, SHA512, MD5.",
    inputSchema: z.object({
      input: z.string(),
      key: z.string(),
      algo: z.enum(['SHA1', 'SHA256', 'SHA512', 'MD5'])
    }),
    handler: async (args) => {
      try {
        return { output: transformers.hmac(args.input, args.key, args.algo) };
      } catch (e: any) { return { error: e.message }; }
    }
  }
];


