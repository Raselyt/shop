
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

class GeminiService {
  async analyzeBusiness(transactions: Transaction[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare data summary for AI focusing on shop needs
    const summary = transactions.slice(0, 40).map(t => 
      `${t.date}: ${t.description} - ${t.type} - €${t.amount}`
    ).join('\n');

    const prompt = `
      You are a smart business consultant for "RASAL SHOP", a daily small shop. 
      Analyze the following recent sales and expense data (all amounts in Euro €). 
      Provide 2-3 very short, actionable, and encouraging bullet points in Bengali for the shop owner to:
      1. Increase daily sales (বিক্রি বৃদ্ধি).
      2. Manage daily expenses better (খরচ নিয়ন্ত্রণ).
      3. Maximize monthly profit (লাভ বাড়ানো).

      Keep it friendly and concise for a mobile screen. Use € symbol.
      
      Transactions Data:
      ${summary}

      Response must be entirely in Bengali. Max 3 short sentences.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text || "দুঃখিত, এই মুহূর্তে বিশ্লেষণ করা সম্ভব হচ্ছে না।";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "AI ইঞ্জিন লোড হতে সমস্যা হচ্ছে। দয়া করে ইন্টারনেট কানেকশন চেক করুন।";
    }
  }
}

export default new GeminiService();
