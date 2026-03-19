# 2 Agent Chat

A small TypeScript CLI app that uses the OpenAI Agents SDK to let one agent talk to another agent.

## What it does

- `Main Agent` is the user-facing assistant.
- `Research Agent` is a specialist the main agent can call as a tool.
- The CLI keeps chat history in memory for the current run.

## Prerequisites

- Node.js 20+
- An OpenAI API key

## Setup

```bash
cd "/Users/esia/repos/chat/2 agent chat"
cp .env.example .env
```

Add your API key to `.env`:

```env
OPENAI_API_KEY=your_real_api_key_here
```

Install dependencies:

```bash
npm install
```

## Run

Start the interactive chat:

```bash
npm run dev
```

Build and run the compiled app:

```bash
npm run build
npm start
```

## CLI commands

- `exit` or `quit`: leave the app
- `/reset`: clear the in-memory conversation
- `/help`: show the command list

## How the key is supplied

The app reads `OPENAI_API_KEY` from your environment. Because `src/index.ts` imports `dotenv/config`, values in `.env` are loaded automatically before the SDK is used.
