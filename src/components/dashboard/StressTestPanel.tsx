import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Sliders, AlertTriangle, Play, RefreshCw, Activity } from 'lucide-react';

interface StressTestPanelProps {
  onLoadChange: (load: number) => void;
  onReset: () => void;
  isActive: boolean;
}

export const StressTestPanel = ({ onLoadChange, onReset, isActive }: StressTestPanelProps) => {
  const [load, setLoad] = useState(0);
  const controls = useAnimation();
  const alertControls = useAnimation();

  useEffect(() => {
    // Animate beam bending based on load
    // Max deflection of 40px at 100% load
    const deflection = (load / 100) * 40;
    
    controls.start({
      d: `M 50,150 Q 200,${150 + deflection} 350,150`,
      transition: { type: "spring", stiffness: 120, damping: 20 }
    });

    // Notify parent of load change
    onLoadChange(load);

    // Trigger visual alerts if load is critical
    if (load > 80) {
      alertControls.start({
        opacity: [0, 1, 0],
        transition: { repeat: Infinity, duration: 0.5 }
      });
    } else {
      alertControls.stop();
      alertControls.set({ opacity: 0 });
    }

  }, [load, controls, alertControls, onLoadChange]);

  const handleReset = () => {
    setLoad(0);
    onReset();
  };

  if (!isActive) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden mb-6"
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 rounded text-indigo-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Structural Stress Simulation</h3>
            <p className="text-xs text-slate-500">Physics-based load response testing</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {load > 80 && (
             <motion.div 
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ repeat: Infinity, duration: 1 }}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold"
             >
               <AlertTriangle className="w-3 h-3" />
               CRITICAL LOAD
             </motion.div>
           )}
           <button 
             onClick={handleReset}
             className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 rounded hover:bg-slate-200 transition-colors"
           >
             <RefreshCw className="w-3 h-3" /> Reset
           </button>
        </div>
      </div>

      <div className="p-8 grid grid-cols-12 gap-8">
        {/* Visualization Canvas */}
        <div className="col-span-8 bg-slate-900 rounded-lg relative overflow-hidden h-64 flex items-center justify-center p-4 border border-slate-200 shadow-inner">
           {/* Grid Background */}
           <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
               backgroundSize: '20px 20px'
             }}>
           </div>
           
           <div className="absolute top-4 left-4 text-xs font-mono text-slate-400">
             SIM_ENV_01: BEAM_FLEX_TEST
           </div>

           {/* Load Arrow */}
           <motion.div 
             className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
             animate={{ y: (load / 100) * 40 }}
           >
             <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-slate-600">
               {load} kN
             </div>
             <motion.div 
               animate={{ height: 40 + (load/2) }}
               className={`w-1 transition-colors duration-300 ${
                 load > 80 ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 
                 load > 50 ? 'bg-amber-500' : 'bg-cyan-500'
               }`}
             />
             <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] transition-colors duration-300 ${
                 load > 80 ? 'border-t-rose-500 drop-shadow-[0_0_5px_#f43f5e]' : 
                 load > 50 ? 'border-t-amber-500' : 'border-t-cyan-500'
             }`} />
           </motion.div>

           {/* The Beam SVG */}
           <svg width="400" height="300" className="w-full h-full">
              {/* Supports */}
              <rect x="40" y="150" width="20" height="100" fill="#475569" />
              <rect x="340" y="150" width="20" height="100" fill="#475569" />
              
              {/* The Bending Beam */}
              {/* Using a path with a quadratic bezier curve for realistic bending */}
              <motion.path
                initial={{ d: "M 50,150 Q 200,150 350,150" }}
                animate={controls}
                fill="none"
                stroke={load > 85 ? "#f43f5e" : load > 60 ? "#f59e0b" : "#38bdf8"}
                strokeWidth="8"
                strokeLinecap="round"
                style={{
                   filter: load > 85 ? "drop-shadow(0 0 8px rgba(244, 63, 94, 0.6))" : "none"
                }}
              />
              
              {/* Heatmap overlay points (Stress concentration) */}
              {load > 50 && (
                <motion.circle 
                  cx="200" 
                  animate={{ cy: 150 + (load / 100) * 40 }}
                  r={load / 5} 
                  fill="url(#stressGradient)" 
                  opacity={load / 150}
                />
              )}

              <defs>
                <radialGradient id="stressGradient">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
           </svg>
           
           {/* Critical Alert Overlay on Canvas */}
           <motion.div 
             animate={alertControls}
             className="absolute inset-0 bg-rose-500/10 pointer-events-none border-2 border-rose-500/50"
           />
        </div>

        {/* Controls */}
        <div className="col-span-4 flex flex-col justify-center space-y-8">
           <div>
             <label className="flex items-center justify-between text-sm font-bold text-slate-700 mb-4">
               <span>Applied Load</span>
               <span className="font-mono text-primary bg-blue-50 px-2 py-1 rounded">{load}%</span>
             </label>
             <input 
               type="range" 
               min="0" 
               max="100" 
               value={load} 
               onChange={(e) => setLoad(parseInt(e.target.value))}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
             />
             <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
               <span>0 kN</span>
               <span>50 kN</span>
               <span>100 kN</span>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-slate-50 rounded border border-slate-100">
               <div className="text-xs text-slate-500 mb-1">Deflection</div>
               <div className="font-mono font-bold text-slate-700">
                 {((load / 100) * 12).toFixed(1)} cm
               </div>
             </div>
             <div className="p-3 bg-slate-50 rounded border border-slate-100">
               <div className="text-xs text-slate-500 mb-1">Strain</div>
               <div className={`font-mono font-bold ${load > 80 ? 'text-rose-600' : 'text-slate-700'}`}>
                 {(load * 1.2).toFixed(0)} µε
               </div>
             </div>
           </div>

           <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <h4 className="flex items-center gap-2 text-xs font-bold text-blue-700 mb-2">
               <Play className="w-3 h-3" /> Simulation Active
             </h4>
             <p className="text-[10px] text-blue-600 leading-relaxed">
               Adjust the slider to simulate live structural loads. Sensor thresholds will trigger alerts automatically at &gt;60% load.
             </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
};
