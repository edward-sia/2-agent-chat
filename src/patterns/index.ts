import type { PatternDefinition, PatternId } from "../lib/types.js";
import { runAgentsAsTools } from "./agentsAsTools.js";
import { runBasicHandoff } from "./basicHandoff.js";
import { runStructuredHandoff } from "./structuredHandoff.js";
import { runCodeRouter } from "./codeRouter.js";
import { runParallelFanout } from "./parallelFanout.js";
import { runFeedbackLoop } from "./feedbackLoop.js";

export const patterns: PatternDefinition[] = [
  {
    id: "agents-as-tools",
    title: "Agents As Tools",
    analogy: "A team lead calls in specialists, but the team lead stays on the call with the customer.",
    whoDecides: "The model decides",
    summary: "The main agent keeps control and consults one or more subagents as tools.",
    whenToUse: "Use this when you want one consistent front-of-house assistant.",
    defaultTask: "Help me compare two ways to learn TypeScript quickly.",
    run: runAgentsAsTools
  },
  {
    id: "handoff",
    title: "Basic Handoff",
    analogy: "A receptionist transfers your call to the right department.",
    whoDecides: "The model decides",
    summary: "A triage agent routes the conversation to a specialist who takes over the response.",
    whenToUse: "Use this when the specialist should become the new active speaker.",
    defaultTask: "I was charged twice and now the app also says my account is locked.",
    run: runBasicHandoff
  },
  {
    id: "structured-handoff",
    title: "Structured Handoff",
    analogy: "A nurse fills out an intake form before sending you to the specialist.",
    whoDecides: "The model decides",
    summary: "A handoff carries structured arguments so the transfer is cleaner and more predictable.",
    whenToUse: "Use this when the receiving agent needs a compact, typed briefing.",
    defaultTask: "Plan me a 4-day Tokyo trip on a medium budget with vegetarian food options.",
    run: runStructuredHandoff
  },
  {
    id: "code-router",
    title: "Code Router",
    analogy: "A dispatcher chooses the next worker based on a routing sheet, not by letting the workers call each other directly.",
    whoDecides: "Your code decides",
    summary: "Your application asks a routing agent what to do, then chooses and runs the next subagent itself.",
    whenToUse: "Use this when you want deterministic control or custom business logic between steps.",
    defaultTask: "Teach me closures in JavaScript, but point out common misconceptions too.",
    run: runCodeRouter
  },
  {
    id: "parallel",
    title: "Parallel Fan-Out",
    analogy: "An editor sends the same story to three reviewers at once, then merges the notes.",
    whoDecides: "Your code decides",
    summary: "Multiple subagents run at the same time and a final agent combines their results.",
    whenToUse: "Use this when specialist work can be done independently and latency matters.",
    defaultTask: "Give me a balanced recommendation for starting a small online business.",
    run: runParallelFanout
  },
  {
    id: "feedback-loop",
    title: "Feedback Loop",
    analogy: "A writer drafts, an editor critiques, and the writer revises until the draft is ready.",
    whoDecides: "Your code decides",
    summary: "Two subagents iterate in a loop until approval or a maximum number of rounds.",
    whenToUse: "Use this when quality improves through repeated critique and revision.",
    defaultTask: "Write a concise explanation of recursion for a beginner.",
    run: runFeedbackLoop
  }
];

export function getPattern(patternId: string | undefined): PatternDefinition | undefined {
  return patterns.find((pattern) => pattern.id === patternId);
}

export function isPatternId(value: string): value is PatternId {
  return patterns.some((pattern) => pattern.id === value);
}
