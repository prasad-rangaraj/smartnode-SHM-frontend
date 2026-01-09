import { useState } from 'react';
import { SensorNode } from './SensorNode';

interface Sensor {
  id: string;
  name: string;
  x: number;
  y: number;
  health: 'stable' | 'warning' | 'critical';
  value: number;
  type: 'vibration' | 'strain' | 'temperature';
  trend: number[];
}

interface StructureOrganismProps {
  id: string;
  name: string;
  type: 'building' | 'bridge' | 'flyover';
  overallHealth: 'stable' | 'warning' | 'critical';
  sensors: Sensor[];
  position: { x: number; y: number };
  scale?: number;
  isSelected?: boolean;
  isZoomedOut?: boolean;
  selectedSensorId?: string | null;
  anomalySensorId?: string | null;
  onSelect?: () => void;
  onSensorSelect?: (sensorId: string) => void;
}

export const StructureOrganism = ({
  id,
  name,
  type,
  overallHealth,
  sensors,
  position,
  scale = 1,
  isSelected,
  isZoomedOut,
  selectedSensorId,
  anomalySensorId,
  onSelect,
  onSensorSelect,
}: StructureOrganismProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const healthColors = {
    stable: 'from-stable/20 to-primary/10',
    warning: 'from-warning/25 to-accent/15',
    critical: 'from-critical/25 to-accent/15',
  };

  const glowColors = {
    stable: 'shadow-glow-health',
    warning: 'shadow-glow-stress',
    critical: 'shadow-glow-critical',
  };

  const getOrganismShape = () => {
    switch (type) {
      case 'building':
        return 'w-64 h-80';
      case 'bridge':
        return 'w-96 h-44';
      case 'flyover':
        return 'w-80 h-36';
      default:
        return 'w-64 h-64';
    }
  };

  const computedScale = isSelected ? 1.5 : isZoomedOut ? 0.6 : scale;
  const opacity = isZoomedOut && !isSelected ? 0.5 : 1;

  return (
    <div
      className={`absolute transition-all duration-700 ease-out ${isSelected ? 'z-30' : 'z-10'}`}
      style={{
        left: isSelected ? '50%' : position.x,
        top: isSelected ? '45%' : position.y,
        transform: `translate(${isSelected ? '-50%, -50%' : '0, 0'}) scale(${isHovered && !isSelected ? computedScale * 1.03 : computedScale})`,
        opacity,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Stress Field Background */}
      <div
        className={`absolute inset-0 rounded-[3rem] bg-gradient-to-br ${healthColors[overallHealth]} 
          blur-xl stress-field transition-all duration-500`}
        style={{ 
          transform: 'scale(1.3)',
          opacity: isSelected ? 0.8 : 0.6,
        }}
      />

      {/* Main Organism Body */}
      <div
        className={`relative ${getOrganismShape()} glass-panel rounded-[2rem] cursor-pointer
          ${glowColors[overallHealth]} transition-all duration-300
          ${isHovered || isSelected ? 'ring-2 ring-primary/40' : ''}`}
      >
        {/* Inner organic mesh pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
          <defs>
            <pattern id={`mesh-${id}`} width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="0.8" fill="currentColor" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#mesh-${id})`} rx="20" />
        </svg>

        {/* Neural Connection Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`neural-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(175 65% 40% / 0.4)" />
              <stop offset="50%" stopColor="hsl(260 45% 65% / 0.3)" />
              <stop offset="100%" stopColor="hsl(175 65% 40% / 0.4)" />
            </linearGradient>
          </defs>
          {sensors.map((sensor, i) =>
            sensors.slice(i + 1).map((other) => (
              <line
                key={`${sensor.id}-${other.id}`}
                x1={sensor.x}
                y1={sensor.y}
                x2={other.x}
                y2={other.y}
                stroke={`url(#neural-grad-${id})`}
                strokeWidth="0.8"
                strokeDasharray="3 3"
                className="neural-connection"
                opacity={isSelected ? 0.8 : 0.5}
              />
            ))
          )}
        </svg>

        {/* Sensor Nodes */}
        {sensors.map((sensor) => (
          <SensorNode
            key={sensor.id}
            sensor={sensor}
            isSelected={selectedSensorId === sensor.id}
            onSelect={() => onSensorSelect?.(sensor.id)}
            showRipple={anomalySensorId === sensor.id}
          />
        ))}

        {/* Structure Label - Always visible when selected */}
        <div
          className={`absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap
            transition-all duration-300 ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="glass-panel px-5 py-2.5 rounded-full">
            <span className="font-display text-sm font-semibold text-foreground">{name}</span>
            <span className="ml-2 text-xs text-muted-foreground capitalize">• {type}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
