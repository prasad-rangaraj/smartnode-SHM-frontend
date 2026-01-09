import { Activity, Thermometer, Waves, Droplets, LayoutGrid, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { SensorHistoryChart } from '../SensorHistoryChart';

interface Sensor {
  id: string;
  name: string;
  type: 'vibration' | 'strain' | 'temperature';
  value: number;
  health: 'stable' | 'warning' | 'critical';
  x: number;
  y: number;
  trend: number[];
  block: string;
}

interface DetailedStructureViewProps {
  sensors: Sensor[];
  onSelectSensor?: (id: string) => void;
  selectedSensorId?: string | null;
  gatewayConnectivity?: number;
}

export const DetailedStructureView = ({ sensors, gatewayConnectivity }: DetailedStructureViewProps) => {
  // Group sensors by block
  const sensorsByBlock = sensors.reduce((acc, sensor) => {
    if (!acc[sensor.block]) {
      acc[sensor.block] = [];
    }
    acc[sensor.block].push(sensor);
    return acc;
  }, {} as Record<string, Sensor[]>);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vibration': return <Waves className="w-4 h-4" />;
      case 'strain': return <Activity className="w-4 h-4" />;
      case 'temperature': return <Thermometer className="w-4 h-4" />;
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

  const getHealthColor = (health: string) => {
    switch (health) {
        case 'stable': return '#0ea5e9'; // sky-500
        case 'warning': return '#f59e0b'; // amber-500
        case 'critical': return '#ef4444'; // red-500
        default: return '#64748b'; // slate-500
    }
  };

  return (
    <div className="p-8 space-y-10">
      {/* Gateway Connectivity Header */}
      {gatewayConnectivity !== undefined && (
         <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
               <div className={`p-3 rounded-xl shadow-sm ${
                  gatewayConnectivity > 80 ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' :
                  gatewayConnectivity > 50 ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' :
                  'bg-rose-50 text-rose-600 ring-1 ring-rose-100'
               }`}>
                  <Wifi className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="text-base font-bold text-slate-800">Gateway Connectivity</h4>
                  <p className="text-sm text-slate-500 font-medium">IoT Mesh Network Signal</p>
               </div>
            </div>
            <div className="text-right">
               <div className="flex items-baseline justify-end gap-1">
                 <span className={`text-3xl font-mono font-bold tracking-tight ${
                    gatewayConnectivity > 80 ? 'text-emerald-600' :
                    gatewayConnectivity > 50 ? 'text-amber-600' :
                    'text-rose-600'
                 }`}>
                    {gatewayConnectivity}
                 </span>
                 <span className="text-sm font-bold text-slate-400">%</span>
               </div>
               
               <div className="flex gap-1.5 mt-2 justify-end">
                  {[1,2,3,4,5].map(bar => (
                     <div key={bar} className={`w-1.5 h-3 rounded-full transition-all ${
                        (gatewayConnectivity / 20) >= bar 
                           ? (gatewayConnectivity > 80 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : gatewayConnectivity > 50 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]')
                           : 'bg-slate-100'
                     }`} />
                  ))}
               </div>
            </div>
         </div>
      )}

      {Object.entries(sensorsByBlock).map(([blockName, blockSensors], index) => {
        const blockHealth = blockSensors.some(s => s.health === 'critical') ? 'critical' : 
                            blockSensors.some(s => s.health === 'warning') ? 'warning' : 'stable';
        
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={blockName} 
            className="group"
          >
            {/* Block Header */}
            <div className="flex items-center gap-4 mb-4">
               <div className="h-px flex-1 bg-slate-100"></div>
               <div className="flex items-center gap-3 py-2 px-4 bg-slate-50/50 rounded-full border border-slate-100 backdrop-blur-sm">
                  <LayoutGrid className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">{blockName}</span>
                  <div className={`w-2 h-2 rounded-full ml-1 ${
                      blockHealth === 'stable' ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]' :
                      blockHealth === 'warning' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' :
                      'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  }`} />
               </div>
               <div className="h-px flex-1 bg-slate-100"></div>
            </div>

            {/* Sensors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blockSensors.map((sensor) => (
                <div 
                    key={sensor.id}
                    className="relative p-6 rounded-2xl border border-slate-100 bg-white/50 hover:bg-white transition-colors duration-300"
                >
                    {/* Background Gradient based on/ health */}
                    <div className={`absolute inset-0 opacity-[0.02] pointer-events-none bg-gradient-to-br ${
                         sensor.health === 'stable' ? 'from-sky-500 to-transparent' :
                         sensor.health === 'warning' ? 'from-amber-500 to-transparent' :
                         'from-red-500 to-transparent'
                    }`} />

                    <div className="flex justify-between items-start mb-6 relative">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
                                sensor.health === 'stable' ? 'bg-sky-50 text-sky-600 ring-1 ring-sky-100' :
                                sensor.health === 'warning' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' :
                                'bg-red-50 text-red-600 ring-1 ring-red-100'
                            }`}>
                                {getTypeIcon(sensor.type)}
                            </div>
                            <div>
                                <span className="text-base font-bold text-slate-800 block mb-0.5">{sensor.name}</span>
                                <div className="flex items-center gap-2">
                                   <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{sensor.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1.5 mb-4">
                        <span className="text-4xl font-bold text-slate-800 font-mono tracking-tighter">
                            {sensor.value.toFixed(1)}
                        </span>
                        <span className="text-sm text-slate-500 font-bold uppercase">
                            {getUnit(sensor.type)}
                        </span>
                    </div>

                    <div className="w-full h-32 opacity-90">
                        <SensorHistoryChart 
                            data={sensor.trend} 
                            color={getHealthColor(sensor.health)} 
                            unit={getUnit(sensor.type)}
                            height={120}
                            hideTitle
                        />
                    </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {sensors.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
           <p className="text-slate-500">No sensors available for this structure.</p>
        </div>
      )}

      {sensors.length > 0 && (
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-slate-50 text-slate-400 rounded-lg border border-slate-100">
                <LayoutGrid className="w-4 h-4" />
             </div>
             <h3 className="text-lg font-bold text-slate-800">Sensor Readings</h3>
          </div>
          
          <div className="bg-white/50 border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-6 py-4">Sensor ID</th>
                  <th className="px-6 py-4">Reading</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Location (Block)</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sensors.map((sensor) => (
                  <tr key={sensor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">{sensor.id}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                       {sensor.value.toFixed(2)} <span className="text-slate-400 font-normal ml-1">{getUnit(sensor.type)}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-slate-600 font-medium capitalize">
                          {getTypeIcon(sensor.type)}
                          {sensor.type}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                       {sensor.block}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            sensor.health === 'stable' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            sensor.health === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                           {sensor.health}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
