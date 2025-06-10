import express from 'express';
import { ModelContextProtocolServer } from '@modelcontextprotocol/client';
import { SearchService } from './services/search.service';
import config from './config';

class MCPServer {
  private app: express.Application;
  private mcpServer: ModelContextProtocolServer;
  private searchService: SearchService;

  constructor() {
    this.app = express();
    this.mcpServer = new ModelContextProtocolServer();
    this.searchService = new SearchService();

    this.setupMiddleware();
    this.setupRoutes();
    this.registerTools();
  }

  private setupMiddleware() {
    this.app.use(express.json());
  }

  private setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
  }

  private registerTools() {
    this.mcpServer.registerTool({
      name: 'deep-search',
      description: 'Perform deep web research using LLM and search APIs',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Research query' },
          depth: { type: 'number', description: 'Research depth level', default: 1 },
          breadth: { type: 'number', description: 'Number of parallel searches', default: 3 }
        },
        required: ['query']
      },
      execute: async (params: any) => {
        const { query, depth = 1, breadth = 3 } = params;
        return this.performDeepSearch(query, depth, breadth);
      }
    });
  }

  private async performDeepSearch(query: string, depth: number, breadth: number): Promise<any> {
    const context = {
      query,
      depth,
      breadth,
      results: [] as any[],
      learnings: [] as string[]
    };

    for (let d = 0; d < depth; d++) {
      const searchResults = await this.searchService.searchWeb(query);
      context.results.push(...searchResults);

      for (const result of searchResults.slice(0, breadth)) {
        const analysis = await this.searchService.analyzeContent(result.content, query);
        context.learnings.push(analysis);
      }

      if (d < depth - 1) {
        const followUps = await this.searchService.generateFollowUpQuestions(context);
        query = followUps[0] || query;
      }
    }

    return {
      query: context.query,
      depth,
      breadth,
      learnings: context.learnings,
      sources: context.results.map(r => r.url)
    };
  }

  public start() {
    this.mcpServer.attach(this.app);
    this.app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`MCP tools available at /mcp/tools`);
    });
  }
}

export default MCPServer;