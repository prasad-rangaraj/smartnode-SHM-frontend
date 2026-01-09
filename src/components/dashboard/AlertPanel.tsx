import { AlertTriangle, AlertCircle, Info, Clock, ChevronRight, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  structureName: string;
  sensorName: string;
  timestamp: Date;
}

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
  onViewAlert?: (id: string) => void;
  onViewAll?: () => void;
}

export const AlertPanel = ({ alerts, onDismiss, onViewAlert, onViewAll }: AlertPanelProps) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-critical" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50/50 border-red-100 text-red-900';
      case 'warning':
        return 'bg-amber-50/50 border-amber-100 text-amber-900';
      default:
        return 'bg-slate-50/50 border-slate-100 text-slate-900';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-700">System Alerts</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">No active alerts</p>
          <p className="text-slate-400 text-xs mt-1">All systems operating normally</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-700">System Alerts</h3>
          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full border border-red-200">
            {alerts.length}
          </span>
        </div>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-xs text-primary hover:text-primary/80 font-bold hover:underline"
          >
            View All
          </button>
        )}
      </div>

      {/* Alert List */}
      <div className="p-2 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {alerts.slice(0, 5).map((alert) => (
          <div 
            key={alert.id}
            className={`p-3 rounded-lg border transition-all  hover:shadow-sm ${getAlertStyles(alert.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                 {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-sm truncate">{alert.title}</h4>
                  {onDismiss && (
                    <button 
                      onClick={() => onDismiss(alert.id)}
                      className="p-1 hover:bg-black/5 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )}
                </div>
                <p className="text-sm opacity-90 mb-2 leading-relaxed">{alert.message}</p>
                <div className="flex items-center justify-between border-t border-black/5 pt-2 mt-1">
                  <div className="flex items-center gap-2 text-xs opacity-70">
                    <span className="font-semibold">{alert.structureName}</span>
                    <span>•</span>
                    <span>{alert.sensorName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs opacity-60 font-medium">
                    <Clock className="w-3 h-3" />
                    {formatTime(alert.timestamp)}
                  </div>
                </div>
              </div>
            </div>
            {onViewAlert && (
              <button 
                onClick={() => onViewAlert(alert.id)}
                className="mt-2 w-full flex items-center justify-center gap-1 text-xs font-bold py-1.5 rounded bg-white/50 hover:bg-white border border-black/5 transition-all text-primary"
              >
                View Details
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
