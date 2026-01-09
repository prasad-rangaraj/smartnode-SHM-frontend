import { Activity, Thermometer, Waves, Droplets, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

interface Sensor {
  id: string;
  name: string;
  type: 'vibration' | 'strain' | 'temperature';
  value: number;
  health: 'stable' | 'warning' | 'critical';
  x: number;
  y: number;
  trend: number[];
}

interface SensorDataTableProps {
  sensors: Sensor[];
  onSelectSensor?: (id: string) => void;
  selectedSensorId?: string | null;
}

export const SensorDataTable = ({ sensors, onSelectSensor, selectedSensorId }: SensorDataTableProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vibration': return <Waves className="w-4 h-4" />;
      case 'strain': return <Activity className="w-4 h-4" />;
      case 'temperature': return <Thermometer className="w-4 h-4" />;
      case 'humidity': return <Droplets className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getUnit = (type: string) => {
    switch (type) {
      case 'vibration': return 'Hz';
      case 'strain': return 'µε';
      case 'temperature': return '°C';
      default: return '';
    }
  };

  const getTrendDirection = (trend: number[]) => {
    if (trend.length < 2) return 'stable';
    const last = trend[trend.length - 1];
    const prev = trend[trend.length - 2];
    if (last > prev + 1) return 'up';
    if (last < prev - 1) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: number[]) => {
    const direction = getTrendDirection(trend);
    switch (direction) {
      case 'up': return <div className="flex items-center text-rose-500 bg-rose-50 px-2 py-0.5 rounded textxs font-bold gap-1"><TrendingUp className="w-3 h-3" /> Rising</div>;
      case 'down': return <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold gap-1"><TrendingDown className="w-3 h-3" /> Falling</div>;
      default: return <div className="flex items-center text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-xs font-bold gap-1"><Minus className="w-3 h-3" /> Stable</div>;
    }
  };

  const getStatusBadge = (health: string) => {
    switch (health) {
      case 'stable':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Normal</span>;
      case 'warning':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 animate-pulse">Warning</span>;
      case 'critical':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 animate-pulse shadow-sm">Critical</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Sensor Node</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Reading</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Trend (1h)</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sensors.map((sensor) => (
              <tr 
                key={sensor.id}
                onClick={() => onSelectSensor?.(sensor.id)}
                className={`group transition-colors hover:bg-slate-50/80 cursor-pointer ${
                  selectedSensorId === sensor.id ? 'bg-blue-50/50 hover:bg-blue-50/80' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                      sensor.health === 'stable' ? 'bg-emerald-500' :
                      sensor.health === 'warning' ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`} />
                    <div>
                      <span className="font-bold text-slate-700 block">{sensor.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{sensor.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1 w-fit shadow-sm">
                    {getTypeIcon(sensor.type)}
                    <span className="capitalize text-xs font-medium">{sensor.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-slate-800 text-base">
                    {sensor.value.toFixed(1)}<span className="text-slate-400 text-xs ml-0.5">{getUnit(sensor.type)}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getTrendIcon(sensor.trend)}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(sensor.health)}
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-white rounded-full">
                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sensors.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Activity className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-medium">No Sensor Data</h3>
          <p className="text-slate-500 text-sm mt-1">Select a structure or run a simulation to view telemetry.</p>
        </div>
      )}
    </div>
  );
};
