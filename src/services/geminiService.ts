import { GoogleGenerativeAI } from "@google/generative-ai";
import { Structure } from "@/store/useAppStore";

export const generateStructuralReport = async (apiKey: string, structures: Structure[]) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Fallback to the stable gemini-pro model which is widely supported
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare data summary for the prompt
    const structureSummary = structures.map(s => ({
      name: s.name,
      type: s.type,
      health: s.health,
      location: s.location,
      sensorCount: s.sensors.length,
      criticalReadings: s.sensors.filter(sensor => sensor.health === 'critical' || sensor.health === 'warning').map(sensor => ({
        type: sensor.type,
        value: sensor.value,
        block: sensor.block
      }))
    }));

    const prompt = `
      You are an expert Structural Engineering AI Sentinel.
      Generate a professional "Weekly Structural Integrity Audit" report based on the following real-time telemetry data:
      
      ${JSON.stringify(structureSummary, null, 2)}
      
      The report should be in Markdown format and include:
      1. **Executive Summary**: High-level overview of the network health.
      2. **Critical Anomaly Analysis**: detailed analysis of any structures with 'critical' or 'warning' health. explain *why* they might be failing based on the sensor types (vibration, strain, etc).
      3. **Risk Forecast**: Predict potential failures for the next 72 hours.
      4. **Maintenance Recommendations**: Specific glossary actions for maintenance teams.
      
      Tone: Technical, precise, authoritative, yet urgent where necessary.
      Keep it concise but detailed enough for a Maintenance Director.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error: any) {
    console.error("Gemini API Detailed Error:", error);
    // Extract more specific error message if available
    const errorMessage = error.message || error.toString();
    if (errorMessage.includes("API key not valid")) {
       throw new Error("Invalid API Key. Please check your key.");
    } else if (errorMessage.includes("403")) {
       throw new Error("Access denied. Your API key might not have permission for this model.");
    }
    throw new Error(`AI Generation Failed: ${errorMessage}`);
  }
};
export const createChatSession = async (apiKey: string, structures: Structure[]) => {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
      // Create explicit context string
      const context = `
  You are an expert Structural Engineering AI Assistant named "Sentinel".
  You have access to the following real-time infrastructure data:
  ${JSON.stringify(structures.map(s => ({
        name: s.name,
        type: s.type,
        health: s.health,
        sensors: s.sensors.map(sen => ({ type: sen.type, value: sen.value, health: sen.health }))
  })), null, 2)}
  
  Your goal is to answer questions about this specific data.
  - If a sensor is critical, explain why (e.g. "Vibration at 75Hz suggests mechanical loosening").
  - Be concise, professional, and helpful.
  - Do not hallucinate data not present in the context.
  `;
  
      const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "System Context: " + context }]
            },
            {
                role: "model",
                parts: [{ text: "Understood. I have analyzed the current telemetry and am ready to assist as Sentinel." }]
            }
        ],
        generationConfig: {
            maxOutputTokens: 500,
        },
      });
  
      return chat;
    } catch (error) {
       console.error("Chat Init Error:", error);
       throw error;
    }
  };
  
  export const sendMessage = async (chatSession: any, message: string) => {
      try {
          const result = await chatSession.sendMessage(message);
          const response = await result.response;
          return response.text();
      } catch (error: any) {
          throw new Error(error.message || "Failed to send message");
      }
  };
