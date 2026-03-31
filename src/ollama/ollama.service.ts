import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OllamaService {
  private readonly baseUrl: string;
  private readonly embedModel: string;
  private readonly llmModel: string;

  constructor(private config: ConfigService) {
    this.baseUrl = this.config.get<string>('OLLAMA_URL')!;
    this.embedModel = this.config.get<string>('OLLAMA_EMBED_MODEL')!;
    this.llmModel = this.config.get<string>('OLLAMA_LLM_MODEL')!;
  }

  async embed(text: string): Promise<number[]> {
    const res = await axios.post(`${this.baseUrl}/api/embeddings`, {
      model: this.embedModel,
      prompt: text,
    });
    return res.data.embedding;
  }

  async generate(prompt: string): Promise<string> {
    const res = await axios.post(`${this.baseUrl}/api/generate`, {
      model: this.llmModel,
      prompt,
      stream: false,
    });
    return res.data.response;
  }
}