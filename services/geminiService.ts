
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

class GeminiService {
  // Guidelines: Create a new instance right before making an API call to ensure up-to-date API key.
  // Guidelines: Use process.env.API_KEY directly.
  async analyzeBusiness(transactions: Transaction[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare data summary for AI
    const summary = transactions.slice(0, 50).map(t => 
      `${t.date}: ${t.description} - ${t.type} - €${t.amount}`
    ).join('\n');

    const prompt = `
      You are a business consultant for a small shop owner. 
      Analyze the following recent transactions and provide 2-3 short, actionable bullet points in Bengali for the shop owner to improve profit or manage expenses.
      Be encouraging and concise.

      Transactions Data:
      ${summary}

      Response should be entirely in Bengali. Max 3 sentences.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      // Guidelines: Use the .text property directly.
      return response.text || "দুঃখিত, কোনো ইনসাইট তৈরি করা সম্ভব হয়নি।";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "AI এই মুহূর্তে কাজ করছে না। দয়া করে পরে চেষ্টা করুন।";
    }
  }
}

export default new GeminiService();
