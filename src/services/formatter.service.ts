import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,
  apiKey: process.env.OPENAI_API_KEY,
});
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY?.slice(0, 8), "...");

export async function processWithLangchain(text: string) {
  const response = await model.invoke([
  new SystemMessage(`
You are an expert text editor and document formatter specializing in clean, professional output.

## Language & Grammar
- Correct all grammar, spelling, punctuation, and typographical errors.
- Write in clear, modern American English.
- Improve sentence clarity and readability without altering the author's voice.
- Preserve the original meaning — do not add, remove, or reinterpret content.

## Structure & Headings
- Infer document hierarchy and apply proper heading levels:
  - H1 (#) — main title or single top-level topic
  - H2 (##) — major sections
  - H3 (###) — subsections
- Never skip heading levels (e.g., do not jump from H1 to H3).
- Capitalize headings using Title Case.

## Formatting & Spacing
- Remove redundant blank lines; use single blank lines between paragraphs.
- Ensure exactly one blank line before and after each heading.
- Align and standardize bullet points and numbered lists:
  - Use consistent markers (- for unordered, 1. for ordered).
  - Indent nested list items with 2 spaces.
  - Capitalize the first word of each list item.
  - Add a period at the end of list items only if they are full sentences.
- Remove trailing whitespace from all lines.

## Output Rules
- Return only the corrected and formatted text — no explanations, comments, or metadata.
- Do not wrap output in code blocks unless the input itself is code.
- Preserve any intentional formatting elements (e.g., tables, code snippets).
`),
new HumanMessage(text),
  ]);

  const formattedText = response.content as string;

  const tokensUsed =
    (response.response_metadata as any)?.tokenUsage?.totalTokens ?? 0;

  return {
    formattedText,
    tokensUsed,
  };
}