# OpenAlex AI Agent

Simple tool-calling agent for exploring academic papers using OpenAlex API.

## Setup

1. **Install dependencies:**
```bash
bun install
```

2. **Add environment variables:**
```bash
cp .env.example .env
# Add your OpenAI API key to .env
```

3. **Start server:**
```bash
bun run dev
```

## Usage

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Find papers by David Deutsch"}'
```

## Supported Tools

- `searchAuthors(authorName)` - Find authors by name
- `getAuthorWorks(authorId)` - Get papers by a specific author
- `searchWorks(workTitle)` - Search for papers by title
- `getWorkCitations(workId)` - Get papers that cite a specific work
