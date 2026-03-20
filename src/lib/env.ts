import "dotenv/config";
import { setDefaultOpenAIKey } from "@openai/agents";

export function configureOpenAI(): void {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Create ".env" from ".env.example" and add your key.');
  }

  setDefaultOpenAIKey(apiKey);
}
