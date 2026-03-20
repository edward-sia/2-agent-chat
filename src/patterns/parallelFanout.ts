import { Agent, run } from "@openai/agents";
import { formatOutput } from "../lib/format.js";
import type { DemoResult } from "../lib/types.js";

export async function runParallelFanout(task: string): Promise<DemoResult> {
  const researcher = new Agent({
    name: "Research Agent",
    instructions: "Collect helpful ideas, facts, and useful angles for the task."
  });

  const challenger = new Agent({
    name: "Challenger Agent",
    instructions: "Look for risks, counterarguments, and missing considerations."
  });

  const simplifier = new Agent({
    name: "Simplifier Agent",
    instructions: "Rewrite ideas in plain English and remove jargon."
  });

  const [researchResult, challengeResult, simplifyResult] = await Promise.all([
    run(researcher, task),
    run(challenger, task),
    run(simplifier, task)
  ]);

  const editor = new Agent({
    name: "Editor Agent",
    instructions: [
      "Merge the specialist outputs into one balanced final answer.",
      "Keep the useful detail, include key caveats, and stay readable."
    ].join(" ")
  });

  const finalResult = await run(
    editor,
    [
      `Original task: ${task}`,
      `Research notes: ${formatOutput(researchResult.finalOutput)}`,
      `Counterpoints: ${formatOutput(challengeResult.finalOutput)}`,
      `Plain-English reframing: ${formatOutput(simplifyResult.finalOutput)}`
    ].join("\n\n")
  );

  return {
    finalOutput: formatOutput(finalResult.finalOutput),
    trace: [
      "Research Agent ran in parallel.",
      "Challenger Agent ran in parallel.",
      "Simplifier Agent ran in parallel.",
      "Editor Agent merged the three outputs."
    ],
    notes: [
      "This pattern is great when specialist work is independent and can happen at the same time.",
      "Parallel fan-out usually gives better latency than calling specialists one by one."
    ]
  };
}
