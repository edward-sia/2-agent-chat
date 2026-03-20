import { Agent, run } from "@openai/agents";
import { formatOutput, summarizeRun } from "../lib/format.js";
import type { DemoResult } from "../lib/types.js";

export async function runHybridHandoffWithTools(task: string): Promise<DemoResult> {
  const budgetAgent = new Agent({
    name: "Budget Analyst",
    instructions: [
      "You are a budgeting specialist working for another agent.",
      "Estimate costs, suggest money-saving tradeoffs, and keep the advice concrete.",
      "Do not address the user directly."
    ].join(" ")
  });

  const localGuideAgent = new Agent({
    name: "Local Guide",
    instructions: [
      "You are a local recommendations specialist working for another agent.",
      "Suggest neighborhoods, pacing, food, and practical local tips.",
      "Do not address the user directly."
    ].join(" ")
  });

  const travelPlannerAgent = new Agent({
    name: "Travel Planner",
    handoffDescription: "Handles travel planning, itinerary design, budgets, and destination guidance.",
    instructions: [
      "You are a travel planning specialist who now owns the conversation.",
      "When useful, call your specialist tools before giving the final answer.",
      "Use the budget_analyst tool for spending tradeoffs.",
      "Use the local_guide tool for destination flavor and practical recommendations."
    ].join(" "),
    tools: [
      budgetAgent.asTool({
        toolName: "budget_analyst",
        toolDescription: "Estimate travel costs and budget tradeoffs."
      }),
      localGuideAgent.asTool({
        toolName: "local_guide",
        toolDescription: "Get local recommendations and on-the-ground tips."
      })
    ]
  });

  const billingAgent = new Agent({
    name: "Billing Specialist",
    handoffDescription: "Handles invoices, refunds, and account billing issues.",
    instructions: "You handle billing questions clearly and directly."
  });

  const triageAgent = Agent.create({
    name: "Triage Agent",
    instructions: [
      "You are the front desk for a support and planning service.",
      "Route the user to the best specialist.",
      "Choose Travel Planner for travel-related requests and Billing Specialist for billing problems."
    ].join(" "),
    handoffs: [travelPlannerAgent, billingAgent]
  });

  const result = await run(triageAgent, task);

  return {
    finalOutput: formatOutput(result.finalOutput),
    trace: summarizeRun(result),
    notes: [
      `Final speaker: ${result.activeAgent?.name ?? "Unknown"}`,
      "This is the hybrid pattern: the first agent hands off, then the receiving specialist still delegates bounded subtasks to its own agent-tools."
    ]
  };
}
