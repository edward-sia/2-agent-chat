import {
  RunHandoffCallItem,
  RunMessageOutputItem,
  RunResult,
  RunToolCallItem,
  RunToolCallOutputItem
} from "@openai/agents";

export function formatOutput(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "";
  }

  return JSON.stringify(value, null, 2);
}

function getRawName(rawItem: unknown): string | undefined {
  if (typeof rawItem !== "object" || rawItem == null) {
    return undefined;
  }

  if ("name" in rawItem && typeof rawItem.name === "string") {
    return rawItem.name;
  }

  return undefined;
}

export function summarizeRun(result: RunResult<any, any>): string[] {
  const lines: string[] = [];

  for (const item of result.newItems) {
    if (item instanceof RunToolCallItem) {
      lines.push(`${item.agent.name} called tool "${getRawName(item.rawItem) ?? "unknown"}".`);
      continue;
    }

    if (item instanceof RunToolCallOutputItem) {
      lines.push(`${item.agent.name} received tool output from "${getRawName(item.rawItem) ?? "unknown"}".`);
      continue;
    }

    if (item instanceof RunHandoffCallItem) {
      lines.push(`${item.agent.name} initiated handoff "${getRawName(item.rawItem) ?? "unknown"}".`);
      continue;
    }

    if (item instanceof RunMessageOutputItem) {
      lines.push(`${item.agent.name} produced a message.`);
    }
  }

  return [...new Set(lines)];
}
