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

interface SensorDetailPanelProps {
  sensor: Sensor;
  structureName: string;
  onClose: () => void;
}

export const SensorDetailPanel = ({ sensor, structureName, onClose }: SensorDetailPanelProps) => {
  const typeLabels = {
    vibration: 'Vibration Frequency',
    strain: 'Structural Strain',
    temperature: 'Temperature',
  };

  const getUnit = () => {
    switch (sensor.type) {
      case 'temperature':
        return '°C';
      case 'vibration':
        return 'Hz';
      case 'strain':
        return 'μɛ';
    }
  };

  const getThresholds = () => {
    switch (sensor.type) {
      case 'vibration':
        return { warning: 60, critical: 80 };
      case 'strain':
        return { warning: 50, critical: 70 };
      case 'temperature':
        return { warning: 38, critical: 45 };
    }
  };

  const thresholds = getThresholds();
  const maxValue = Math.max(...sensor.trend, thresholds.critical * 1.2);
  const minValue = Math.min(...sensor.trend, 0);

  const healthColors = {
    stable: 'bg-stable',
    warning: 'bg-warning',
    critical: 'bg-critical animate-pulse',
  };

  const trendDirection = sensor.trend[sensor.trend.length - 1] > sensor.trend[0] ? 'up' : 'down';
  const trendChange = Math.abs(sensor.trend[sensor.trend.length - 1] - sensor.trend[0]).toFixed(1);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 animate-slide-up">
      <div className="glass-panel rounded-3xl p-6 w-80 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary hover:bg-muted 
            flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full ${healthColors[sensor.health]}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {sensor.health}
            </span>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">{sensor.name}</h3>
          <p className="text-sm text-muted-foreground">{structureName} • {typeLabels[sensor.type]}</p>
        </div>

        {/* Current Value */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-stable/10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Reading</p>
              <p className="font-display text-4xl font-bold text-foreground">
                {sensor.value.toFixed(1)}
                <span className="text-lg font-normal text-muted-foreground ml-1">{getUnit()}</span>
              </p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium
              ${trendDirection === 'up' ? 'bg-accent/20 text-accent' : 'bg-stable/20 text-stable'}`}>
              <svg className={`w-4 h-4 ${trendDirection === 'up' ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {trendChange}
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-3">24h Trend</p>
          <div className="relative h-24 bg-secondary/50 rounded-xl p-3">
            {/* Threshold Lines */}
            <div
              className="absolute left-3 right-3 border-t border-dashed border-warning/50"
              style={{ bottom: `${((thresholds.warning - minValue) / (maxValue - minValue)) * 100}%` }}
            >
              <span className="absolute right-0 -top-3 text-[10px] text-warning">Warning</span>
            </div>
            <div
              className="absolute left-3 right-3 border-t border-dashed border-critical/50"
              style={{ bottom: `${((thresholds.critical - minValue) / (maxValue - minValue)) * 100}%` }}
            >
              <span className="absolute right-0 -top-3 text-[10px] text-critical">Critical</span>
            </div>

            {/* Trend Line */}
            <svg className="absolute inset-3" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(175 65% 40% / 0.3)" />
                  <stop offset="100%" stopColor="hsl(175 65% 40% / 0)" />
                </linearGradient>
              </defs>
              {/* Area */}
              <path
                d={`M0,${100 - ((sensor.trend[0] - minValue) / (maxValue - minValue)) * 100} ${sensor.trend
                  .map((v, i) => `L${(i / (sensor.trend.length - 1)) * 100},${100 - ((v - minValue) / (maxValue - minValue)) * 100}`)
                  .join(' ')} L100,100 L0,100 Z`}
                fill="url(#trend-gradient)"
              />
              {/* Line */}
              <path
                d={`M0,${100 - ((sensor.trend[0] - minValue) / (maxValue - minValue)) * 100} ${sensor.trend
                  .map((v, i) => `L${(i / (sensor.trend.length - 1)) * 100},${100 - ((v - minValue) / (maxValue - minValue)) * 100}`)
                  .join(' ')}`}
                fill="none"
                stroke="hsl(175 65% 40%)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Current Point */}
              <circle
                cx="100"
                cy={100 - ((sensor.trend[sensor.trend.length - 1] - minValue) / (maxValue - minValue)) * 100}
                r="4"
                fill="hsl(175 65% 40%)"
              />
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Min</p>
            <p className="font-display text-lg font-semibold text-foreground">
              {Math.min(...sensor.trend).toFixed(1)}
            </p>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Max</p>
            <p className="font-display text-lg font-semibold text-foreground">
              {Math.max(...sensor.trend).toFixed(1)}
            </p>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Avg</p>
            <p className="font-display text-lg font-semibold text-foreground">
              {(sensor.trend.reduce((a, b) => a + b, 0) / sensor.trend.length).toFixed(1)}
            </p>
          </div>
        </div>

        {/* AI Insight */}
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-neural/10 to-primary/10 border border-neural/20">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-neural flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-white/80" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sensor.health === 'stable'
                ? 'Sensor readings are within normal parameters. No anomalies detected in recent history.'
                : sensor.health === 'warning'
                ? 'Elevated readings detected. Recommend monitoring for pattern development over next 12 hours.'
                : 'Critical threshold exceeded. Immediate inspection recommended.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
