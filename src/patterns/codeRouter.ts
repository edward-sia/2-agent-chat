import { Agent, run } from "@openai/agents";
import { z } from "zod";
import { formatOutput } from "../lib/format.js";
import type { DemoResult } from "../lib/types.js";

const routeSchema = z.object({
  specialist: z.enum(["teacher", "planner", "critic"]),
  brief: z.string()
});

export async function runCodeRouter(task: string): Promise<DemoResult> {
  const routerAgent = new Agent({
    name: "Router Agent",
    instructions: [
      "Choose the single best specialist for the task.",
      "Return a short brief that explains what that specialist should do.",
      "Do not solve the task."
    ].join(" "),
    outputType: routeSchema
  });

  const teacherAgent = new Agent({
    name: "Teacher Agent",
    instructions: "Explain clearly, step by step, for someone learning the topic."
  });

  const plannerAgent = new Agent({
    name: "Planner Agent",
    instructions: "Turn the task into a practical plan with next steps and tradeoffs."
  });

  const criticAgent = new Agent({
    name: "Critic Agent",
    instructions: "Stress-test the idea, point out weak spots, and suggest improvements."
  });

  const routeResult = await run(routerAgent, task);
  const route = routeResult.finalOutput;

  if (!route) {
    throw new Error("Router agent did not return a route.");
  }

  const specialist =
    route.specialist === "teacher"
      ? teacherAgent
      : route.specialist === "planner"
        ? plannerAgent
        : criticAgent;

  const specialistResult = await run(
    specialist,
    [
      `Original task: ${task}`,
      `Routing brief from Router Agent: ${route.brief}`
    ].join("\n\n")
  );

  const editorAgent = new Agent({
    name: "Editor Agent",
    instructions: "Turn the specialist output into a crisp final answer for the user."
  });

  const finalResult = await run(
    editorAgent,
    [
      `Original task: ${task}`,
      `Chosen specialist: ${specialist.name}`,
      `Specialist output: ${formatOutput(specialistResult.finalOutput)}`
    ].join("\n\n")
  );

  return {
    finalOutput: formatOutput(finalResult.finalOutput),
    trace: [
      `Router Agent chose "${route.specialist}" and wrote the brief: ${route.brief}`,
      `${specialist.name} handled the routed work.`,
      "Editor Agent polished the final answer."
    ],
    notes: [
      "This is code-driven orchestration: your application decides which subagent to call next.",
      "The LLM does not directly invoke a handoff or tool here."
    ]
  };
}
