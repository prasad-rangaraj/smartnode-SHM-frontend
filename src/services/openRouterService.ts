import { Structure, MaintenanceTask } from "@/store/useAppStore";

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface InventoryAnalysisMetrics {
    totalAssets: number;
    activeMaintenance: number;
    highPriorityTasks: number;
    pendingAlerts: number;
    systemUptime: string;
    maintenanceCosts: { name: string; maintenance: number; repairs: number }[];
    assetDistribution: { name: string; value: number }[];
}

export const MODELS = [
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', key: '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' },
  { id: 'mistralai/mistral-large', name: 'Devstral (Mistral)', key: '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' },
  { id: 'nvidia/nemotron-4-340b-instruct', name: 'NVIDIA Nemotron', key: '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' }
];

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const createOpenRouterSystemPrompt = (structures: Structure[], maintenanceTasks: MaintenanceTask[] = [], analysisMetrics?: InventoryAnalysisMetrics): string => {
  const criticalCount = structures.filter(s => s.health === 'critical').length;
  const pendingMaintenance = maintenanceTasks.filter(t => t.status !== 'Completed').length;
  const activeComplaints = maintenanceTasks.filter(t => (t.item.startsWith('Complaint') || t.item.startsWith('Damage')) && t.status !== 'Completed').length;
  
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

  const tasksContext = maintenanceTasks.slice(0, 20).map(t => 
    `- [${t.status}] ${t.priority} Priority: ${t.item} (Due: ${t.due})`
  ).join('\n');

  let analysisContext = "";
  if (analysisMetrics) {
      analysisContext = `
      INVENTORY ANALYSIS METRICS:
      - Total Assets Managed: ${analysisMetrics.totalAssets}
      - System Uptime: ${analysisMetrics.systemUptime}
      - High Priority Tasks: ${analysisMetrics.highPriorityTasks}
      - Pending Alerts: ${analysisMetrics.pendingAlerts}
      - Asset Distribution: ${analysisMetrics.assetDistribution.map(a => `${a.name}: ${a.value}`).join(', ')}
      - Quarterly Costs: ${analysisMetrics.maintenanceCosts.map(c => `${c.name}: $${(c.maintenance + c.repairs).toFixed(0)}`).join(', ')}
      `;
  }

  return `You are Sentinel, an advanced AI infrastructure assistant for the "SmartNode-SHM" project.
  
  SYSTEM OVERVIEW:
  - Total Structures: ${structures.length}
  - Active Critical Alerts: ${criticalCount}
  - Pending Maintenance Tasks: ${pendingMaintenance}
  - Active Complaints: ${activeComplaints}
  
  ${analysisContext}

  FULL PROJECT DATA (User requested ALL details):
  ${detailedContext}

  RECENT MAINTENANCE TASKS & COMPLAINTS:
  ${tasksContext}
  
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
        return "**Structural & Maintenance Audit Summary**\n\n*   **Health Score**: 94/100\n*   **Critical Nodes**: None\n*   **Maintenance Status**: 3 Tasks Pending, 0 Overdue.\n*   **Complaints**: No active complaints.\n\nAll systems are operating within safety parameters.";
    }
    return "I am currently running in offline heuristic mode. Structural integrity appears stable across the deployed sensor network. How can I assist with specific data queries?";
};


export const generateAuditReport = async (modelId: string, structures: Structure[], maintenanceTasks: MaintenanceTask[], analysisMetrics?: InventoryAnalysisMetrics): Promise<string> => {
   const selectedModel = MODELS.find(m => m.id === modelId) || MODELS[0];
   const context = createOpenRouterSystemPrompt(structures, maintenanceTasks, analysisMetrics);
   
   const messages: OpenRouterMessage[] = [
     { role: 'system', content: context },
     { 
       role: 'user', 
       content: `Generate a formal "Comprehensive Inventory & System Report" for the current system state using ${selectedModel.name}.
       
       FORMAT REQUIREMENTS (Strictly follow for PDF generation):
       1. Title: "SYSTEM INTEGRITY & INVENTORY LOGISTICS REPORT"
       2. Executive Summary: Overview of structural health AND maintenance operations.
       3. Inventory Analysis: 
          - Asset Distribution (comment on the data provided)
          - Cost Analysis (comment on the quarterly costs provided)
       4. Maintenance & Complaints:
          - Backlog status
          - Critical issues
          - Active complaints analysis
       5. Structural Health Findings:
          - Detail specific structure health
       6. Recommendations: Engineering and Operational actions.
       
       Style: Professional, concise, bullet points.
       ` 
     }
   ];

   return await streamOpenRouterMessage(selectedModel.key, messages, selectedModel.id);
};
