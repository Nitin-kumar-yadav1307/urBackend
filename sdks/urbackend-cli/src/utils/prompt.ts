import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

/**
 * Prompts the user for a single line of input.
 * Automatically closes the readline interface after reading.
 */
export async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = (await rl.question(question)).trim();
  rl.close();
  return answer;
}

/**
 * Prompts for a yes/no confirmation.
 * Returns true for "y" or "yes" (case-insensitive), false otherwise.
 */
export async function confirm(question: string): Promise<boolean> {
  const answer = await prompt(`${question} (y/n): `);
  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}
