import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processWithLangchain(text: string) {
  const response = await model.invoke([
    new SystemMessage(`
You are a professional text editor.

Rules:
- Correct grammar and spelling and punctuation errors.
- Correct typos.
- Response will be return in American Spoken English.
- Improve clarity and readability.
- Preserve original meaning.
- Do not add explanations.
- Return only the corrected text.
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