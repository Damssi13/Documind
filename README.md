# DocuMind

 
An AI-powered business document assistant built with RAG (Retrieval-Augmented Generation). Upload your PDFs and chat with them using natural language — all running locally for free.

## Features
 
- Upload PDF documents and index them automatically
- Chat with your documents using natural language
- Semantic search using vector embeddings
- Source citations showing which document the answer came from
- Fully local — no API keys, no billing, no data sent to the cloud
- Streaming answers powered by Llama 3.2 via Ollama

## Prerequisites
 
- Node.js v18+
- Docker & Docker Compose
- [Ollama](https://ollama.com) installed on your machine
- 8GB RAM minimum

## Getting Started
 
### 1. Clone the repository
 
```bash
git clone https://github.com/Damssi13/documind.git
cd documind
```

### 2. Pull the required Ollama models
 
```bash
ollama pull nomic-embed-text
ollama pull llama3.2
```

### 3. Start the database
 
```bash
docker run -d \
  --name documind-db \
  -e POSTGRES_USER=documind \
  -e POSTGRES_PASSWORD=documind123 \
  -e POSTGRES_DB=documind \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

### 4. Configure environment variables
 
```bash
cp .env.example .env
```
 
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=documind
DATABASE_PASSWORD=documind123
DATABASE_NAME=documind
 
OLLAMA_URL=http://localhost:11434
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=llama3.2
```
### 5. Start the backend
 
```bash
cd documind-backend
npm install
npm run start:dev
```

### 6. Start the frontend
 
```bash
cd documind-ui
npm install
PORT=3001 npm start
```

## API Reference
 
### Upload a document
 
```http
POST /document/upload
Content-Type: multipart/form-data
 
file: <your-pdf-file>
```
 
Response:
```json
{ "chunks": 12 }
```
 
### Ask a question
 
```http
POST /chat/ask
Content-Type: application/json
 
{ "question": "What are the key terms in this contract?" }
```
 
Response:
```json
{
  "answer": "The key terms include...",
  "sources": ["contract.pdf"]
}
```
=======

DocuMind is a document Q&A app:
- Backend: NestJS + TypeORM + PostgreSQL
- Frontend: React (CRA + TypeScript)
- LLM/Embeddings: Groq (chat) + Nomic Atlas embeddings

Upload PDF files, index them into semantic chunks, then ask questions grounded in uploaded content.

## Monorepo layout

- Backend API (this folder)
- Frontend app in [documind-ui](documind-ui)

## Requirements

- Node.js 20+
- PostgreSQL 14+
- NPM

## Environment variables (backend)

Create a `.env` file in the project root with:

```env
# Server
PORT=3000
FRONTEND_ORIGIN=http://localhost:3000,http://localhost:3001

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=documind

# AI Providers
GROQ_API_KEY=your_groq_key
NOMIC_API_KEY=your_nomic_key
```

## Environment variables (frontend)

Create `documind-ui/.env`:

```env
REACT_APP_API_URL=http://localhost:3000
```

## Install

From root:

```bash
npm install
cd documind-ui && npm install
```

## Run in development

Backend (root):

```bash
npm run start:dev
```

Frontend:

```bash
cd documind-ui
npm start
```

Default URLs:
- API: http://localhost:3000
- UI: http://localhost:3001 (CRA default can vary)

## API overview

### Upload a document

`POST /document/upload` (multipart/form-data)

Field name: `file` (PDF)

Response:

```json
{ "chunks": 42 }
```

### Ask a question

`POST /chat/ask`

Request:

```json
{ "question": "What are the payment terms?" }
```

Response:

```json
{
  "answer": "...",
  "sources": ["contract.pdf"]
}
```

## Scripts

Backend (root):
- `npm run start:dev` - start API in watch mode
- `npm run build` - compile backend
- `npm run test` - run unit tests
- `npm run test:e2e` - run e2e tests

Frontend ([documind-ui](documind-ui)):
- `npm start` - run React app
- `npm run build` - production build
- `npm test` - frontend tests

## Notes

- Current retrieval is in-memory cosine scoring after loading stored chunks.
- TypeORM is configured with `synchronize: true` for local development.
  Do not use that in production without migrations.
>>>>>>> 6b5cca6 (imporving the prompt so the assitant less robotic)
