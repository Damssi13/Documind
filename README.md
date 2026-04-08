# DocuMind

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
- npm

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

