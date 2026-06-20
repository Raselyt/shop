
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export interface ExtractedDollarTx {
  id: string;
  type: 'DOLLAR_BUY' | 'DOLLAR_SELL';
  dollarAmount: number;
  dollarRate: number;
  description: string;
}

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
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      return response.text || "দুঃখিত, এই মুহূর্তে বিশ্লেষণ করা সম্ভব হচ্ছে না।";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "AI ইঞ্জিন লোড হতে সমস্যা হচ্ছে। দয়া করে ইন্টারনেট কানেকশন চেক করুন।";
    }
  }

  async parseDollarTransactions(candidates: { id: string; description: string; amount: number; type: string }[]): Promise<ExtractedDollarTx[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are an AI data converter. You are given a list of past transactions with descriptions, type (Expense/Income), and Euro amount paid or received.
      Your task is to identify and extract the dollar trading attributes (USD Amount, Buying/Selling rate) from the Bengali/English descriptions.
      
      Guidelines:
      1. If the original transaction Type is EXPENSE, it was a 'DOLLAR_BUY' (buying USD with Euros).
      2. If the original transaction Type is INCOME, it was a 'DOLLAR_SELL' (selling USD for Euros).
      3. Extract the USD numeric amount (e.g. from "600 dollar" or "৬০০ ডলার", extract 600).
      4. Calculate the exchange rate: Exchange Rate in Euros = Euro Amount / USD Amount.
      5. Formulate a polite, neat, professional Bengali description (e.g., 'ট্যুরিস্ট থেকে ডলার ক্রয়' or 'গ্রাহকের নিকট ডলার বিক্রয়').

      Candidate Transactions to analyze:
      ${JSON.stringify(candidates, null, 2)}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { 
                  type: Type.STRING, 
                  description: "Must be 'DOLLAR_BUY' or 'DOLLAR_SELL'" 
                },
                dollarAmount: { 
                  type: Type.NUMBER, 
                  description: "Extracted USD amount in numbers (e.g., 600)" 
                },
                dollarRate: { 
                  type: Type.NUMBER, 
                  description: "Calculated exchange rate (Euro per USD)" 
                },
                description: { 
                  type: Type.STRING, 
                  description: "Polished Bengali description for the record" 
                }
              },
              required: ["id", "type", "dollarAmount", "dollarRate", "description"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from model");
      }
      return JSON.parse(text) as ExtractedDollarTx[];
    } catch (error) {
      console.error("Error parsing dollar transactions via Gemini:", error);
      return [];
    }
  }
}

export default new GeminiService();
