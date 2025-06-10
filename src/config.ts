import dotenv from 'dotenv';

dotenv.config();

interface Config {
  openaiApiKey: string;
  searchApiKey: string;
  port: number;
  maxDepth: number;
  maxBreadth: number;
}

const config: Config = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  searchApiKey: process.env.SEARCH_API_KEY || '',
  port: parseInt(process.env.PORT || '3000'),
  maxDepth: parseInt(process.env.MAX_DEPTH || '3'),
  maxBreadth: parseInt(process.env.MAX_BREADTH || '5')
};

export default config;