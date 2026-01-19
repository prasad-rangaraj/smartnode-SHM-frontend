import { create } from 'zustand';
import { toast } from 'sonner';

// Types (Mirrored from original useStructureData for compatibility initially)
export interface Sensor {
  id: string;
  name: string;
  x: number;
  y: number;
  health: 'stable' | 'warning' | 'critical';
  value: number;
  type: 'vibration' | 'strain' | 'temperature';
  trend: number[];
  block: string;
}

export interface Structure {
  id: string;
  name: string;
  type: 'building' | 'bridge' | 'flyover';
  health: 'stable' | 'warning' | 'critical';
  sensors: Sensor[];
  position: { x: number; y: number };
  scale: number;
  lastAnomaly?: Date;
  location: string;
  gps?: { lat: number; lng: number; };
  gatewayConnectivity?: number; // 0-100%
}

export interface MaintenanceTask {
  id: string;
  item: string;
  type: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue' | 'Pending Review';
  due: string;
  priority: 'Low' | 'Medium' | 'High';
  assignedToId?: number;
  assignedTo?: { email: string; id: number };
}

export interface InventoryReport {
  id: string;
  title: string;
  date: string;
  size: string;
  author: string;
  content?: string;
}

export interface AppState {
  // Data
  structures: Structure[];
  selectedStructureId: string | null;
  selectedSensorId: string | null;
  
  // Dashboard State
  activeTab: string;
  currentTime: Date;
  
  // Simulation State
  simulation: {
    active: boolean;
    load: number;
  };
  
  // System State (Added for Field Ops)
  systemStatus: 'nominal' | 'emergency-lockdown' | 'recalibrating';
  
  // Auth State
  user: { id: number; email: string; role: string } | null;
  token: string | null;

  // Inventory State
  maintenanceTasks: MaintenanceTask[];
  inventoryReports: InventoryReport[];

  // WebSocket State
  socket: WebSocket | null;
  isConnected: boolean;

  // Actions
  setStructures: (structures: Structure[] | ((prev: Structure[]) => Structure[])) => void;
  addStructure: (structure: Structure) => void; 
  selectStructure: (id: string | null) => void;
  selectSensor: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  setSimulationLoad: (load: number) => void;
  toggleSimulation: () => void;
  updateTime: () => void;
  
  // Field Ops Actions
  repairAll: () => void;
  setSystemStatus: (status: 'nominal' | 'emergency-lockdown' | 'recalibrating') => void;

  // Auth Actions
  login: (token: string, user: { id: number; email: string; role: string }) => void;
  logout: () => void;

  // Inventory Actions
  fetchMaintenanceTasks: (userId?: number) => Promise<void>;
  fetchInventoryReports: () => Promise<void>;
  addMaintenanceTask: (task: Partial<MaintenanceTask>) => Promise<void>;
  updateMaintenanceTaskStatus: (id: string, status: MaintenanceTask['status']) => Promise<void>;
  addInventoryReport: (report: Partial<InventoryReport>) => Promise<void>;
  
  // Socket Actions
  connectToServer: () => void;
  
  // Chat State
  isChatOpen: boolean;
  toggleChat: () => void;

  // Computed (Actions that return values)
  getSelectedStructure: () => Structure | null;
  getSelectedSensor: () => Sensor | null;
}

// Initial Mock Data
const initialStructures: Structure[] = [
  {
    id: 'tower-alpha',
    name: 'Tower Alpha',
    type: 'building',
    health: 'stable',
    position: { x: 180, y: 180 },
    scale: 0.9,
    location: 'City Center',
    gatewayConnectivity: 98,
    sensors: [
      // Tile 1: Main Core (Node 1)
      { id: 's1', name: 'N1: Vibration (Core)', x: 50, y: 50, health: 'stable', value: 45.2, type: 'vibration', trend: [42, 44, 45, 43, 45], block: 'Main Core' },
      { id: 's2', name: 'N1: Strain (Main)', x: 50, y: 50, health: 'stable', value: 23.8, type: 'strain', trend: [22, 23, 24, 23, 24], block: 'Main Core' },
      
      // Tile 2: Roof Deck (Node 2)
      { id: 's3', name: 'N2: Temperature', x: 50, y: 15, health: 'stable', value: 28.4, type: 'temperature', trend: [27, 28, 28, 29, 28], block: 'Roof Deck' },
      { id: 's4', name: 'N2: Vibration', x: 50, y: 15, health: 'stable', value: 12.1, type: 'vibration', trend: [11, 12, 12, 13, 12], block: 'Roof Deck' },
      
      // Tile 3: Foundation (Node 3)
      { id: 's5', name: 'N3: Vibration', x: 50, y: 85, health: 'stable', value: 32.7, type: 'vibration', trend: [31, 32, 33, 32, 33], block: 'Foundation' },
    ],
  },
  {
    id: 'bridge-nexus',
    name: 'Bridge Nexus',
    type: 'bridge',
    health: 'warning',
    position: { x: 500, y: 320 },
    scale: 0.85,
    location: 'River Zone',
    gatewayConnectivity: 72, // Amber warning
    sensors: [
      // Tile 1: Suspension A
      { id: 'b1', name: 'Cable A Strain', x: 25, y: 40, health: 'stable', value: 41.3, type: 'strain', trend: [40, 41, 40, 42, 41], block: 'Suspension A' },
      
      // Tile 2: Central Deck (Has Warning)
      { id: 'b2', name: 'Deck Vib 1', x: 50, y: 50, health: 'warning', value: 78.9, type: 'vibration', trend: [65, 70, 75, 78, 79], block: 'Central Deck' },
      { id: 'b3', name: 'Deck Temp 1', x: 50, y: 50, health: 'stable', value: 31.5, type: 'temperature', trend: [30, 31, 31, 32, 32], block: 'Central Deck' },
      
      // Tile 3: Suspension B
      { id: 'b4', name: 'Cable B Strain', x: 75, y: 40, health: 'stable', value: 39.2, type: 'strain', trend: [38, 39, 38, 40, 39], block: 'Suspension B' },
    ],
  },
  {
    id: 'flyover-beta',
    name: 'Flyover Beta',
    type: 'flyover',
    health: 'stable',
    location: 'North Zone',
    position: { x: 850, y: 200 },
    scale: 0.8,
    gatewayConnectivity: 45, // Red critical connectivity
    sensors: [
      // Tile 1: Ramp Up
      { id: 'f1', name: 'Ramp Vib 1', x: 20, y: 60, health: 'stable', value: 22.1, type: 'vibration', trend: [21, 22, 21, 23, 22], block: 'Ramp Up' },
      
      // Tile 2: Main Span
      { id: 'f2', name: 'Span Load 1', x: 50, y: 40, health: 'stable', value: 45.6, type: 'strain', trend: [44, 45, 46, 45, 46], block: 'Main Span' },
      { id: 'f3', name: 'Span Vib 1', x: 50, y: 40, health: 'stable', value: 18.5, type: 'vibration', trend: [18, 19, 18, 18, 19], block: 'Main Span' },
      { id: 'f4', name: 'Span Temp 1', x: 50, y: 40, health: 'stable', value: 26.2, type: 'temperature', trend: [25, 26, 26, 27, 26], block: 'Main Span' },
      
      // Tile 3: Ramp Down
      { id: 'f5', name: 'Ramp Vib 2', x: 80, y: 60, health: 'stable', value: 21.8, type: 'vibration', trend: [20, 21, 22, 21, 22], block: 'Ramp Down' },
    ],
  },
];

const initialInventoryReports: InventoryReport[] = [];

export const useAppStore = create<AppState>((set, get) => ({
  structures: initialStructures,
  selectedStructureId: null,
  selectedSensorId: null,
  activeTab: 'Dashboard',
  currentTime: new Date(),
  simulation: {
    active: false,
    load: 0
  },
  systemStatus: 'nominal',
  isChatOpen: false,
  // Auth Init (Check localStorage)
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null,
  maintenanceTasks: [],
  inventoryReports: initialInventoryReports, // Keep empty initially
  socket: null,
  isConnected: false,

  setStructures: (input) => set((state) => ({
    structures: typeof input === 'function' ? input(state.structures) : input
  })),

  addStructure: (structure) => set((state) => ({
    structures: [...state.structures, structure]
  })),

  selectStructure: (id) => set({ selectedStructureId: id, selectedSensorId: null }),
  selectSensor: (id) => set({ selectedSensorId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  
  setSimulationLoad: (load) => set((state) => ({ 
    simulation: { ...state.simulation, load } 
  })),

  toggleSimulation: () => set((state) => ({
    simulation: { ...state.simulation, active: !state.simulation.active }
  })),

  updateTime: () => set({ currentTime: new Date() }),

  setSystemStatus: (status) => set({ systemStatus: status }),

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },

  fetchMaintenanceTasks: async (userId?) => {
    try {
      const query = userId ? `?userId=${userId}` : '';
      const res = await fetch(`https://smartnode-shm-backend.onrender.com/api/maintenance${query}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ maintenanceTasks: data });
      } else {
        console.error("fetchMaintenanceTasks: Expected array but got:", data);
        set({ maintenanceTasks: [] });
      }
    } catch (err) {
      console.error(err);
      set({ maintenanceTasks: [] });
    }
  },

  fetchInventoryReports: async () => {
    try {
       const res = await fetch('https://smartnode-shm-backend.onrender.com/api/inventory');
       const data = await res.json();
       if (Array.isArray(data)) {
         set({ inventoryReports: data });
       } else {
         console.error("fetchInventoryReports: Expected array but got:", data);
         set({ inventoryReports: [] });
       }
    } catch (err) {
       console.error(err);
       set({ inventoryReports: [] });
    }
  },

  addMaintenanceTask: async (task) => {
     try {
        const res = await fetch('https://smartnode-shm-backend.onrender.com/api/maintenance', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(task)
        });
         const newTask = await res.json();
         set((state) => {
             if (state.maintenanceTasks.some(t => t.id === newTask.id)) return state;
             return { maintenanceTasks: [newTask, ...state.maintenanceTasks] };
         });
     } catch (err) {
        console.error(err);
     }
  },
  
  updateMaintenanceTaskStatus: async (id, status) => {
     try {
        await fetch(`https://smartnode-shm-backend.onrender.com/api/maintenance/${id}`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status })
        });
        set((state) => ({
           maintenanceTasks: state.maintenanceTasks.map(t => t.id === id ? { ...t, status } : t)
        }));
     } catch (err) {
        console.error(err);
     }
  },

  addInventoryReport: async (report) => {
     try {
        const res = await fetch('https://smartnode-shm-backend.onrender.com/api/inventory', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(report)
        });
        const newReport = await res.json();
        set((state) => ({ inventoryReports: [newReport, ...state.inventoryReports] }));
     } catch (err) {
        console.error(err);
     }
  },

  connectToServer: () => {
    const { socket } = get();
    if (socket) return; // Already connected

    const ws = new WebSocket('wss://smartnode-shm-backend.onrender.com');

    ws.onopen = () => {
      console.log('Connected to Server');
      set({ isConnected: true, socket: ws });
    };

    ws.onclose = () => {
      console.log('Disconnected from Server');
      set({ isConnected: false, socket: null });
      // Optional: Retry logic could go here
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'SENSOR_UPDATE') {
          const { id, value, health } = message.data;
          
          set((state) => ({
            structures: state.structures.map((s) => ({
              ...s,
              sensors: s.sensors.map((sensor) => {
                 if (sensor.id === id) {
                    // Update sensor value and trend
                    const newTrend = [...sensor.trend.slice(1), value];
                    return { ...sensor, value, trend: newTrend, health: health || sensor.health };
                 }
                 return sensor;
              })
            }))
          }));
        } else if (message.type === 'GPS_UPDATE') {
             const structureId = message.topic.split('/').pop();
             const { lat, lng } = message.data;
             
             if (structureId && lat && lng) {
                 set((state) => ({
                    structures: state.structures.map(s => 
                        s.id === structureId ? { ...s, gps: { lat, lng } } : s
                    )
                 }));
             }
        } else if (message.type === 'CRITICAL_ALERT') {
             // Handle global alert (e.g. Toast)
             console.warn("CRITICAL ALERT RECEIVED", message.data);
        } else if (message.type === 'TASK_UPDATE') {
             const updatedTask = message.task;
             // Update local state to reflect change immediately across all clients
             set(state => {
                const exists = state.maintenanceTasks.some(t => t.id === updatedTask.id);
                const newTasks = exists 
                    ? state.maintenanceTasks.map(t => t.id === updatedTask.id ? updatedTask : t) 
                    : [updatedTask, ...state.maintenanceTasks];
                return { maintenanceTasks: newTasks };
             });

             // Admin Notification Logic
             const currentUser = get().user;
             if (currentUser?.role === 'admin' && updatedTask.status === 'Pending Review') {
                  toast.info("New Review Request", { 
                      description: `${updatedTask.item} awaiting approval.`,
                      duration: 4000
                  });
             }
        }

      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };
  },

  repairAll: () => set((state) => {
    // Return a new structures array where all sensors are 'stable'
    const newStructures = state.structures.map(s => ({
      ...s,
      health: 'stable' as const,
      sensors: s.sensors.map(sensor => ({
        ...sensor,
        health: 'stable' as const,
        value: sensor.type === 'vibration' ? 20 + Math.random() * 5 : sensor.value // Reset to safe range
      }))
    }));
    return { structures: newStructures, systemStatus: 'nominal' }; // Also reset system status
  }),

  getSelectedStructure: () => {
    const state = get();
    return state.structures.find(s => s.id === state.selectedStructureId) || null;
  },

  getSelectedSensor: () => {
    const state = get();
    const structure = state.structures.find(s => s.id === state.selectedStructureId);
    if (!structure) return null;
    return structure.sensors.find(s => s.id === state.selectedSensorId) || null;
  }
}));
