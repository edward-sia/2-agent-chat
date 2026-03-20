import { Agent, run } from "@openai/agents";
import { z } from "zod";
import { formatOutput } from "../lib/format.js";
import type { DemoResult } from "../lib/types.js";

const reviewSchema = z.object({
  approved: z.boolean(),
  feedback: z.string()
});

export async function runFeedbackLoop(task: string): Promise<DemoResult> {
  const writer = new Agent({
    name: "Writer Agent",
    instructions: "Draft a strong first version that directly addresses the task."
  });

  const reviewer = new Agent({
    name: "Reviewer Agent",
    instructions: [
      "Review the draft against the original task.",
      "Approve only when the draft is clear, complete, and useful.",
      "When not approved, give one compact block of actionable feedback."
    ].join(" "),
    outputType: reviewSchema
  });

  let draftResult = await run(writer, task);
  let draft = formatOutput(draftResult.finalOutput);
  const trace: string[] = [`Writer Agent created draft 1.`];
  let approval = false;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const reviewResult = await run(
      reviewer,
      [
        `Original task: ${task}`,
        `Current draft: ${draft}`
      ].join("\n\n")
    );

    const review = reviewResult.finalOutput;

    if (!review) {
      throw new Error("Reviewer agent did not return a review.");
    }

    trace.push(`Reviewer Agent reviewed draft ${attempt}: approved=${String(review.approved)}.`);

    if (review.approved) {
      approval = true;
      break;
    }

    draftResult = await run(
      writer,
      [
        `Original task: ${task}`,
        `Current draft: ${draft}`,
        `Reviewer feedback: ${review.feedback}`,
        "Revise the draft using that feedback."
      ].join("\n\n")
    );

    draft = formatOutput(draftResult.finalOutput);
    trace.push(`Writer Agent revised the draft for round ${attempt + 1}.`);
  }

  return {
    finalOutput: draft,
    trace,
    notes: [
      approval
        ? "The reviewer approved the draft before the loop hit its maximum number of rounds."
        : "The loop stopped after the maximum number of rounds, which is a common safety limit.",
      "This pattern works like a writer and editor passing a draft back and forth."
    ]
  };
}
