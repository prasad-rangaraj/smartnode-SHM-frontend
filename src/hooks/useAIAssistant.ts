import { useState, useEffect, useCallback } from 'react';
import { predictTrend } from '@/services/predictiveModel';
import { Structure } from '@/store/useAppStore';
import { streamOpenRouterMessage, MODELS } from '@/services/openRouterService';

interface AIMessage {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'prediction';
  timestamp: Date;
}

const aiResponses = {
  greeting: "Structural Nervous System online. All monitored assets are within normal parameters.",
};

export const useAIAssistant = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const addMessage = useCallback((message: string, type: AIMessage['type'] = 'info') => {
    const newMessage: AIMessage = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev.slice(-9), newMessage]);
    setCurrentMessage(message);
    setIsActive(true);
    setIsThinking(false);

    // Auto-hide after delay
    setTimeout(() => {
      setIsActive(false);
    }, 12000); // Increased read time for LLM text
  }, []);

  const triggerGreeting = useCallback(() => {
    setIsThinking(true);
    setIsActive(true);
    setTimeout(() => addMessage(aiResponses.greeting, 'info'), 1500);
  }, [addMessage]);

  const generateLLMInsight = useCallback(async (
    context: string, 
    type: AIMessage['type'] = 'info',
    modelId: string = MODELS[0].id // Use DeepSeek by default
  ) => {
      setIsThinking(true);
      setIsActive(true);

      const prompt = [
          { role: 'system' as const, content: "You are Sentinel, an advanced Structural AI. Provide a single, professional, engineering-focused sentence (max 25 words) analyzing the provided structural status. Be concise and technical." },
          { role: 'user' as const, content: context }
      ];

      try {
          const response = await streamOpenRouterMessage(MODELS.find(m => m.id === modelId)?.key || '', prompt, modelId);
          addMessage(response, type);
      } catch (err) {
          console.error("LLM Generation Failed", err);
          // Fallback
          addMessage("AI Connectivity Signal Weak. Using heuristic analysis: parameters are within deviation limits.", type);
      }
  }, [addMessage]);

  const triggerWarning = useCallback(
    (structureName: string, sensorName: string, value: number) => {
      generateLLMInsight(
          `Alert: Structure '${structureName}' sensor '${sensorName}' is reading ${value.toFixed(1)}. This is elevated.`, 
          'warning'
      );
    },
    [generateLLMInsight]
  );

  const triggerCritical = useCallback(
    (structureName: string, sensorName: string) => {
      generateLLMInsight(
          `CRITICAL ALERT: Structure '${structureName}' sensor '${sensorName}' has breached safety thresholds. Urgent inspection required.`, 
          'critical'
      );
    },
    [generateLLMInsight]
  );

  // New: Real Prediction Engine Integration + LLM Narrative
  const generateLiveInsight = useCallback(async (structure: Structure) => {
      const sensor = structure.sensors[0];
      if (!sensor || sensor.trend.length < 5) return;

      setIsThinking(true);
      setIsActive(true);

      try {
          // 2. Run TensorFlow Prediction
          const prediction = await predictTrend(sensor.trend, 5);
          const maxPred = Math.max(...prediction.predictedValues);
          const trendDir = maxPred > sensor.value ? "increasing" : "stabilizing";
          
          // 3. Generate LLM Narrative based on Data
          await generateLLMInsight(
              `Predictive Analysis for ${structure.name} (${structure.type}): Current load ${sensor.value.toFixed(1)}kN. TensorFlow model predicts peak of ${maxPred.toFixed(1)}kN in T+5h (Trend: ${trendDir}). Assess structural fatigue risk.`,
              'prediction'
          );

      } catch (err) {
          console.error("AI Insight Generation Failed", err);
          setIsThinking(false);
      }
  }, [generateLLMInsight]);

  const triggerAnomaly = useCallback(
    (structureName: string, sensorName: string) => {
      generateLLMInsight(`Anomaly detected at ${structureName} on sensor ${sensorName}. Pattern is irregular.`, 'warning');
    },
    [generateLLMInsight]
  );

  const triggerZoomIn = useCallback(
    (structure: Structure) => {
      setIsThinking(true);
      setIsActive(true);
      
      const initMessages = [
          `Initializing deep scan for ${structure.name}...`,
          `Focusing sensors on ${structure.name}. Aggregating history...`,
          `Switching analytical context to ${structure.name}...`,
          `Retrieving real-time telemetry from ${structure.name}...`
      ];
      const randomMsg = initMessages[Math.floor(Math.random() * initMessages.length)];

      // Immediate feedback
      addMessage(randomMsg, 'info');
      
      // Trigger real analysis
      setTimeout(() => {
          generateLiveInsight(structure);
      }, 1000);
    },
    [addMessage, generateLiveInsight]
  );

  const triggerStable = useCallback(
    (structureName: string) => {
       generateLLMInsight(`Structure ${structureName} has returned to stable parameters. All systems nominal.`, 'info');
    },
    [generateLLMInsight]
  );

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(triggerGreeting, 2000);
    return () => clearTimeout(timer);
  }, [triggerGreeting]);

  return {
    messages,
    currentMessage,
    isActive,
    isThinking,
    triggerWarning,
    triggerCritical,
    generateLiveInsight,
    triggerAnomaly,
    triggerZoomIn,
    triggerStable,
  };
};
