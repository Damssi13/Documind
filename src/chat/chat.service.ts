import { Injectable } from '@nestjs/common';
import { OllamaService } from '../ollama/ollama.service';
import { DocumentService } from '../document/document.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly ollama: OllamaService,
    private readonly documentService: DocumentService,
  ) {}

  async ask(question: string): Promise<{ answer: string; sources: string[] }> {
    const queryEmbedding = await this.ollama.embed(question);
    const chunks = await this.documentService.similaritySearch(queryEmbedding);

    const context = chunks.map(c => c.content).join('\n\n---\n\n');
    const sources = [...new Set(chunks.map(c => c.filename))];

    const prompt = `You are a helpful business document assistant.
Use ONLY the context below to answer the question.
If the answer is not in the context, say "I don't have that information."

Context:
${context}

Question: ${question}

Answer:`;

    const answer = await this.ollama.generate(prompt);
    return { answer, sources };
  }
}