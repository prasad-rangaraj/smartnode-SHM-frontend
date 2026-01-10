import { Map, Activity, AlertTriangle, FileText, ChevronRight, Brain, TrendingUp, Zap, Database, RefreshCw, Signal, ShieldAlert } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';

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

interface Structure {
  id: string;
  name: string;
  type: 'building' | 'bridge' | 'flyover';
  health: 'stable' | 'warning' | 'critical';
  sensors: Sensor[];
}

interface GovSidebarProps {
  structures: Structure[];
}



export const GovSidebar = ({ structures }: GovSidebarProps) => {
  const { setActiveTab, repairAll, setSystemStatus, systemStatus, addMaintenanceTask } = useAppStore(); // Added addMaintenanceTask
  const criticalCount = structures.filter(s => s.health === 'critical').length;
  const warningCount = structures.filter(s => s.health === 'warning').length;

  const [calibrationStatus, setCalibrationStatus] = useState<'idle' | 'calibrating' | 'done'>('idle');
  const [pingStatus, setPingStatus] = useState<number | null>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(structures, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nship_telemetry_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalibration = () => {
    setCalibrationStatus('calibrating');
    // Global State Effect: Set system to recalibrating
    setSystemStatus('recalibrating');
    
    setTimeout(() => {
        repairAll(); // This actually fixes the health in the store!
        setCalibrationStatus('done');
    }, 2000);
    
    setTimeout(() => {
        setCalibrationStatus('idle');
    }, 4000);
  };

  const handlePing = () => {
    setPingStatus(Math.floor(Math.random() * 40) + 10);
    setTimeout(() => setPingStatus(null), 3000);
  };

  const handleEmergency = () => {
    const confirmed = window.confirm("INITIATE EMERGENCY PROTOCOL?\n\nThis will trigger system-wide alerts and lock down non-critical sensors.");
    if (confirmed) {
        setSystemStatus('emergency-lockdown');
        
        // Notify Worker immediately via Task System
        const errorSensor = structures.flatMap(s => s.sensors).find(s => s.health === 'critical') || structures[0].sensors[0];
        const location = structures.find(s => s.sensors.includes(errorSensor))?.name || "Unknown Sector";

        addMaintenanceTask({
            item: `🚨 EMERGENCY: Check ${errorSensor.name} at ${location}`,
            type: 'Inspection',
            status: 'In Progress', // Skip 'Pending' to show immediately
            priority: 'High',
            due: new Date().toISOString().split('T')[0]
        });

        alert("PROTOCOL INITIATED. FIELD TEAMS NOTIFIED.");
    }
  };

  return (
    <aside className="w-80 backdrop-blur-xl bg-white/80 border-r border-slate-200 flex flex-col h-full shadow-lg z-40">
      {/* Summary Stats */}
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          Fleet Status
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="text-2xl font-bold text-amber-500 font-mono">{warningCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Warning</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="text-2xl font-bold text-rose-500 font-mono">{criticalCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Critical</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* Field Operations */}
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          Field Operations
        </h2>
        <div className="space-y-1">
          <button 
             onClick={handleCalibration}
             disabled={calibrationStatus === 'calibrating'}
             className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left text-slate-600 hover:text-primary hover:bg-slate-50 rounded-md transition-all group border border-transparent hover:border-slate-100"
          >
            <RefreshCw className={`w-4 h-4 text-blue-500 ${calibrationStatus === 'calibrating' ? 'animate-spin' : ''}`} />
            <span>{calibrationStatus === 'idle' ? 'Recalibrate Sensors' : calibrationStatus === 'calibrating' ? 'Calibrating...' : 'Calibration Complete'}</span>
          </button>

          <button 
             onClick={handlePing}
             className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left text-slate-600 hover:text-primary hover:bg-slate-50 rounded-md transition-all group border border-transparent hover:border-slate-100"
          >
            <Signal className="w-4 h-4 text-violet-500" />
            <span>{pingStatus ? `Network Latency: ${pingStatus}ms` : 'Ping Mesh Network'}</span>
          </button>

          <button 
             onClick={handleExport}
             className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left text-slate-600 hover:text-primary hover:bg-slate-50 rounded-md transition-all group border border-transparent hover:border-slate-100"
          >
            <Database className="w-4 h-4 text-emerald-500" />
            <span>Export System Logs</span>
          </button>

          <button 
             onClick={handleEmergency}
             className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left text-rose-600 hover:bg-rose-50 rounded-md transition-all group border border-transparent hover:border-rose-100"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="font-bold">Emergency Protocol</span>
          </button>
        </div>
      </div>

      {/* AI Insights & Predictions */}
      <div className="flex-1 overflow-auto p-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 
          flex items-center gap-2">
          <Brain className="w-3 h-3 text-violet-500" />
          AI Insights & Predictions
        </h2>
        
        <div className="space-y-3">
          {/* Prediction 1 - Maintenance ROI (Simulated based on stable sensors) */}
          <div className="bg-violet-50/50 border border-violet-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Maintenance ROI</span>
              <TrendingUp className="w-3 h-3 text-violet-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              +{Math.min(98, Math.floor((structures.length - criticalCount) / structures.length * 30))}%
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Optimized scheduling saved approx. <strong>$1.2M</strong> in Q4.
            </p>
          </div>

          {/* Prediction 2 - Predicted Failures (Based on Warning/Stable ratios) */}
          <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Critical Failures</span>
              <Activity className="w-3 h-3 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
               {warningCount > 0 ? Math.ceil(warningCount * 0.4) : 0}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Predicted for next 14 days based on current strain patterns.
            </p>
          </div>

           {/* Prediction 3 - Energy Efficiency (Inverse to critical alerts) */}
           <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Energy Efficiency</span>
              <Zap className="w-3 h-3 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
               {(100 - (criticalCount * 2.5) - (warningCount * 0.5)).toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sensor network operating at peak power efficiency.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
             <button 
               onClick={() => setActiveTab('Reports')}
               className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800 transition-colors shadow-sm"
             >
                Generate AI Audit
             </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 text-center font-mono uppercase tracking-widest">
        NSHIP System v2.4.1 [BETA]
      </div>
    </aside>
  );
};
