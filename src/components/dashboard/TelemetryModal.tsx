import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Activity } from 'lucide-react';
import { DetailedStructureView } from './views/DetailedStructureView';
import { Structure } from '@/store/useAppStore';

interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  structure: Structure | null;
  selectedSensorId: string | null;
  onSelectSensor: (id: string) => void;
}

export const TelemetryModal = ({ 
  isOpen, 
  onClose, 
  structure, 
  selectedSensorId, 
  onSelectSensor 
}: TelemetryModalProps) => {
  // Portal Content
  const content = (
    <AnimatePresence mode="wait">
      {isOpen && structure && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-primary" />
                    Real-time Telemetry
                  </h2>
                  <p className="text-slate-500 mt-1 font-medium">
                    Live sensor feed for <span className="font-bold text-slate-900">{structure.name}</span>
                  </p>
               </div>
               
               <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      structure.health === 'stable' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      structure.health === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {structure.health} Status
                  </span>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
               </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
               <DetailedStructureView 
                 sensors={structure.sensors}
                 selectedSensorId={selectedSensorId}
                 onSelectSensor={onSelectSensor}
                 gatewayConnectivity={structure.gatewayConnectivity}
               />
            </div>
            
            {/* Footer */}
            <div className="px-8 py-4 border-t border-slate-100 bg-white text-xs text-slate-400 font-mono flex justify-between">
                <span>ID: {structure.id}</span>
                <span>Last Synced: Just now</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
};
