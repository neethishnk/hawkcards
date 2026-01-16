
import { GoogleGenAI } from "@google/genai";
import { LogEntry } from "../types";

export const analyzeSystemLogs = async (logs: LogEntry[]): Promise<string> => {
  // Always use process.env.API_KEY directly
  if (!process.env.API_KEY) {
    return "API Key is missing. Cannot perform AI analysis.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Format logs for the prompt, take only the last 20 to avoid token limits in this demo
    const recentLogs = logs.slice(0, 20).map(l => `[${l.timestamp}] ${l.action}: ${l.details}`).join('\n');

    const response = await ai.models.generateContent({
      // Using gemini-3-flash-preview for basic text analysis tasks
      model: 'gemini-3-flash-preview',
      contents: `
        You are a Chief Security Officer's AI assistant for Hawkforce AI.
        Analyze the following system audit logs for any patterns, anomalies, or summary of activity.
        Keep the response professional, concise, and focused on security and operational efficiency.
        
        Logs:
        ${recentLogs}
      `,
    });

    // Access the .text property directly (it's a getter, not a method)
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze logs via Gemini. Please try again later.";
  }
};
