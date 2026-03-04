import { FormatterText } from "../types/text.interface.ts";
import { UserModel } from "../models/user.model.ts";
import { processWithLangchain } from "../services/formatter.service.ts";
import { enforceDailyUsageLimit } from "../utils/usage-limit.util.ts";

export async function formatTextController(body: FormatterText) {
  const { uuid, text } = body;

  if (!uuid || !text) {
    const error: any = new Error("uuid and text are required");
    error.statusCode = 400;
    throw error;
  }

  let user = await UserModel.findOne({ uuid });

  if (!user) {
  user = await UserModel.create({
    uuid,
    dailyTokensUsed: 0,
  });
}

  enforceDailyUsageLimit(user, text);

  const { formattedText, tokensUsed } =
    await processWithLangchain(text);

  await UserModel.updateOne(
    { uuid },
    { $inc: { dailyTokensUsed: tokensUsed } }
  );

  return { formattedText };
}