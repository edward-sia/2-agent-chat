import "dotenv/config";
import { Agent, MemorySession, run, setDefaultOpenAIKey } from "@openai/agents";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

function requireApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY.");
    console.error('Create ".env" from ".env.example" and add your key.');
    process.exit(1);
  }

  return apiKey;
}

function printHelp(): void {
  console.log("Commands:");
  console.log("  /help   Show this help text");
  console.log("  /reset  Clear the current chat session");
  console.log("  exit    Quit the app");
  console.log("  quit    Quit the app");
}

function formatOutput(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "";
  }

  return JSON.stringify(value, null, 2);
}

async function main(): Promise<void> {
  setDefaultOpenAIKey(requireApiKey());

  const researchAgent = new Agent({
    name: "Research Agent",
    instructions: [
      "You are a specialist assistant used by another agent.",
      "Return concise background notes, facts, and options.",
      "Do not address the end user directly.",
      "Do not include greetings, sign-offs, or filler."
    ].join(" ")
  });

  const mainAgent = new Agent({
    name: "Main Agent",
    instructions: [
      "You are the user-facing assistant in a two-agent system.",
      "You may call the research_agent tool whenever you need background research or a second opinion.",
      "After using the tool, synthesize the result into a clear final answer for the user.",
      "Never mention internal tool traces unless the user asks how the system works."
    ].join(" "),
    tools: [
      researchAgent.asTool({
        toolName: "research_agent",
        toolDescription: "Ask the research specialist for notes or supporting detail."
      })
    ]
  });

  const session = new MemorySession();
  const rl = createInterface({ input, output });

  console.log("2 Agent Chat");
  console.log("Type a message to chat with the main agent.");
  console.log('Type "/help" for commands.\n');

  while (true) {
    const userInput = (await rl.question("you> ")).trim();

    if (!userInput) {
      continue;
    }

    const normalized = userInput.toLowerCase();

    if (normalized === "exit" || normalized === "quit") {
      break;
    }

    if (normalized === "/help") {
      printHelp();
      console.log("");
      continue;
    }

    if (normalized === "/reset") {
      await session.clearSession();
      console.log("assistant> Conversation cleared.\n");
      continue;
    }

    try {
      const result = await run(mainAgent, userInput, { session });
      const finalOutput = formatOutput(result.finalOutput);

      console.log(`assistant> ${finalOutput}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`assistant> Request failed: ${message}\n`);
    }
  }

  rl.close();
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exit(1);
});
