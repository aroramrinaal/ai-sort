import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const SortSchema = z.object({
  sorted: z.array(z.number()),
});

function nowIso() {
  return new Date().toISOString();
}

function logInfo(...parts) {
  console.log(`[ai-sort] ${nowIso()} INFO:`, ...parts);
}

function logWarn(...parts) {
  console.warn(`[ai-sort] ${nowIso()} WARN:`, ...parts);
}

function logError(...parts) {
  console.error(`[ai-sort] ${nowIso()} ERROR:`, ...parts);
}

export async function vibesort(array) {
  if (!Array.isArray(array)) throw new Error("input must be an array of numbers");
  const allNumbers = array.every((value) => typeof value === "number" && Number.isFinite(value));
  if (!allNumbers) {
    throw new Error("input array must contain only finite numbers");
  }

  if (!process.env.OPENAI_API_KEY) {
    const guidance = [
      "OPENAI_API_KEY is not set.",
      "Set it in your shell:",
      '  export OPENAI_API_KEY="sk-..."',
      "Or add it to a .env file:",
      "  OPENAI_API_KEY=your_key",
      "Then run your command again.",
      "Forgot your key? Happens to the best of us. You can create one here: https://platform.openai.com/api-keys",
    ].join("\n");
    logWarn(guidance);
    throw new Error("missing OPENAI_API_KEY");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  logInfo("sending array to GPT for sorting:", array);

  try {
    const response = await openai.responses.parse({
      model: "gpt-4o-2024-08-06",
      input: [
        {
          role: "user",
          content: JSON.stringify({ array, order: "asc" }),
        },
      ],
      text: {
        format: zodTextFormat(SortSchema, "vibesort"),
      },
    });

    const result = response.output_parsed.sorted;
    logInfo("sorted result from GPT:", result);
    return result;
  } catch (err) {
    const status = err?.status || err?.code || "unknown";
    const base = `sorting failed (status: ${status}).`;
    const tips = [];
    if (status === 401) tips.push("Your API key looks shy. Double-check OPENAI_API_KEY and try again.");
    if (status === 429) tips.push("Too much vibe at once (rate-limited). Pause for a moment and retry.");
    if (status === "unknown") tips.push("Network gremlins? Check your internet or try again.");
    tips.push("If vibes keep failing, regenerate a fresh key: https://platform.openai.com/api-keys");

    const message = [base, ...tips].join(" \n");
    logError(message);
    throw new Error(message);
  }
}
