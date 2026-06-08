import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AuthService } from "./auth/auth-service.js";
import { KaneoClient } from "./solarplan/client.js";
import { registerTools } from "./tools/register.js";
import { normalizeBaseUrl } from "./utils/normalize-base-url.js";

const require = createRequire(import.meta.url);
const { version: packageVersion } = require("../package.json") as {
  version: string;
};

export function createMcpServer(): McpServer {
  const baseUrl = normalizeBaseUrl(
    process.env.SOLARPLAN_API_URL || "http://localhost:1337",
  );
  const clientId = process.env.KANEO_MCP_CLIENT_ID || "solarplan-mcp";
  const auth = new AuthService({ baseUrl, clientId });
  const client = new KaneoClient({ baseUrl, auth });
  const server = new McpServer({
    name: "solarplan-mcp",
    version: packageVersion,
  });
  registerTools(server, { client });
  return server;
}
