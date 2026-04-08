import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import axios from 'axios';

@Injectable()
export class OllamaService {
  private readonly groq: Groq;
  private readonly nomicApiKey: string;

  constructor(private config: ConfigService) {
    this.groq = new Groq({
      apiKey: this.config.get<string>('GROQ_API_KEY')!,
    });
    this.nomicApiKey = this.config.get<string>('NOMIC_API_KEY')!;
  }

  async embed(text: string): Promise<number[]> {
    return (await this.embedBatch([text]))[0];
  }

  async embedBatch(texts: string[], taskType = 'search_document'): Promise<number[][]> {
    const res = await axios.post(
      'https://api-atlas.nomic.ai/v1/embedding/text',
      {
        model: 'nomic-embed-text-v1.5',
        texts,
        task_type: taskType,
      },
      {
        headers: {
          Authorization: `Bearer ${this.nomicApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return res.data.embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    return (await this.embedBatch([text], 'search_query'))[0];
  }

  async generate(prompt: string): Promise<string> {
    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    });
    return response.choices[0].message.content ?? '';
  }
}