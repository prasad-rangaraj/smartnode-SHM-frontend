import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { GovHeader } from '@/components/layout/GovHeader';
import { GovSidebar } from '@/components/layout/GovSidebar';
import { StructureCard } from '@/features/dashboard/components/StructureCard';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { AlertsModal } from '@/components/dashboard/AlertsModal';
import { NotificationsDrawer, Notification as AppNotification } from '@/components/layout/NotificationsDrawer';
import { SettingsDrawer } from '@/components/layout/SettingsDrawer';
import { ProfileDrawer } from '@/components/layout/ProfileDrawer';
import { SensorDataTable } from '@/features/dashboard/components/SensorDataTable';
import { DetailedStructureView } from '@/components/dashboard/views/DetailedStructureView'; // Didn't move this.
import { AIAdvisor } from '@/components/dashboard/AIAdvisor';
import { StressTestPanel } from '@/components/dashboard/StressTestPanel';
import { useAppStore, Structure } from '@/store/useAppStore';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { Clock, Calendar, RefreshCw, BarChart3, LayoutDashboard, Play, XSquare, MapPin, Bot, Plus, AlertTriangle } from 'lucide-react';
import { AddStructureModal } from '@/components/dashboard/AddStructureModal';
import { TelemetryModal } from '@/components/dashboard/TelemetryModal';
import { SearchBar } from '@/shared/components/ui/SearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// View Imports
import { LiveMap } from '@/components/dashboard/views/LiveMap'; // Didn't move
import { Analytics } from '@/features/analytics/Analytics';
import { SwarmStatus } from '@/features/network/SwarmStatus';
import { Reports } from '@/features/reports/Reports';
import { InventoryView } from '@/components/dashboard/views/InventoryView';
import { ChatBot } from '@/features/ai/ChatBot';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  structureName: string;
  sensorName: string;
  timestamp: Date;
}

const getUnit = (type: string) => {
  switch (type) {
    case 'vibration': return 'Hz';
    case 'strain': return 'µε';
    case 'temperature': return '°C';
    default: return '';
  }
};

const Index = () => {
  const {
    structures,
    selectedStructureId,
    selectedSensorId,
    selectStructure,
    selectSensor,
    activeTab,
    setActiveTab,
    simulation,
    setSimulationLoad,
    toggleSimulation,
    currentTime,
    updateTime,
    getSelectedStructure,
    getSelectedSensor,
    systemStatus,
    toggleChat,
    maintenanceTasks,
    connectToServer // Added action
  } = useAppStore();

  // Initialize System Connection
  useEffect(() => {
    connectToServer();
  }, [connectToServer]);

  const {
    currentMessage,
    isActive: aiIsActive,
    isThinking,
    triggerZoomIn,
    triggerAnomaly,
    triggerWarning,
    generateLiveInsight, // Destructure new function
  } = useAIAssistant();

  const [messageType, setMessageType] = useState<'info' | 'warning' | 'critical' | 'prediction'>('info');
  
  // Local state for UI only (Search/Filter could be global but keeping local for now as per previous impl, or move to store later)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isAddStructureModalOpen, setIsAddStructureModalOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(new Set());
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const suggestions = useMemo(() => structures.map(s => ({
    id: s.id,
    label: s.name,
    subLabel: s.type,
    type: s.health
  })), [structures]);
  
  // Re-implementing simplified simulation for alerts
  const showStressTest = simulation.active;
  const simulationLoad = simulation.load;

  // AI Insight Generator (Periodic)
  useEffect(() => {
     if (structures.length === 0) return;

     // Run analysis every 30 seconds
     const analysisInterval = setInterval(() => {
         const randomStructure = structures[Math.floor(Math.random() * structures.length)];
         if (randomStructure) {
             setMessageType('prediction');
             generateLiveInsight(randomStructure);
         }
     }, 30000);

     return () => clearInterval(analysisInterval);
  }, [structures, generateLiveInsight]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => updateTime(), 1000);
    return () => clearInterval(timer);
  }, [updateTime]);



  const alerts = useMemo<Alert[]>(() => {
    const alertList: Alert[] = [];
    
    // Add real sensor alerts
    structures.forEach((structure) => {
      structure.sensors.forEach((sensor) => {
        if (sensor.health === 'critical') {
          alertList.push({
            id: `${structure.id}-${sensor.id}-critical`,
            type: 'critical',
            title: `Critical reading: ${sensor.type}`,
            message: `${sensor.name} value ${sensor.value.toFixed(1)}${getUnit(sensor.type)} exceeds safety threshold.`,
            structureName: structure.name,
            sensorName: sensor.name,
            timestamp: new Date(Date.now() - Math.random() * 3600000),
          });
        }
        if (sensor.health === 'warning') {
          alertList.push({
            id: `${structure.id}-${sensor.id}-warning`,
            type: 'warning',
            title: `Warning reading: ${sensor.type}`,
            message: `${sensor.name} value ${sensor.value.toFixed(1)}${getUnit(sensor.type)} is approaching safety threshold.`,
            structureName: structure.name,
            sensorName: sensor.name,
            timestamp: new Date(Date.now() - Math.random() * 3600000),
          });
        }
      });

      // Structure level warnings
      if (structure.health === 'warning' && !structure.sensors.some(s => s.health === 'critical' || s.health === 'warning')) {
         alertList.push({
            id: `${structure.id}-damage-warning`,
            type: 'warning',
            title: `Structural Warning: ${structure.name}`,
            message: `Potential structural integrity issues detected.`,
            structureName: structure.name,
            sensorName: 'Structural Monitor',
            timestamp: new Date(),
         });
      }
    });

    // Add Simulated Alerts
    if (showStressTest && simulationLoad > 60) {
       alertList.unshift({
        id: `sim-warning-${Date.now()}`,
        type: 'warning',
        title: 'Simulation: Structural Stress',
        message: `Applied load ${simulationLoad}kN exceeds standard operating limits.`,
        structureName: 'Simulation Env',
        sensorName: 'Strain Gauge A1',
        timestamp: new Date(),
       });
    }

    if (showStressTest && simulationLoad > 85) {
      alertList.unshift({
       id: `sim-critical-${Date.now()}`,
       type: 'critical',
       title: 'SIMULATION: CRITICAL FAILURE',
       message: `Plastic deformation detected. Load ${simulationLoad}kN exceeds ultimate tensile strength.`,
       structureName: 'Simulation Env',
       sensorName: 'Integrity Monitor',
       timestamp: new Date(),
      });
   }
    
    // Add Pending Review Tasks (Complaints/Reviews)
    maintenanceTasks.filter(t => t.status === 'Pending Review').forEach(task => {
        alertList.unshift({
            id: `review-${task.id}`,
            type: task.item.includes('Damage') || task.item.includes('Critical') ? 'warning' : 'info',
            title: 'Review Required',
            message: `${task.item} submitted by Worker #${task.assignedToId || '?'}`,
            structureName: 'Maintenance System',
            sensorName: task.type,
            timestamp: new Date() // Fallback since we don't track updatedAt yet
        });
    });

    return alertList
      .filter(a => !dismissedAlertIds.has(a.id))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [structures, showStressTest, simulationLoad, dismissedAlertIds, maintenanceTasks]);



  const handleDismissAlert = (id: string) => {
    setDismissedAlertIds(prev => new Set(prev).add(id));
  };

  const handleClearAllAlerts = () => {
    // Collect all current alert IDs
    const currentAlertIds = alerts.map(a => a.id);
    setDismissedAlertIds(prev => {
      const next = new Set(prev);
      currentAlertIds.forEach(id => next.add(id));
      return next;
    });
    // Optional: Close modal if clear all is clicked? 
    // Or keep it open to show empty state. Let's keep it open.
  };

  // Generate Notifications (Merging Alerts + Mock Events)
  const notifications = useMemo<AppNotification[]>(() => {
    const list: AppNotification[] = [];

    // 1. Convert Alerts to Notifications
    alerts.forEach(alert => {
      // Map alert type to notification type
      // 'critical' -> 'alert', 'warning' -> 'alert', 'info' -> 'info'
      list.push({
        id: `notif-${alert.id}`,
        type: 'alert',
        title: alert.title,
        message: alert.message,
        timestamp: alert.timestamp,
        read: false 
      });
    });

    // 2. Add some mock system updates (if not dismissed)
    const mockEvents: AppNotification[] = [
      {
        id: 'sys-update-1',
        type: 'update',
        title: 'System Update Completed',
        message: 'Patch v2.4.1 installed successfully. Performance improved by 15%.',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        read: true
      },
      {
        id: 'sys-maint-1',
        type: 'system',
        title: 'Scheduled Maintenance',
        message: 'Routine drone swarm calibration scheduled for 02:00 AM UTC.',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        read: true
      },
      {
        id: 'usr-login-1',
        type: 'info',
        title: 'New Login Detected',
        message: 'Admin user accessed the dashboard from a new device (IP: 192.168.1.45).',
        timestamp: new Date(Date.now() - 4500000),
        read: false
      }
    ];

    mockEvents.forEach(evt => list.push(evt));

    // Sort by time
    return list
      .filter(n => !dismissedNotificationIds.has(n.id))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  }, [alerts, dismissedNotificationIds]);

  const handleDismissNotification = (id: string) => {
    setDismissedNotificationIds(prev => new Set(prev).add(id));
  };

  const handleClearAllNotifications = () => {
     const currentIds = notifications.map(n => n.id);
     setDismissedNotificationIds(prev => {
       const next = new Set(prev);
       currentIds.forEach(id => next.add(id));
       return next;
     });
  };

  // Calculate Real System Health
  const systemHealth = useMemo(() => {
    if (systemStatus === 'emergency-lockdown') return 0;
    if (structures.length === 0) return 0;
    const stableCount = structures.filter(s => s.health === 'stable').length;
    return Math.round((stableCount / structures.length) * 100);
  }, [structures, systemStatus]);

  // Handle structure selection
  const handleStructureSelect = useCallback((id: string) => {
    if (id && id !== selectedStructureId) {
      const structure = structures.find((s) => s.id === id);
      if (structure) {
        triggerZoomIn(structure);
        setMessageType('info');
      }
    }
    selectStructure(id || null);
  }, [selectedStructureId, structures, triggerZoomIn, selectStructure]);

  const handleSensorSelect = (sensorId: string) => {
     selectSensor(sensorId === selectedSensorId ? null : sensorId);
  };

  const selectedStructureData = getSelectedStructure();
  
  // Simulation Health Override for UI
  const getSimulatedHealth = (originalHealth: 'stable' | 'warning' | 'critical') => {
    if (!showStressTest) return originalHealth;
    if (simulationLoad > 85) return 'critical';
    if (simulationLoad > 60) return 'warning';
    return originalHealth;
  };

  // Derive unique locations
  const locations = useMemo(() => {
    const locs = new Set(structures.map(s => s.location).filter(Boolean));
    return ['All', ...Array.from(locs)];
  }, [structures]);

  const filteredStructures = structures.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'All' || s.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const processedAlertIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    alerts.forEach(alert => {
      if (!processedAlertIds.current.has(alert.id)) {
        processedAlertIds.current.add(alert.id);
        
        // Map alert type to toast type
        const toastType = alert.type === 'critical' ? 'error' : 
                          alert.type === 'warning' ? 'warning' : 'info';
        
        // Trigger Toast with Description
        toast[toastType](alert.title, {
          description: alert.message,
          // Add action for view details if needed
          action: {
            label: "View",
            onClick: () => {
               // Logic to view details
               if (alert.structureName) handleStructureSelect(structures.find(s => s.name === alert.structureName)?.id || '');
            }
          }
        });
      }
    });
  }, [alerts, structures, handleStructureSelect]);

  return (
    <div className={`min-h-screen bg-background flex flex-col font-sans text-slate-900 ${systemStatus === 'emergency-lockdown' ? 'ring-4 ring-rose-500 ring-inset' : ''}`}>
      
      {/* Global Critical Alert Popup */}
      <AnimatePresence>
        {alerts.some(a => a.type === 'critical') && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 bg-rose-500 text-white rounded-full shadow-2xl border-4 border-white/20 backdrop-blur-md"
          >
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-bold text-sm uppercase tracking-wider">Critical Failure Detected</span>
              <span className="text-xs font-medium opacity-90">{alerts.filter(a => a.type === 'critical').length} active critical alerts require immediate attention.</span>
            </div>
            <button 
              onClick={() => setIsAlertsModalOpen(true)}
              className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-bold transition-colors"
            >
              View
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <GovHeader 
        systemHealth={systemHealth} 
        alertCount={alerts.filter(a => a.type === 'critical').length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificationCount={notifications.filter(n => !n.read).length}
        onNotificationsClick={() => setIsNotificationsOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <GovSidebar structures={structures} />

        <main className="flex-1 overflow-auto p-8 canvas-bg relative">
          
          {activeTab === 'Dashboard' && (
            <div className="flex items-end justify-between mb-8 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <div className="p-1.5 bg-white rounded shadow-sm border border-slate-200 text-primary">
                      <LayoutDashboard className="w-5 h-5" />
                   </div>
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dashboard Overview</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Structural Health Monitor
                </h2>
                <p className="text-slate-500 mt-1 max-w-2xl">
                  Real-time analysis and anomaly detection for critical infrastructure assets.
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 text-sm text-slate-500 border-r border-slate-100 pr-4">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-mono text-slate-700">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                <button 
                  onClick={() => {
                    updateTime();
                    toast.success("Synchronized", { description: "Latest telemetry pulled from mesh network." });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600
                  text-sm font-medium rounded-lg hover:bg-slate-100 hover:text-primary transition-all border border-slate-200">
                  <RefreshCw className="w-4 h-4" />
                  Sync Data
                </button>
              </div>
            </div>
          )}

          <div className="relative z-10">
            {activeTab === 'Dashboard' && (
              <>
                <div className="grid grid-cols-12 gap-6 relative z-10">
                  <div className="col-span-8 space-y-6">
                    {/* Search Bar & Filters */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                           <SearchBar 
                               placeholder="Search assets..." 
                               onSearch={setSearchQuery} 
                               suggestions={suggestions}
                               onSuggestionSelect={(s) => {
                                   setSearchQuery(s.label);
                                   handleStructureSelect(s.id);
                               }}
                           />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none min-w-[160px]"
                            >
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                         <span className="w-1 h-6 bg-primary rounded-full"></span>
                         Monitored Assets
                       </h3>
                       <span className="px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-500 shadow-sm">
                         {filteredStructures.length} / {structures.length} Active Nodes
                       </span>
                    </div>

                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => setIsAddStructureModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:border-primary hover:text-primary transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Asset
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-5">
                      {filteredStructures.map((structure) => (
                        <StructureCard
                          key={structure.id}
                          id={structure.id}
                          name={structure.name}
                          type={structure.type}
                          health={getSimulatedHealth(structure.health)}
                          sensors={structure.sensors}
                          location={structure.location}
                          gatewayConnectivity={structure.gatewayConnectivity}
                          isSelected={selectedStructureId === structure.id}
                          onSelect={() => handleStructureSelect(structure.id)}
                          onViewDetails={() => {
                             handleStructureSelect(structure.id);
                             setIsTelemetryModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
    
                  <div className="col-span-4 space-y-6">
                     <div className="flex items-center justify-between">
                       <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                         <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
                         Intelligence Layer
                       </h3>
                    </div>
    
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden filter backdrop-blur-sm">
                      <AIAdvisor
                        message={currentMessage}
                        isActive={aiIsActive}
                        isThinking={isThinking}
                        messageType={messageType}
                        onGenerateReport={() => setActiveTab('Reports')}
                        onViewPredictions={() => setActiveTab('Analytics')}
                        onAskAI={toggleChat}
                      />
                    </div>
    
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4">
                       <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">System Alerts</h4>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded uppercase">
                            Live Feed
                          </span>
                       </div>
                       <AlertPanel 
                         alerts={alerts} 
                         onDismiss={handleDismissAlert}
                         onViewAll={() => setIsAlertsModalOpen(true)}
                       />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Live Map' && <LiveMap />}
            {activeTab === 'Analytics' && <Analytics />}
            {activeTab === 'Swarm Status' && <SwarmStatus />}
            {activeTab === 'Reports' && <Reports />}
            {activeTab === 'Inventory' && <InventoryView />}
          </div>
        </main>
        <ChatBot />
        
        {/* Floating AI Button */}
        {!useAppStore().isChatOpen && (
          <button
            onClick={toggleChat}
            className="fixed bottom-6 right-6 p-4 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-2xl z-50 transition-all hover:scale-110 active:scale-95 group"
          >
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
            <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </button>
        )}
      </div>

      <AlertsModal 
        alerts={alerts}
        open={isAlertsModalOpen}
        onOpenChange={setIsAlertsModalOpen}
        onDismiss={handleDismissAlert}
        onClearAll={handleClearAllAlerts}
      />

      <NotificationsDrawer
        notifications={notifications}
        open={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
        onDismiss={handleDismissNotification}
        onClearAll={handleClearAllNotifications}
      />

      <SettingsDrawer 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
      />
      
      <ProfileDrawer 
        open={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
      />

      <AddStructureModal
        open={isAddStructureModalOpen}
        onOpenChange={setIsAddStructureModalOpen}
      />

      <TelemetryModal 
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        structure={selectedStructureData || null}
        selectedSensorId={selectedSensorId}
        onSelectSensor={handleSensorSelect}
      />
    </div>
  );
};

export default Index;
