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
  const queryEmbedding = await this.ollama.embedQuery(question);
  const chunks = await this.documentService.similaritySearch(queryEmbedding);

  const context = chunks.map((c, i) => `[${i + 1}]: ${c.content}`).join('\n\n');
  const sources = [...new Set(chunks.map(c => c.filename))];

  const prompt = `You are a document assistant. the user is going to ask you questions about the documents it is uploaded
chat with him as a human
Do not say information is missing if it appears anywhere in the excerpts.
If you truly cannot find what the user asks for, say "Not found in the document."

Excerpts:
${context}

Question: ${question}
Answer:`;

  const answer = await this.ollama.generate(prompt);
  return { answer, sources };
}
}