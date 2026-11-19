#!/usr/bin/env node
// Chạy máy chủ MCP qua stdio: `npx -y @nhatnguyet/mcp`.
// Run the Nhat Nguyet MCP server over stdio.

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.ts";

await createServer().connect(new StdioServerTransport());
