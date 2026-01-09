import { useState, useEffect, useCallback } from 'react';

interface Sensor {
  id: string;
  name: string;
  x: number;
  y: number;
  health: 'stable' | 'warning' | 'critical';
  value: number;
  type: 'vibration' | 'strain' | 'temperature';
  trend: number[];
  block: string;
}

interface Structure {
  id: string;
  name: string;
  type: 'building' | 'bridge' | 'flyover';
  health: 'stable' | 'warning' | 'critical';
  sensors: Sensor[];
  position: { x: number; y: number };
  scale: number;
  lastAnomaly?: Date;
  location: string;
}

const initialStructures: Structure[] = [
  {
    id: 'tower-alpha',
    name: 'Tower Alpha',
    type: 'building',
    health: 'stable',
    position: { x: 180, y: 180 },
    scale: 0.9,
    location: 'City Center',
    sensors: [
      { id: 's1', name: 'Base Vibration', x: 50, y: 85, health: 'stable', value: 45.2, type: 'vibration', trend: [42, 44, 45, 43, 45], block: 'Foundation A' },
      { id: 's2', name: 'Core Strain', x: 50, y: 50, health: 'stable', value: 23.8, type: 'strain', trend: [22, 23, 24, 23, 24], block: 'Main Shaft' },
      { id: 's3', name: 'Top Temperature', x: 50, y: 15, health: 'stable', value: 28.4, type: 'temperature', trend: [27, 28, 28, 29, 28], block: 'Roof Deck' },
      { id: 's4', name: 'East Wing', x: 80, y: 40, health: 'stable', value: 34.1, type: 'vibration', trend: [33, 34, 33, 35, 34], block: 'East Wing' },
      { id: 's5', name: 'West Wing', x: 20, y: 40, health: 'stable', value: 32.7, type: 'vibration', trend: [31, 32, 33, 32, 33], block: 'West Wing' },
    ],
  },
  {
    id: 'bridge-nexus',
    name: 'Bridge Nexus',
    type: 'bridge',
    health: 'warning',
    position: { x: 500, y: 320 },
    scale: 0.85,
    location: 'River Zone',
    sensors: [
      { id: 'b1', name: 'Pillar A', x: 15, y: 50, health: 'stable', value: 41.3, type: 'strain', trend: [40, 41, 40, 42, 41], block: 'Suspension Zone A' },
      { id: 'b2', name: 'Mid Span', x: 50, y: 50, health: 'warning', value: 78.9, type: 'vibration', trend: [65, 70, 75, 78, 79], block: 'Central Deck' },
      { id: 'b3', name: 'Pillar B', x: 85, y: 50, health: 'stable', value: 39.2, type: 'strain', trend: [38, 39, 38, 40, 39], block: 'Suspension Zone B' },
      { id: 'b4', name: 'Deck Temp', x: 50, y: 25, health: 'stable', value: 31.5, type: 'temperature', trend: [30, 31, 31, 32, 32], block: 'Central Deck' },
    ],
  },
  {
    id: 'flyover-beta',
    name: 'Flyover Beta',
    type: 'flyover',
    health: 'stable',
    location: 'North Zone',
    position: { x: 850, y: 200 },
    scale: 0.8,
    sensors: [
      { id: 'f1', name: 'Entry Point', x: 10, y: 50, health: 'stable', value: 22.1, type: 'vibration', trend: [21, 22, 21, 23, 22], block: 'Ramp Up' },
      { id: 'f2', name: 'Center Load', x: 50, y: 50, health: 'stable', value: 45.6, type: 'strain', trend: [44, 45, 46, 45, 46], block: 'Main Span' },
      { id: 'f3', name: 'Exit Point', x: 90, y: 50, health: 'stable', value: 21.8, type: 'vibration', trend: [20, 21, 22, 21, 22], block: 'Ramp Down' },
    ],
  },
];

export const useStructureData = () => {
  const [structures, setStructures] = useState<Structure[]>(initialStructures);
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [anomalyEvent, setAnomalyEvent] = useState<{ structureId: string; sensorId: string } | null>(null);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStructures((prev) =>
        prev.map((structure) => ({
          ...structure,
          sensors: structure.sensors.map((sensor) => {
            const variance = (Math.random() - 0.5) * 5;
            const newValue = Math.max(0, sensor.value + variance);
            const newTrend = [...sensor.trend.slice(1), newValue];

            // Determine health based on value thresholds
            let newHealth: 'stable' | 'warning' | 'critical' = 'stable';
            if (sensor.type === 'vibration') {
              if (newValue > 80) newHealth = 'critical';
              else if (newValue > 60) newHealth = 'warning';
            } else if (sensor.type === 'strain') {
              if (newValue > 70) newHealth = 'critical';
              else if (newValue > 50) newHealth = 'warning';
            } else if (sensor.type === 'temperature') {
              if (newValue > 45 || newValue < 5) newHealth = 'critical';
              else if (newValue > 38 || newValue < 10) newHealth = 'warning';
            }

            return {
              ...sensor,
              value: newValue,
              trend: newTrend,
              health: newHealth,
              block: sensor.block,
            };
          }),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Update structure health based on sensors
  useEffect(() => {
    setStructures((prev) =>
      prev.map((structure) => {
        const hasAnyCritical = structure.sensors.some((s) => s.health === 'critical');
        const hasAnyWarning = structure.sensors.some((s) => s.health === 'warning');

        let newHealth: 'stable' | 'warning' | 'critical' = 'stable';
        if (hasAnyCritical) newHealth = 'critical';
        else if (hasAnyWarning) newHealth = 'warning';

        return { ...structure, health: newHealth };
      })
    );
  }, [structures.map((s) => s.sensors.map((ss) => ss.health).join()).join()]);

  // Trigger random anomaly events
  useEffect(() => {
    const anomalyInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const structureIndex = Math.floor(Math.random() * structures.length);
        const structure = structures[structureIndex];
        const sensorIndex = Math.floor(Math.random() * structure.sensors.length);
        const sensor = structure.sensors[sensorIndex];

        setAnomalyEvent({ structureId: structure.id, sensorId: sensor.id });

        // Clear anomaly event after animation
        setTimeout(() => setAnomalyEvent(null), 3000);
      }
    }, 8000);

    return () => clearInterval(anomalyInterval);
  }, [structures]);

  const selectStructure = useCallback((id: string | null) => {
    setSelectedStructure(id);
    setSelectedSensor(null);
  }, []);

  const selectSensor = useCallback((id: string | null) => {
    setSelectedSensor(id);
  }, []);

  const getSelectedStructure = useCallback(() => {
    return structures.find((s) => s.id === selectedStructure) || null;
  }, [structures, selectedStructure]);

  const getSelectedSensor = useCallback(() => {
    const structure = getSelectedStructure();
    if (!structure) return null;
    return structure.sensors.find((s) => s.id === selectedSensor) || null;
  }, [getSelectedStructure, selectedSensor]);

  const getSystemHealth = useCallback(() => {
    const totalSensors = structures.reduce((acc, s) => acc + s.sensors.length, 0);
    const stableSensors = structures.reduce(
      (acc, s) => acc + s.sensors.filter((ss) => ss.health === 'stable').length,
      0
    );
    return (stableSensors / totalSensors) * 100;
  }, [structures]);

  return {
    structures,
    selectedStructure,
    selectedSensor,
    anomalyEvent,
    selectStructure,
    selectSensor,
    getSelectedStructure,
    getSelectedSensor,
    getSystemHealth,
  };
};
