import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL,
  mongoUri: process.env.MONGO_URI,
  geminiApiKey: process.env.GEMINI_API_KEY
};
