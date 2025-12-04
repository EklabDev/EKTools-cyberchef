# Mini CyberChef + MCP Server

A "Mini CyberChef" application built with Next.js 15, TypeScript, and TailwindCSS.
It functions as both a **Standalone Web App** and an **MCP Server** exposing transformation tools to AI agents.

## 🚀 Getting Started

### 1. Standalone Web App

To run the web interface:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. MCP Server

To run the MCP server (Stdio transport):

```bash
pnpm start:mcp
```

This allows MCP clients (like Claude Desktop or Cursor) to connect to the server via standard input/output.

## 🛠️ Features

### Core Categories
- **Encoding**: Base64, Base32, URL, HTML, Hex, Binary
- **Encryption**: AES (CBC/CTR), RSA, SHA Hashing, HMAC
- **Conversion**: Text/Bytes, Hex/Bytes, Number Base, Endianness
- **Date & Time**: Timestamp conversions, Timezones, Date Arithmetic
- **Binary**: XOR, Bitwise ops, CRC32, Adler32

### MCP Tools
All transformations are exposed as MCP tools.
Example Tools:
- `base64_encode`
- `aes_encrypt`
- `timestamp_to_datetime`
- `xor`

## 🧩 Architecture

```mermaid
graph TD
    A[User Interface (Next.js)] -->|Calls| B[Lib/Transformers]
    C[MCP Server (Node)] -->|Calls| B
    B --> D[CryptoJS / Luxon / etc]
    
    subgraph "Shared Logic"
    B
    end
    
    subgraph "Entry Points"
    A
    C
    end
```

- **`app/`**: Next.js App Router UI
- **`lib/transformers/`**: Core logic (Isomorphic where possible)
- **`mcp/`**: MCP Server implementation (Tool Definitions & Handler)
- **`scripts/`**: Utility scripts

## 📝 How to Add a New Transformer

1. **Implement Logic**: Add function to `lib/transformers/<category>.ts`
2. **Define Tool**: Add tool definition to `mcp/<category>.ts` (Name, Schema, Handler)
3. **Register**: Ensure it's exported in `mcp/index.ts` and `lib/all-tools.ts`
4. **UI**: The UI automatically picks up the new tool from `lib/all-tools.ts`

## 🧪 Testing

Run unit tests:

```bash
npx jest
```

(Playwright tests pending setup)
