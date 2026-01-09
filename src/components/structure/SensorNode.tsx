import { useState, useEffect } from 'react';

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

interface SensorNodeProps {
  sensor: Sensor;
  isSelected: boolean;
  onSelect: () => void;
  showRipple?: boolean;
}

export const SensorNode = ({ sensor, isSelected, onSelect, showRipple }: SensorNodeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const healthStyles = {
    stable: 'bg-stable neural-node',
    warning: 'bg-warning neural-node-stress',
    critical: 'bg-critical neural-node-critical',
  };

  const typeIcons = {
    vibration: '〰️',
    strain: '📊',
    temperature: '🌡️',
  };

  const getNodeSize = () => {
    const base = 14;
    const multiplier = sensor.value / 100;
    return base + multiplier * 10;
  };

  const getUnit = () => {
    switch (sensor.type) {
      case 'temperature':
        return '°C';
      case 'vibration':
        return ' Hz';
      case 'strain':
        return ' μɛ';
    }
  };

  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: `${sensor.x}%`,
        top: `${sensor.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 20 : 10,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Anomaly Ripple Effect */}
      {showRipple && (
        <>
          <div
            className="absolute rounded-full bg-accent/30 animate-ripple"
            style={{
              width: getNodeSize() * 4,
              height: getNodeSize() * 4,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            className="absolute rounded-full bg-accent/20 animate-ripple"
            style={{
              width: getNodeSize() * 6,
              height: getNodeSize() * 6,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animationDelay: '0.3s',
            }}
          />
        </>
      )}

      {/* Confidence Halo Ring */}
      <div
        className={`absolute rounded-full border-2 transition-all duration-500
          ${sensor.health === 'stable' ? 'border-stable/30' : ''}
          ${sensor.health === 'warning' ? 'border-warning/50' : ''}
          ${sensor.health === 'critical' ? 'border-critical/60 animate-pulse' : ''}`}
        style={{
          width: getNodeSize() * 2.5,
          height: getNodeSize() * 2.5,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Main Node */}
      <div
        className={`relative rounded-full transition-all duration-200
          ${healthStyles[sensor.health]} ${isSelected ? 'scale-150 ring-4 ring-primary/30' : 'hover:scale-125'}`}
        style={{
          width: getNodeSize(),
          height: getNodeSize(),
        }}
      >
        <div className="absolute inset-0 rounded-full bg-white/40" />
      </div>

      {/* Tooltip */}
      {showTooltip && !isSelected && (
        <div
          className="absolute z-50 glass-panel px-4 py-3 rounded-xl whitespace-nowrap
            animate-scale-in pointer-events-none min-w-[160px]"
          style={{
            bottom: getNodeSize() + 16,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{typeIcons[sensor.type]}</span>
            <div>
              <p className="font-display text-sm font-semibold text-foreground">{sensor.name}</p>
              <p className="text-sm font-medium text-foreground">
                {sensor.value.toFixed(1)}
                {getUnit()}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${healthStyles[sensor.health]}`} />
            <span className="text-xs font-medium capitalize text-muted-foreground">{sensor.health}</span>
          </div>
        </div>
      )}
    </div>
  );
};
