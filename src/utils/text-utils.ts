const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;

const EMOJI_MAP: Record<string, string> = {
  '🔥': '[fire]',
  '🚀': '[rocket]',
  '🎯': '[target]',
  '😎': '[cool]'
};

export const cleanFormatting = (text: string): string => {
  return text
    .replace(/#{1,6}\s?/g, '') 
    .replace(/[*]\s/g, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const removeEmojis = (text: string): string => 
  text.replace(EMOJI_REGEX, '');

export const replaceEmojiWithText = (text: string): string =>
  text.replace(EMOJI_REGEX, match => EMOJI_MAP[match] ?? '');

export const limitEmojis = (text: string, max: number = 2): string => {
  let count = 0;
  return text.replace(EMOJI_REGEX, (match) => {
    count++;
    return count <= max ? match : '';
  });
};