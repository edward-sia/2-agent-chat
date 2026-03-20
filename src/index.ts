import { configureOpenAI } from "./lib/env.js";
import type { DemoResult, PatternDefinition } from "./lib/types.js";
import { getPattern, isPatternId, patterns } from "./patterns/index.js";

function printUsage(): void {
  console.log("2 Agent Chat Learning Kit");
  console.log("");
  console.log("Commands:");
  console.log("  npm run dev -- tour");
  console.log("  npm run dev -- explain <pattern>");
  console.log('  npm run dev -- demo <pattern> "your task"');
  console.log("  npm run dev -- <pattern>");
  console.log("");
  console.log("Pattern IDs:");

  for (const pattern of patterns) {
    console.log(`  - ${pattern.id}`);
  }
}

function printPattern(pattern: PatternDefinition): void {
  console.log(`${pattern.title} (${pattern.id})`);
  console.log(`Analogy: ${pattern.analogy}`);
  console.log(`Who decides: ${pattern.whoDecides}`);
  console.log(`What it is: ${pattern.summary}`);
  console.log(`When to use it: ${pattern.whenToUse}`);
  console.log(`Try it with: npm run dev -- demo ${pattern.id} "${pattern.defaultTask}"`);
}

function printTour(): void {
  console.log("2 Agent Chat Learning Tour");
  console.log("");
  console.log("Think of multi-agent design as choosing who gets to decide the next move:");
  console.log("  1. The model decides by calling a tool or a handoff.");
  console.log("  2. Your code decides by calling run() again in a shape you control.");
  console.log("");

  for (const pattern of patterns) {
    printPattern(pattern);
    console.log("");
  }
}

function printDemo(pattern: PatternDefinition, task: string, result: DemoResult): void {
  console.log(`${pattern.title}`);
  console.log(`Analogy: ${pattern.analogy}`);
  console.log(`Task: ${task}`);
  console.log("");
  console.log("Trace:");

  for (const line of result.trace) {
    console.log(`  - ${line}`);
  }

  console.log("");
  console.log("Notes:");

  for (const note of result.notes) {
    console.log(`  - ${note}`);
  }

  console.log("");
  console.log("Final output:");
  console.log(result.finalOutput);
}

async function runDemo(patternId: string | undefined, taskParts: string[]): Promise<void> {
  const pattern = getPattern(patternId);

  if (!pattern) {
    throw new Error(`Unknown pattern "${patternId ?? ""}". Run "npm run dev -- tour" to see valid pattern IDs.`);
  }

  configureOpenAI();

  const task = taskParts.join(" ").trim() || pattern.defaultTask;
  const result = await pattern.run(task);
  printDemo(pattern, task, result);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const [command, ...rest] = args;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  if (command === "tour" || command === "list") {
    printTour();
    return;
  }

  if (command === "explain") {
    const pattern = getPattern(rest[0]);

    if (!pattern) {
      throw new Error(`Unknown pattern "${rest[0] ?? ""}".`);
    }

    printPattern(pattern);
    return;
  }

  if (command === "demo") {
    await runDemo(rest[0], rest.slice(1));
    return;
  }

  if (isPatternId(command)) {
    await runDemo(command, rest);
    return;
  }

  throw new Error(`Unknown command "${command}". Run "npm run dev -- tour" for help.`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exit(1);
});
