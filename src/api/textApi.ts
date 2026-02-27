import axios from "axios";

export const cleanText = async (text: string) => {
  const response = await axios.post(
    "https://api.your-ai.com/clean",
    { text },
    { headers: { Authorization: `Bearer YOUR_API_KEY` } }
  );
  return response.data.cleanedText;
};