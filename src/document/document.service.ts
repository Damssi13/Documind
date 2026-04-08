import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { OllamaService } from '../ollama/ollama.service';
const PDFParser = require('pdf2json');

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly docRepo: Repository<Document>,
    private readonly ollama: OllamaService,
  ) {}

private parsePdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();
    parser.on('pdfParser_dataReady', (data) => {
      const text = data.Pages.map((page) =>
        page.Texts.map((t) => {
          try {
            return decodeURIComponent(t.R[0].T);
          } catch {
            return t.R[0].T;
          }
        }).join(' ')
      ).join('\n');
      resolve(text);
    });
    parser.on('pdfParser_dataError', reject);
    parser.parseBuffer(buffer);
  });
}

  private chunkText(text: string, size = 300, overlap = 100): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      chunks.push(text.slice(start, start + size));
      start += size - overlap;
    }
    return chunks;
  }

async ingest(file: Express.Multer.File): Promise<{ chunks: number }> {
  const text = await this.parsePdf(file.buffer);
  const chunks = this.chunkText(text);

  // embed all chunks in one API call
  const embeddings = await this.ollama.embedBatch(chunks);

  for (let i = 0; i < chunks.length; i++) {
    const doc = this.docRepo.create({
      filename: file.originalname,
      content: chunks[i],
      chunkIndex: i,
      embedding: embeddings[i],
    });
    await this.docRepo.save(doc);
  }

  return { chunks: chunks.length };
}

  async similaritySearch(queryEmbedding: number[], topK = 10): Promise<Document[]> {
    const all = await this.docRepo.find();
    const scored = all.map((doc) => ({
      doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((s) => s.doc);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }
}