import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore, Structure } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

interface AddStructureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddStructureModal = ({ open, onOpenChange }: AddStructureModalProps) => {
  const { addStructure } = useAppStore();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'building' | 'bridge' | 'flyover'>('building');
  const [location, setLocation] = useState('');
  
  // Tile State
  const [tiles, setTiles] = useState<{name: string, sensors: string[]}[]>([]);
  const [newTileName, setNewTileName] = useState('');
  const [sensorCounts, setSensorCounts] = useState<{vibration: number, strain: number, temperature: number}>({
    vibration: 1,
    strain: 0,
    temperature: 0
  });

  const handleAddTile = () => {
    if (!newTileName) return;
    const sensorsList: string[] = [];
    
    // Add multiple instances based on count
    for (let i = 0; i < sensorCounts.vibration; i++) sensorsList.push('vibration');
    for (let i = 0; i < sensorCounts.strain; i++) sensorsList.push('strain');
    for (let i = 0; i < sensorCounts.temperature; i++) sensorsList.push('temperature');
    
    if (sensorsList.length === 0) {
        alert("Please add at least one sensor to the tile.");
        return;
    }

    setTiles([...tiles, { name: newTileName, sensors: sensorsList }]);
    setNewTileName('');
    // Reset to defaults
    setSensorCounts({ vibration: 1, strain: 0, temperature: 0 });
  };

  const removeTile = (index: number) => {
    setTiles(tiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !location) return;

    if (tiles.length === 0) {
        alert("Please add at least one Tile (Tail).");
        return;
    }

    const newStructure: Structure = {
      id: `struct-${Date.now()}`,
      name,
      type,
      health: 'stable',
      location,
      gatewayConnectivity: 90 + Math.floor(Math.random() * 10), // Random simulated signal strength
      position: { x: 500, y: 500 }, // Default center
      scale: 1,
      sensors: tiles.flatMap((tile, i) => {
         // Generate random position for this Tile
         const tileX = 20 + Math.random() * 60;
         const tileY = 20 + Math.random() * 60;
         
         return tile.sensors.map((sensorType, j) => ({
            id: `s-${Date.now()}-${i}-${j}`,
            name: `${tile.name} - ${sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} ${j + 1}`,
            type: sensorType as 'vibration' | 'strain' | 'temperature',
            value: sensorType === 'vibration' ? 10 + Math.random() * 5 : 20 + Math.random() * 10,
            health: 'stable' as const,
            x: tileX, // All sensors in tile share position
            y: tileY,
            trend: [10, 12, 11, 13, 12],
            block: tile.name // Grouping ID
         }));
      })
    };

    addStructure(newStructure);
    onOpenChange(false);
    
    // Reset form
    setName('');
    setType('building');
    setLocation('');
    setTiles([]);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden font-sans pointer-events-auto">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Add New Structure</h3>
              <button 
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Structure Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Central Tower"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'building' | 'bridge' | 'flyover')}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="building">Building</option>
                  <option value="bridge">Bridge</option>
                  <option value="flyover">Flyover</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Downtown"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                 <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700">Tails (Tiles) Configuration</label>
                 </div>
                 
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3 mb-3">
                    <div className="space-y-3">
                       <input 
                          placeholder="Tile Name (e.g. Tail 1)"
                          value={newTileName}
                          onChange={e => setNewTileName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm"
                       />
                       
                       <div className="flex flex-col gap-3">
                          <label className="flex items-center justify-between text-sm text-slate-600 bg-white px-3 py-2 rounded border border-slate-200">
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-sky-400" />
                                <span>Vibration Sensors</span>
                             </div>
                             <input 
                               type="number" 
                               min="0"
                               max="10"
                               value={sensorCounts.vibration} 
                               onChange={e => setSensorCounts({...sensorCounts, vibration: parseInt(e.target.value) || 0})} 
                               className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                             />
                          </label>
                          <label className="flex items-center justify-between text-sm text-slate-600 bg-white px-3 py-2 rounded border border-slate-200">
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-violet-400" />
                                <span>Strain Sensors</span>
                             </div>
                             <input 
                               type="number" 
                               min="0"
                               max="10"
                               value={sensorCounts.strain} 
                               onChange={e => setSensorCounts({...sensorCounts, strain: parseInt(e.target.value) || 0})} 
                               className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                             />
                          </label>
                          <label className="flex items-center justify-between text-sm text-slate-600 bg-white px-3 py-2 rounded border border-slate-200">
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span>Temperature Sensors</span>
                             </div>
                             <input 
                               type="number" 
                               min="0"
                               max="10"
                               value={sensorCounts.temperature} 
                               onChange={e => setSensorCounts({...sensorCounts, temperature: parseInt(e.target.value) || 0})} 
                               className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                             />
                          </label>
                       </div>
                    </div>
                    <button 
                       type="button"
                       onClick={handleAddTile}
                       className="w-full py-1.5 bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-600 text-slate-600 text-sm font-bold rounded shadow-sm transition-all"
                    >
                       + Add Tile
                    </button>
                 </div>

                 {tiles.length > 0 && (
                    <div className="space-y-2 mb-2">
                       {tiles.map((t, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 bg-white border border-slate-100 rounded text-sm">
                             <div className="flex flex-col">
                                <span className="font-medium text-slate-700">{t.name}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                                  {t.sensors.join(', ')}
                                </span>
                             </div>
                             <button type="button" onClick={() => removeTile(i)} className="text-slate-400 hover:text-rose-500">
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tiles.length === 0}
                  className="flex-1 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Structure
                </button>
              </div>
            </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
