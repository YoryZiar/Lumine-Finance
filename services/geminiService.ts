import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFinancialInsight = async (transactions: Transaction[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure it to receive AI insights.";
  }

  // Prepare a summary of data to reduce token usage
  const recentTransactions = transactions.slice(0, 30); // Analyze last 30 transactions
  const summary = JSON.stringify(recentTransactions.map(t => ({
    d: t.date,
    a: t.amount,
    t: t.type,
    c: t.category
  })));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a financial advisor. Analyze these recent transactions (JSON format): ${summary}. 
      Provide a concise, friendly, bulleted list of 3 key insights or tips to improve financial health. 
      Focus on spending habits or saving opportunities. Keep it under 100 words.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "No insights could be generated at this time.";
  } catch (error) {
    console.error("Error generating insight:", error);
    return "Unable to generate AI insights at the moment. Please try again later.";
  }
};