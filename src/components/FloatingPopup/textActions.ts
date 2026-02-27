import { cleanFormatting, removeEmojis, replaceEmojiWithText } from "../../shared";

export const textActionRegistry: Record<string, (text: string) => string> = {
  cleanFormatting,
  removeEmojis,
  replaceEmojiWithText,
};