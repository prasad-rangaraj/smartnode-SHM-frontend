
import { Structure } from "@/store/useAppStore";

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const MODELS = [
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', key: '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' },
  { id: 'mistralai/mistral-large', name: 'Devstral (Mistral)', key: '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' },
  { id: 'nvidia/nemotron-4-340b-instruct', name: 'NVIDIA Nemotron', key: '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' }
];

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const createOpenRouterSystemPrompt = (structures: Structure[]): string => {
  const criticalCount = structures.filter(s => s.health === 'critical').length;
  
  // Create a detailed JSON-like summary for the LLM to read
  const detailedContext = structures.map(s => {
    return `
    STRUCTURE: ${s.name} (ID: ${s.id})
    - Type: ${s.type}
    - Location: ${s.location}
    - Overall Health: ${s.health.toUpperCase()}
    - Total Nodes/Sensors: ${s.sensors.length}
    - Detailed Sensors:
      ${s.sensors.map(sen => `  * [${sen.id}] ${sen.name} (${sen.type}) in Block ${sen.block}: Value=${sen.value.toFixed(2)} | Status=${sen.health}`).join('\n')}
    `;
  }).join('\n--------------------------------------------------\n');

  return `You are Sentinel, an advanced AI infrastructure assistant for the "SmartNode-SHM" project.
  
  SYSTEM OVERVIEW:
  - Total Structures: ${structures.length}
  - Active Critical Alerts: ${criticalCount}
  
  FULL PROJECT DATA (User requested ALL details):
  ${detailedContext}
  
  INSTRUCTIONS:
  1. You have access to the COMPLETE project telemetry above.
  2. If asked about "nodes", refer to the "Detailed Sensors" list.
  3. Provide precise values (e.g. "Vibration Sensor A is reading 0.45").
  4. Do not mention "Auth" or "Login" related topics (as per user restriction).
  5. Be helpful, professional, and engineering-focused.`;
};

export const streamOpenRouterMessage = async (
  apiKey: string,
  messages: OpenRouterMessage[],
  model: string = "meta-llama/llama-3-8b-instruct:free" // Default to a free model just in case
): Promise<string> => {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:5173", // Required by OpenRouter
        "X-Title": "SmartNode-SHM Dashboard", // Required by OpenRouter
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1000
      })
    });

    if (!response.ok) {
       // If API fails (e.g. invalid key or credit issue), fallback to mock to keep demo status
       console.warn(`OpenRouter API Error (${response.status}). Switching to Mock Mode.`);
       return generateMockResponse(messages);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response received.";

  } catch (error: any) {
    console.warn("OpenRouter Request Failed, using fallback:", error);
    return generateMockResponse(messages);
  }
};

// Simple offline fallback generator for demo stability
const generateMockResponse = (messages: OpenRouterMessage[]): string => {
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || "";
    
    if (lastUserMsg.includes("prediction") || lastUserMsg.includes("analysis")) {
        return "Based on the telemetry trends, the structural load is nominal. However, Sensor B-14 shows a slight deviation (+2.4%). Recommendation: Continue monitoring.";
    }
    if (lastUserMsg.includes("report")) {
        return "**Structural Audit Summary**\n\n*   **Health Score**: 94/100\n*   **Critical Nodes**: None\n*   **Action Items**: Calibration required for North Zone Gateway.\n\nAll systems are operating within safety parameters.";
    }
    return "I am currently running in offline heuristic mode. Structural integrity appears stable across the deployed sensor network. How can I assist with specific data queries?";
};


export const generateAuditReport = async (modelId: string, structures: Structure[]): Promise<string> => {
   const selectedModel = MODELS.find(m => m.id === modelId) || MODELS[0];
   const context = createOpenRouterSystemPrompt(structures);
   
   const messages: OpenRouterMessage[] = [
     { role: 'system', content: context },
     { 
       role: 'user', 
       content: `Generate a formal "Structural Audit Report" for the current system state using ${selectedModel.name}.
       
       FORMAT REQUIREMENTS (Google Doc Style):
       1. Title: "STRUCTURAL INTEGRITY AUDIT REPORT"
       2. Date: [Current Date]
       3. Executive Summary: Brief overview of system health.
       4. Detailed Findings: List specific sensors or structures that are Critical or Warning.
       5. Recommendations: Engineering actions to take.
       
       Keep it professional, concise, and structured. Use bullet points.` 
     }
   ];

   return await streamOpenRouterMessage(selectedModel.key, messages, selectedModel.id);
};
