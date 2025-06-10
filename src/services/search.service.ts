import { OpenAI } from 'openai';
import axios from 'axios';
import config from '../config';

type SearchResult = {
  url: string;
  title: string;
  content: string;
};

type ResearchContext = {
  query: string;
  depth: number;
  breadth: number;
  results: SearchResult[];
  learnings: string[];
};

export class SearchService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
  }

  async searchWeb(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get('https://api.searxng.org/search', {
        params: {
          q: query,
          format: 'json'
        }
      });
      
      return response.data.results.map((result: any) => ({
        url: result.url,
        title: result.title,
        content: result.content
      }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  async analyzeContent(content: string, context: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a research assistant. Analyze the following content and extract key insights.'
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nContent: ${content}`
        }
      ],
      temperature: 0.3
    });

    return response.choices[0].message.content || '';
  }

  async generateFollowUpQuestions(context: ResearchContext): Promise<string[]> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Generate follow-up research questions based on current findings.'
        },
        {
          role: 'user',
          content: `Current research context:\nQuery: ${context.query}\nDepth: ${context.depth}\nFindings: ${context.learnings.join('\n')}`
        }
      ],
      temperature: 0.5
    });

    const questions = response.choices[0].message.content?.split('\n') || [];
    return questions.filter(q => q.trim().length > 0);
  }
}
