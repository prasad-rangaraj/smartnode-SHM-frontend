import { Activity, Thermometer, Waves, AlertTriangle, ArrowRight, MapPin, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

interface Sensor {
  id: string;
  name: string;
  type: 'vibration' | 'strain' | 'temperature';
  value: number;
  health: 'stable' | 'warning' | 'critical';
  x: number;
  y: number;
  trend: number[];
  block?: string;
}

interface StructureCardProps {
  id: string;
  name: string;
  type: 'building' | 'bridge' | 'flyover';
  health: 'stable' | 'warning' | 'critical';
  sensors: Sensor[];
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  location?: string;
  gatewayConnectivity?: number;
}

const getHealthPercent = (health: 'stable' | 'warning' | 'critical') => {
  switch (health) {
    case 'stable': return 98;
    case 'warning': return 75;
    case 'critical': return 45;
  }
};

export const StructureCard = ({
  name,
  type,
  health,
  sensors,
  isSelected,
  onSelect,
  onViewDetails,
  location,
  gatewayConnectivity,
}: StructureCardProps) => {
  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'bridge': return 'Bridge Infrastructure';
      case 'flyover': return 'Urban Flyover';
      default: return 'High-Rise Structure';
    }
  };

  const criticalSensors = sensors.filter(s => s.health === 'critical').length;
  const warningSensors = sensors.filter(s => s.health === 'warning').length;
  const healthPercent = getHealthPercent(health);

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType) {
      case 'vibration': return <Waves className="w-3 h-3" />;
      case 'strain': return <Activity className="w-3 h-3" />;
      case 'temperature': return <Thermometer className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getUnit = (sensorType: string) => {
    switch (sensorType) {
      case 'vibration': return 'Hz';
      case 'strain': return 'µε';
      case 'temperature': return '°C';
      default: return '';
    }
  };

  // Animation variants for shake effect
  const shakeVariants = {
    stable: { x: 0 },
    warning: { 
      x: [0, -1, 1, -1, 0],
      transition: { repeat: Infinity, duration: 2, repeatDelay: 3 }
    },
    critical: { 
      x: [0, -2, 2, -2, 2, 0],
      transition: { repeat: Infinity, duration: 0.5 }
    }
  };

  return (
    <motion.div 
      variants={shakeVariants}
      animate={health}
      className={`gov-card-elevated group cursor-pointer relative bg-white transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary border-primary/50 shadow-lg' : 'hover:border-slate-300 border-slate-200'
      }`}
      onClick={onSelect}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity group-hover:opacity-10 ${
        health === 'stable' ? 'from-emerald-500 to-transparent' :
        health === 'warning' ? 'from-amber-500 to-transparent' :
        'from-rose-500 to-transparent'
      }`} />

      <div className="p-5 flex flex-col items-center relative z-10">
        {/* Header - Centered */}
        <div className="text-center mb-6 w-full relative">
          <div className="absolute left-0 top-0 flex items-center gap-2">
             <span className={`w-2 h-2 rounded-full ${
                health === 'stable' ? 'bg-emerald-500' :
                health === 'warning' ? 'bg-amber-500' :
                'bg-rose-500'
             }`} />
             <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
               {getTypeLabel(type)}
             </span>
          </div>
          
          <h3 className="font-bold text-xl text-slate-800 group-hover:text-primary transition-colors tracking-tight mt-6">
            {name}
          </h3>
          {location && (
            <div className="flex items-center justify-center gap-1.5 mt-1 text-xs text-slate-400 font-medium">
               <MapPin className="w-3 h-3 text-slate-400" />
               {location}
            </div>
          )}
        </div>

        {/* Central Sensor Map (Large Portrait) */}
        <div className="relative w-40 h-56 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-xl group/map mb-6 transition-transform duration-500 group-hover:scale-105">
             {/* Grid */}
             <div className="absolute inset-0 opacity-20" 
                  style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
             
             {/* Scanline Effect */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-[200%] w-full animate-[scan_3s_linear_infinite]" />

             {/* Group Sensors by Tile (Block) */}
             {Object.entries(
               sensors.reduce((acc, sensor) => {
                 const block = sensor.block || 'Unknown';
                 if (!acc[block]) acc[block] = [];
                 acc[block].push(sensor);
                 return acc;
               }, {} as Record<string, typeof sensors>)
             ).map(([blockName, tileSensors]) => {
                // Determine Tile Health & Position
                const isCritical = tileSensors.some(s => s.health === 'critical');
                const isWarning = tileSensors.some(s => s.health === 'warning');
                
                // Use position of first sensor (they should be identical for a tile)
                const x = tileSensors[0].x;
                const y = tileSensors[0].y;
                
                // Generate Tooltip Content
                const tooltip = `Tile: ${blockName}\n` + tileSensors.map(s => `${s.type}: ${s.value.toFixed(1)}`).join('\n');

                return (
                  <div 
                    key={blockName}
                    className={`absolute w-3 h-3 rounded-full transition-all duration-300 cursor-help z-10 ${
                      isCritical ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]' :
                      isWarning ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 
                      'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]'
                    }`}
                    style={{ 
                      left: `${x}%`, 
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    title={tooltip}
                  >
                     {/* Ping Effect if active */}
                     <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                        isCritical ? 'bg-red-500' : 
                        isWarning ? 'bg-amber-400' : 
                        'bg-sky-400'
                     }`} />
                  </div>
                );
             })}
             
             {/* Tech Overlay Details */}
             <div className="absolute bottom-3 inset-x-0 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Live Feed</span>
             </div>
        </div>
        
        {/* Integrity Status */}
        <div className="flex items-center justify-between w-full border-t border-slate-100 pt-4">
           <div className="flex flex-col">
             <span className="text-[10px] text-slate-400 uppercase font-medium">Integrity</span>
             <div className={`text-2xl font-bold font-mono leading-none ${
               health === 'stable' ? 'text-emerald-600' :
               health === 'warning' ? 'text-amber-600' :
               'text-rose-600'
             }`}>
               {healthPercent}%
             </div>
           </div>
           
           <div className="flex flex-col items-end gap-1">
             <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Nodes</span>
                <span className="text-xl font-bold text-slate-700 font-mono leading-none">{sensors.length}</span>
             </div>
             
             {/* Gateway Connectivity Display */}
             {gatewayConnectivity !== undefined && (
                <div className="flex items-center gap-1.5" title="Gateway Signal Strength">
                    <Wifi className={`w-3 h-3 ${
                        gatewayConnectivity > 80 ? 'text-emerald-500' :
                        gatewayConnectivity > 50 ? 'text-amber-500' :
                        'text-rose-500'
                    }`} />
                    <span className={`text-xs font-mono font-bold ${
                        gatewayConnectivity > 80 ? 'text-emerald-600' :
                        gatewayConnectivity > 50 ? 'text-amber-600' :
                        'text-rose-600'
                    }`}>
                        {gatewayConnectivity}%
                    </span>
                </div>
             )}
           </div>
        </div>
      </div>



      {/* Footer / Sensor Stats */}
      <div className="p-4 relative z-10 bg-white">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {sensors.slice(0, 3).map((sensor) => (
            <div 
              key={sensor.id}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-mono border whitespace-nowrap ${
                sensor.health === 'stable' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                sensor.health === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-rose-50 text-rose-700 border-rose-100'
              }`}
            >
              {getSensorIcon(sensor.type)}
              <span>{sensor.value.toFixed(1)}{getUnit(sensor.type)}</span>
            </div>
          ))}
          {sensors.length > 3 && (
            <div className="flex items-center px-2 py-1 rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200">
              +{sensors.length - 3}
            </div>
          )}
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="w-full group/btn flex items-center justify-between px-3 py-2 
            bg-slate-50 hover:bg-blue-50 text-sm font-medium text-slate-600 hover:text-blue-600 
            rounded transition-colors border border-slate-200 hover:border-blue-200"
        >
          <span>View Real-time Data</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
};
