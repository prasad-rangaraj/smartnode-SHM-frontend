
import * as tf from '@tensorflow/tfjs';
import * as qna from '@tensorflow-models/qna';
import { Structure } from "@/store/useAppStore";

// Cache the model globally to avoid reloading
let model: qna.QuestionAndAnswer | null = null;
let isModelLoading = false;

// Initialize the model
export const loadLocalModel = async () => {
  if (model || isModelLoading) return;
  
  try {
    isModelLoading = true;
    console.log("Loading MobileBERT QnA Model...");
    await tf.ready();
    model = await qna.load();
    console.log("MobileBERT Loaded Successfully");
  } catch (err) {
    console.error("Failed to load generic QnA model:", err);
    throw new Error("Failed to load local neural engine.");
  } finally {
    isModelLoading = false;
  }
};

// Generate a natural language "passage" from the structured data
const generateContextFromStore = (structures: Structure[]): string => {
  const parts: string[] = [];

  // System Level
  const criticalCount = structures.filter(s => s.health === 'critical').length;
  const warningCount = structures.filter(s => s.health === 'warning').length;
  parts.push(`The overall system status is ${criticalCount > 0 ? 'CRITICAL' : warningCount > 0 ? 'WARNING' : 'NOMINAL'}.`);
  parts.push(`There are ${structures.length} total structures being monitored.`);
  parts.push(`There are ${criticalCount} critical alerts and ${warningCount} warnings active.`);

  // Structure Level
  structures.forEach(s => {
    parts.push(`${s.name} is a ${s.type} located in ${s.location}. It has ${s.sensors.length} sensor nodes.`);
    parts.push(`Its overall health is ${s.health}.`); // Concise for model reading
    
    // Add specific details for non-stable structures
    if (s.health !== 'stable') {
       const report = s.sensors.filter(sen => sen.health !== 'stable')
           .map(sen => `${sen.name} reading ${sen.value.toFixed(1)} (${sen.health})`)
           .join(", ");
       if (report) {
           parts.push(`Detailed alert for ${s.name}: ${report}.`);
       }
    }
  });

  return parts.join(" ");
};

// ------------------------------------------------------------------
// GENERATIVE LAYER (Conversational Engine)
// ------------------------------------------------------------------
const generateNaturalLanguageResponse = (structure: Structure): string => {
  const templates = [
    `I've analyzed the telemetry for ${structure.name}. It is currently in a ${structure.health} state.`,
    `Current readings for ${structure.name} indicate a ${structure.health} status.`,
    `Status Report: ${structure.name} is ${structure.health}.`
  ];
  
  const base = templates[Math.floor(Math.random() * templates.length)];
  
  if (structure.health === 'stable') {
     return `${base} All sensors are operating within nominal parameters. No anomalies detected.`;
  }
  
  const badSensors = structure.sensors.filter(s => s.health !== 'stable');
  const alertDetails = badSensors.map(s => `${s.name} (${s.value.toFixed(1)})`).join(', ');
  
  return `${base} Attention is required. The following sensors are reporting abnormal values: ${alertDetails}. I recommend immediate inspection of the facility.`;
};

export const processLocalMessage = async (message: string, structures: Structure[]): Promise<string> => {
  // Ensure model is loaded (non-blocking if already loaded)
  if (!model) await loadLocalModel();

  const lowerMsg = message.toLowerCase();

  // 1. Ambiguity & Structure Detection (Deep Analysis)
  const matchedStructure = structures.find(s => lowerMsg.includes(s.name.toLowerCase()));
  
  if (matchedStructure) {
      if (model) {
          // If we have a neural model, try to get a specific answer first
          const context = generateContextFromStore(structures);
          const answers = await model.findAnswers(message, context);
          const bestAnswer = answers && answers.length > 0 ? answers[0] : null;

          // If the model is confident (>2) AND the answer is not just the structure name
          if (bestAnswer && bestAnswer.score > 2 && bestAnswer.text.length > matchedStructure.name.length) {
              return `${bestAnswer.text} (Neural Confidence: ${(bestAnswer.score).toFixed(2)})`;
          }
      }
      
      // Fallback to Generative Layer (Conversational Engine) for a nice paragraph
      return generateNaturalLanguageResponse(matchedStructure);
  }

  // 2. System Status Query
  if (lowerMsg.includes("system") || lowerMsg.includes("status") || lowerMsg.includes("health")) {
      const critical = structures.filter(s => s.health === 'critical').length;
      const warning = structures.filter(s => s.health === 'warning').length;
      return `System Telemetry Summary:\nMonitored Structures: ${structures.length}\nCritical Alerts: ${critical}\nWarnings: ${warning}\n\n${critical > 0 ? "CRITICAL ALERT: Inspect active alarms immediately." : "System is operating normally."}`;
  }

  // 3. Neural Search (General Knowledge in Context)
  if (model) {
      const context = generateContextFromStore(structures);
      const answers = await model.findAnswers(message, context);
      if (answers && answers.length > 0 && answers[0].score > 1.5) {
          return `${answers[0].text}.`;
      }
  }

  return "I analyzed the available data but couldn't find a precise match. Try asking about a specific structure (e.g., 'Tower Alpha') or requesting a 'System Status'.";
};
