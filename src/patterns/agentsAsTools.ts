import { Agent, run } from "@openai/agents";
import { formatOutput, summarizeRun } from "../lib/format.js";
import type { DemoResult } from "../lib/types.js";

export async function runAgentsAsTools(task: string): Promise<DemoResult> {
  const researchAgent = new Agent({
    name: "Research Specialist",
    instructions: [
      "You are a background researcher working for another agent.",
      "Return compact notes, options, and factual framing.",
      "Do not address the end user directly."
    ].join(" ")
  });

  const skepticAgent = new Agent({
    name: "Skeptic Specialist",
    instructions: [
      "You are a red-team specialist working for another agent.",
      "Surface assumptions, blind spots, and risks.",
      "Do not address the end user directly."
    ].join(" ")
  });

  const managerAgent = new Agent({
    name: "Manager Agent",
    instructions: [
      "You are the user-facing assistant.",
      "Before answering, you must call at least one specialist tool.",
      "Call both tools when the task involves tradeoffs or uncertainty.",
      "Write the final answer yourself after reviewing the specialist outputs."
    ].join(" "),
    tools: [
      researchAgent.asTool({
        toolName: "research_specialist",
        toolDescription: "Get background notes and options."
      }),
      skepticAgent.asTool({
        toolName: "skeptic_specialist",
        toolDescription: "Find blind spots, caveats, and risks."
      })
    ]
  });

  const result = await run(managerAgent, task);

  return {
    finalOutput: formatOutput(result.finalOutput),
    trace: summarizeRun(result),
    notes: [
      `Final speaker: ${result.activeAgent?.name ?? "Unknown"}`,
      "The manager stays in charge, so the user keeps talking to the same front-of-house agent."
    ]
  };
}
