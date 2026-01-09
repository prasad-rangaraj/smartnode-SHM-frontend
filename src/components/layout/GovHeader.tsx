import { Shield, Bell, User, Settings, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface GovHeaderProps {
  systemHealth: number;
  alertCount?: number;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onNotificationsClick?: () => void;
  notificationCount?: number;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

export const GovHeader = ({ 
  systemHealth, 
  alertCount = 0, 
  activeTab = 'Dashboard', 
  onTabChange,
  onNotificationsClick,
  notificationCount = 0,
  onSettingsClick,
  onProfileClick
}: GovHeaderProps) => {
  const tabs = ['Dashboard', 'Live Map', 'Inventory', 'Analytics', 'Swarm Status', 'Reports' ];

  return (
    <header className="gov-header relative z-50">
      {/* Top Bar */}
      <div className="px-6 py-1 text-[10px] uppercase tracking-widest text-slate-500 flex items-center justify-between border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Online • NSHIP-V2.4</span>
        </div>
        <span className="font-mono text-slate-400">Sync: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Main Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Modern Logo */}
          <div className="relative group">
             <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full group-hover:bg-primary/20 transition-all"></div>
            <div className="relative w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm text-primary transition-transform group-hover:scale-105 duration-300">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-['Rajdhani'] uppercase flex items-center gap-2">
              SmartNode-SHM <span className="text-primary bg-primary/5 px-2 py-0.5 rounded text-sm tracking-wider">Intelligence</span>
            </h1>
            <p className="text-xs text-slate-500 tracking-wider flex items-center gap-1">
              Autonomous Swarm Monitoring System <span className="w-1 h-1 rounded-full bg-slate-300"></span> Public Works Dept.
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-6">
          {/* System Health Pulse */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                systemHealth >= 80 ? 'bg-emerald-400' : systemHealth >= 60 ? 'bg-amber-400' : 'bg-rose-500'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                systemHealth >= 80 ? 'bg-emerald-500' : systemHealth >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">System Health</span>
              <span className={`text-sm font-bold font-mono leading-none ${
                 systemHealth >= 80 ? 'text-emerald-600' : systemHealth >= 60 ? 'text-amber-600' : 'text-rose-600'
              }`}>{systemHealth.toFixed(1)}%</span>
            </div>
          </div>

          <div className="hidden md:block h-8 w-px bg-slate-200 mx-2"></div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
             <button 
               onClick={onNotificationsClick}
               className="relative p-2 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-lg transition-all duration-300 group"
             >
              <Bell className="w-5 h-5 group-hover:shake" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              )}
            </button>
            <button 
              onClick={onSettingsClick}
              className="p-2 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-lg transition-all duration-300"
            >
              <Settings className="w-5 h-5 hover:rotate-90 transition-transform duration-500" />
            </button>
            <div 
              onClick={onProfileClick}
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 p-[1px] cursor-pointer shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center border border-slate-200 group-hover:border-primary/30">
                <User className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Modern */}
      <div className="px-6 flex gap-1 border-t border-slate-200 bg-white/80 backdrop-blur-md overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange?.(tab)}
              className={`relative px-4 py-3 text-sm font-medium transition-all duration-300 flex flex-col items-center justify-center min-w-[100px] ${
                isActive 
                  ? 'text-primary' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="relative z-10">{tab}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_-2px_8px_rgba(37,99,235,0.3)] animate-in fade-in slide-in-from-bottom-1 duration-300"></span>
              )}
              {isActive && (
                 <span className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-50"></span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
