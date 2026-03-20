# 2 Agent Chat Learning Kit

A TypeScript project that teaches the main ways to make one OpenAI agent call subagents.

Instead of showing only one pattern, this repo compares the most useful orchestration styles side by side so you can learn when each one fits.

## The big idea

There are two broad ways to build multi-agent systems:

1. The model decides what happens next.
   - Example: the current agent calls a subagent as a tool.
   - Example: the current agent hands the conversation to another agent.
2. Your code decides what happens next.
   - Example: your app chooses the next agent after looking at a routing result.
   - Example: your app runs several agents in parallel and merges the results.
   - Example: your app loops a writer and reviewer until the output is good enough.

## Analogy-first map

| Pattern | Analogy | Who decides next step? | Best for |
| --- | --- | --- | --- |
| `agents-as-tools` | A team lead calls specialists but stays on the customer call | The model | One stable user-facing assistant |
| `handoff` | A receptionist transfers your call to a department | The model | Letting a specialist take over |
| `structured-handoff` | A nurse fills out an intake form before the specialist sees you | The model | Predictable transfers with typed metadata |
| `hybrid` | A receptionist transfers you to a consultant who then consults their own in-house experts | The model | Specialist ownership plus bounded subdelegation |
| `code-router` | A dispatcher chooses the next worker using a routing sheet | Your code | Deterministic routing and business logic |
| `parallel` | An editor sends the same story to several reviewers at once | Your code | Faster independent specialist work |
| `feedback-loop` | A writer and editor revise until the draft is ready | Your code | Quality-improving iterative workflows |

## Project structure

| File | Purpose |
| --- | --- |
| `src/index.ts` | CLI entry point |
| `src/patterns/agentsAsTools.ts` | Manager agent calls specialists as tools |
| `src/patterns/basicHandoff.ts` | Triage agent hands off to a specialist |
| `src/patterns/structuredHandoff.ts` | Handoff with typed intake data |
| `src/patterns/hybridHandoffWithTools.ts` | Handoff to a specialist that still uses agent-tools |
| `src/patterns/codeRouter.ts` | Your code routes to the next specialist |
| `src/patterns/parallelFanout.ts` | Your code runs multiple specialists in parallel |
| `src/patterns/feedbackLoop.ts` | Your code runs critique-and-revise loops |

## Prerequisites

- Node.js 22+
- An OpenAI API key

## Setup

```bash
cd "/Users/esia/repos/chat/2 agent chat"
cp .env.example .env
```

Then add your key:

```env
OPENAI_API_KEY=your_real_api_key_here
```

Install dependencies:

```bash
npm install
```

## Learn without spending tokens

These commands only print explanations. They do not call the API.

```bash
npm run tour
npm run explain agents-as-tools
npm run explain handoff
```

## Run demos

These commands call the OpenAI API.

```bash
npm run demo -- agents-as-tools "Help me compare two ways to learn TypeScript quickly."
npm run demo -- handoff "I was charged twice and now the app says my account is locked."
npm run demo -- structured-handoff "Plan me a 4-day Tokyo trip on a medium budget with vegetarian food options."
npm run demo -- hybrid "Plan a 5-day Kyoto trip for two people with a careful budget and food recommendations near train lines."
npm run demo -- code-router "Teach me closures in JavaScript, but point out common misconceptions too."
npm run demo -- parallel "Give me a balanced recommendation for starting a small online business."
npm run demo -- feedback-loop "Write a concise explanation of recursion for a beginner."
```

You can also skip the `demo` keyword:

```bash
npm run dev -- agents-as-tools
npm run dev -- handoff
```

## How the key is supplied

The project loads `OPENAI_API_KEY` from your environment through `dotenv/config`.

- `.env` is read automatically on startup.
- `src/lib/env.ts` validates the key and calls `setDefaultOpenAIKey(...)`.
- The SDK then uses that default key when `run(...)` invokes the model.

## Choosing the right pattern

### `agents-as-tools`

Pick this when you want one consistent assistant persona. The manager stays visible to the user and quietly consults specialists behind the scenes.

### `handoff`

Pick this when you want the specialist to become the active responder. The original agent is more like a receptionist than a manager.

### `structured-handoff`

Pick this when a transfer needs clean metadata, like urgency, budget, or a summary. This makes the transition feel less like a free-form chat and more like a proper intake process.

### `hybrid`

Pick this when the specialist should take over the conversation, but that specialist still needs a small backstage team. This is often the most realistic production shape for complex workflows.

### `code-router`

Pick this when you need deterministic application logic. Your app can inspect the routing result, apply rules, log decisions, or override them before calling the next subagent.

### `parallel`

Pick this when several specialists can work independently. It is often the best latency tradeoff for research, critique, and synthesis workflows.

### `feedback-loop`

Pick this when the first draft is rarely the final draft. A writer-reviewer loop is useful for polishing quality, but it should always have a maximum number of rounds.

## Scripts

```bash
npm run tour
npm run explain -- <pattern>
npm run demo -- <pattern> "your task"
npm run check
npm run build
npm start
```
