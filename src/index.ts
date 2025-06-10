import MCPServer from './mcp.server';
import config from './config';

// Check required environment variables
if (!config.openaiApiKey) {
  console.error('OPENAI_API_KEY is required');
  process.exit(1);
}

if (!config.searchApiKey) {
  console.warn('SEARCH_API_KEY is not set, using public search APIs');
}

// Start the server
const server = new MCPServer();
server.start();