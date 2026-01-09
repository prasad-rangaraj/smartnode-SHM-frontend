import { useState, useEffect, useCallback } from 'react';

interface AIMessage {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'prediction';
  timestamp: Date;
}

const aiResponses = {
  greeting: "Structural Nervous System online. All monitored assets are within normal parameters.",
  warning: (structureName: string, sensorName: string, value: number) =>
    `Elevated readings detected at ${structureName} - ${sensorName}. Current value: ${value.toFixed(1)}. Monitoring for pattern development.`,
  critical: (structureName: string, sensorName: string) =>
    `⚠️ Critical threshold breached at ${structureName} - ${sensorName}. Recommend immediate inspection. Historical patterns suggest potential structural fatigue.`,
  prediction: (structureName: string) =>
    `Based on vibration pattern analysis at ${structureName}, structural fatigue indicators may increase within 48-72 hours. Preventive maintenance recommended.`,
  stable: (structureName: string) =>
    `${structureName} has returned to stable parameters. All sensors operating within normal thresholds.`,
  anomaly: (structureName: string, sensorName: string) =>
    `Anomaly detected at ${structureName} - ${sensorName}. Running TinyML inference to classify event signature...`,
  zoomIn: (structureName: string) =>
    `Focusing on ${structureName}. ${getStructureDetails(structureName)}`,
};

function getStructureDetails(name: string): string {
  const details: Record<string, string> = {
    'Tower Alpha': 'This 24-sensor array monitors a 45-story commercial tower. Foundation integrity excellent.',
    'Bridge Nexus': 'Critical infrastructure bridge with 18 sensors. Mid-span showing elevated traffic-induced vibrations.',
    'Flyover Beta': 'Highway overpass with 12 monitoring points. Load distribution nominal.',
  };
  return details[name] || 'Structural data loading...';
}

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
    }, 8000);
  }, []);

  const triggerGreeting = useCallback(() => {
    setIsThinking(true);
    setIsActive(true);
    setTimeout(() => addMessage(aiResponses.greeting, 'info'), 1500);
  }, [addMessage]);

  const triggerWarning = useCallback(
    (structureName: string, sensorName: string, value: number) => {
      setIsThinking(true);
      setIsActive(true);
      setTimeout(() => addMessage(aiResponses.warning(structureName, sensorName, value), 'warning'), 800);
    },
    [addMessage]
  );

  const triggerCritical = useCallback(
    (structureName: string, sensorName: string) => {
      setIsThinking(true);
      setIsActive(true);
      setTimeout(() => addMessage(aiResponses.critical(structureName, sensorName), 'critical'), 500);
    },
    [addMessage]
  );

  const triggerPrediction = useCallback(
    (structureName: string) => {
      setIsThinking(true);
      setIsActive(true);
      setTimeout(() => addMessage(aiResponses.prediction(structureName), 'prediction'), 1200);
    },
    [addMessage]
  );

  const triggerAnomaly = useCallback(
    (structureName: string, sensorName: string) => {
      setIsThinking(true);
      setIsActive(true);
      setTimeout(() => addMessage(aiResponses.anomaly(structureName, sensorName), 'warning'), 600);
    },
    [addMessage]
  );

  const triggerZoomIn = useCallback(
    (structureName: string) => {
      setIsThinking(true);
      setIsActive(true);
      setTimeout(() => addMessage(aiResponses.zoomIn(structureName), 'info'), 400);
    },
    [addMessage]
  );

  const triggerStable = useCallback(
    (structureName: string) => {
      addMessage(aiResponses.stable(structureName), 'info');
    },
    [addMessage]
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
    triggerPrediction,
    triggerAnomaly,
    triggerZoomIn,
    triggerStable,
  };
};
