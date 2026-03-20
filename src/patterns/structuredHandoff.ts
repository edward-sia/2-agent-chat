import { Agent, handoff, run } from "@openai/agents";
import { z } from "zod";
import { formatOutput, summarizeRun } from "../lib/format.js";
import type { DemoResult } from "../lib/types.js";

type IntakeContext = {
  transferBrief?: string;
};

export async function runStructuredHandoff(task: string): Promise<DemoResult> {
  let capturedIntake: unknown;

  const travelSpecialist = new Agent<IntakeContext>({
    name: "Travel Specialist",
    instructions: (runContext) => [
      "You are a travel specialist taking over after concierge triage.",
      "Use the transfer brief below as your structured intake.",
      `Transfer brief: ${runContext.context.transferBrief ?? "No brief provided."}`
    ].join(" ")
  });

  const transfer = handoff(travelSpecialist, {
    toolNameOverride: "handoff_with_travel_brief",
    toolDescriptionOverride: "Transfer the request with a structured travel intake form.",
    inputType: z.object({
      goal: z.string(),
      budgetLevel: z.enum(["low", "medium", "high"]),
      urgency: z.enum(["low", "medium", "high"]),
      constraints: z.string()
    }),
    onHandoff(runContext, input) {
      capturedIntake = input;
      runContext.context.transferBrief = JSON.stringify(input, null, 2);
    }
  });

  const conciergeAgent = Agent.create({
    name: "Concierge Agent",
    instructions: [
      "You are a concierge who prepares a clean intake before transferring the request.",
      "Always use the travel handoff tool.",
      "Infer sensible field values from the user's request when needed."
    ].join(" "),
    handoffs: [transfer]
  });

  const result = await run(conciergeAgent, task, {
    context: {
      transferBrief: undefined
    }
  });

  return {
    finalOutput: formatOutput(result.finalOutput),
    trace: summarizeRun(result),
    notes: [
      `Final speaker: ${result.activeAgent?.name ?? "Unknown"}`,
      `Structured intake captured at handoff: ${JSON.stringify(capturedIntake, null, 2)}`
    ]
  };
}
