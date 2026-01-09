import { motion } from 'framer-motion';
import { X, Activity, Signal, Zap, Crosshair, ChevronRight, Navigation } from 'lucide-react';
import { Structure } from '@/store/useAppStore';

interface TacticalOverlayProps {
  structure: Structure | null;
  onClose: () => void;
  isRouteActive: boolean;
  onToggleRoute: () => void;
}

export const TacticalOverlay = ({ structure, onClose, isRouteActive, onToggleRoute }: TacticalOverlayProps) => {
  if (!structure) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute top-4 right-4 bottom-4 w-96 bg-white/95 backdrop-blur-md border-l border-slate-200 shadow-2xl z-[1500] text-slate-800 overflow-hidden flex flex-col rounded-l-2xl"
    >
      {/* HUD Header */}
      <div className="relative bg-slate-50 border-b border-slate-200">
        {/* Animated Scanner Line */}
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6]" 
        />
        
        <div className="p-5 relative overflow-hidden">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-blue-200 shadow-sm">
                 <Crosshair className="w-3 h-3 text-blue-600 animate-spin-slow" />
                 <span className="text-[10px] uppercase tracking-[0.2em] text-blue-700 font-mono font-bold">Target Locked</span>
               </div>
               <button 
                 onClick={(e) => { e.stopPropagation(); onClose(); }} 
                 className="group p-1.5 hover:bg-slate-100 rounded-full transition-all border border-transparent hover:border-slate-200"
               >
                 <X className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
               </button>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 font-mono tracking-tighter uppercase">{structure.name}</h2>
            
            <div className="flex items-center justify-between mt-2">
                 <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                   <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">ID: {structure.id}</span>
                   <span>LAT: {(12.9716 + (structure.position.y - 300) / 5000).toFixed(6)}</span>
                 </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Signal Status */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">           <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Uplink Status</span>
              <Signal className={`w-4 h-4 ${structure.gatewayConnectivity && structure.gatewayConnectivity > 50 ? 'text-emerald-500' : 'text-rose-500'}`} />
           </div>
           <div className="flex items-end gap-2">
              <span className="text-3xl font-mono font-bold text-slate-900">{structure.gatewayConnectivity || '?'}%</span>
              <span className="text-xs text-slate-400 mb-1">Signal Quality</span>
           </div>
           <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${structure.gatewayConnectivity || 0}%` }}
              ></div>
           </div>
        </div>

        {/* Health Matrix */}
        <div className="space-y-3">
           <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
             <Activity className="w-3 h-3" /> Sensor Telemetry
           </h3>
           
           <div className="grid grid-cols-1 gap-2">
              {structure.sensors.slice(0, 5).map(sensor => (
                <div key={sensor.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 hover:border-blue-300 hover:bg-white transition-all shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        sensor.health === 'stable' ? 'bg-emerald-500' : 
                        sensor.health === 'warning' ? 'bg-amber-500' : 
                        'bg-rose-500'
                      }`}></div>
                      <span className="text-sm text-slate-700 font-mono">{sensor.name}</span>
                   </div>
                   <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 font-mono">{sensor.value.toFixed(1)}</div>
                      <div className="text-[9px] text-slate-400 uppercase">{sensor.type}</div>
                   </div>
                </div>
              ))}
              {structure.sensors.length > 5 && (
                <div className="text-center p-2 text-xs text-slate-400 font-mono">
                  +{structure.sensors.length - 5} additional sensors active
                </div>
              )}
           </div>
        </div>

        {/* Navigation Panel */}
        <div className={`border p-4 rounded-lg transition-colors duration-300 ${isRouteActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
           <div className="flex items-start gap-3">
              <Navigation className={`w-5 h-5 mt-0.5 ${isRouteActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <div className="flex-1">
                 <h4 className={`text-sm font-bold ${isRouteActive ? 'text-blue-900' : 'text-slate-700'}`}>Navigation</h4>
                 <div className="text-xs text-slate-500 mt-1 mb-3 flex items-center gap-2">
                   <span>Distance: 12.5 km</span>
                   <span>•</span>
                   <span>ETA: 18 mins</span>
                 </div>
                 <button 
                    onClick={onToggleRoute}
                    className={`nav-btn flex items-center justify-center gap-2 text-xs font-bold px-3 py-2 rounded transition-all uppercase tracking-wide shadow-sm w-full ${
                      isRouteActive 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' 
                        : 'bg-white text-blue-600 border border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                 >
                    {isRouteActive ? 'Clear Route' : 'Show Route to Site'}
                    <ChevronRight className={`w-3 h-3 ${isRouteActive ? 'rotate-90' : ''} transition-transform`} />
                 </button>
              </div>
           </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-400 flex justify-between">
         <span>SYS.V.2.4.1</span>
         <span className="animate-pulse text-emerald-600">ONLINE</span>
      </div>
    </motion.div>
  );
};
