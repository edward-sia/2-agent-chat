import { Agent, run } from "@openai/agents";
import { formatOutput, summarizeRun } from "../lib/format.js";
import type { DemoResult } from "../lib/types.js";

export async function runBasicHandoff(task: string): Promise<DemoResult> {
  const billingAgent = new Agent({
    name: "Billing Specialist",
    instructions: "You handle invoices, pricing, refunds, and subscription questions."
  });

  const technicalAgent = new Agent({
    name: "Technical Specialist",
    instructions: "You handle bugs, setup issues, troubleshooting, and implementation questions."
  });

  const triageAgent = Agent.create({
    name: "Triage Agent",
    instructions: [
      "You are the front desk.",
      "Do not solve the task yourself.",
      "Always hand the conversation to the single best specialist."
    ].join(" "),
    handoffs: [billingAgent, technicalAgent]
  });

  const result = await run(triageAgent, task);

  return {
    finalOutput: formatOutput(result.finalOutput),
    trace: summarizeRun(result),
    notes: [
      `Final speaker: ${result.activeAgent?.name ?? "Unknown"}`,
      "After a handoff, the specialist becomes the one answering the user."
    ]
  };
}
