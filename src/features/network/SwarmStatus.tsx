import { useState, useMemo } from 'react';
import { Cpu, Signal, Battery, Network, Radio, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SearchBar } from '@/shared/components/ui/SearchBar';

export const SwarmStatus = () => {
  const { structures, selectedStructureId, selectStructure } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  // Derive unique locations
  const locations = useMemo(() => {
    const locs = new Set(structures.map(s => s.location).filter(Boolean));
    return ['All', ...Array.from(locs)];
  }, [structures]);

  const suggestions = useMemo(() => structures.map(s => ({
    id: s.id,
    label: s.name,
    subLabel: s.id,
    type: s.health
  })), [structures]);

  // Filter structures
  const filteredStructures = useMemo(() => {
    return structures.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = selectedLocation === 'All' || s.location === selectedLocation;
      return matchesSearch && matchesLocation;
    });
  }, [structures, searchQuery, selectedLocation]);

  // Helper for mock data that needs to differ per node but remain consistent-ish
  const getMockConnection = (health: string) => {
    return health === 'critical' || health === 'warning' ? 'Weak Signal' : '5G/LTE';
  };

  const getMockBattery = (index: number) => {
    // Deterministic mock based on index
    const levels = [98, 85, 42, 91, 12, 76, 100, 65, 88];
    return levels[index % levels.length] + '%';
  };

  const getMockPing = (health: string) => {
    return health === 'critical' ? '2 days ago' : '< 10ms ago';
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Cpu className="w-6 h-6 text-amber-500" />
             Swarm Health Status
           </h2>
           <p className="text-slate-500">Diagnostics for IoT sensor mesh network.</p>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="flex gap-4">
          <div className="relative flex-1">
             <SearchBar 
                 placeholder="Search nodes by ID or name..."
                 onSearch={setSearchQuery} 
                 suggestions={suggestions}
                 onSuggestionSelect={(s) => setSearchQuery(s.label)}
             />
          </div>
          {/* Location Select */}
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Node / Structure</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Connection</th>
              <th className="px-6 py-4">Battery</th>
              <th className="px-6 py-4">Last Ping</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStructures.length > 0 ? (
              filteredStructures.map((structure, index) => (
                <tr 
                    key={structure.id} 
                    onClick={() => selectStructure(structure.id)}
                    className={`cursor-pointer transition-colors group ${selectedStructureId === structure.id ? 'bg-violet-50 hover:bg-violet-100 border-l-4 border-violet-500' : 'hover:bg-slate-50/50'}`}
                >
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-slate-500">{structure.id}</div>
                    <div className="font-medium text-slate-900">{structure.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      structure.health === 'critical' ? 'bg-rose-100 text-rose-700' : 
                      structure.health === 'warning' ? 'bg-amber-100 text-amber-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {structure.health}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                     {structure.location}
                  </td>
                  <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                     <Signal className={`w-4 h-4 ${structure.health === 'critical' ? 'text-slate-300' : 'text-emerald-500'}`} />
                     {getMockConnection(structure.health)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Battery className={`w-4 h-4 text-slate-400`} />
                      <span className="font-mono">{getMockBattery(index)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                    {getMockPing(structure.health)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No nodes found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center flex justify-between items-center px-6">
          <span className="text-xs text-slate-500">Showing {filteredStructures.length} nodes</span>
          <button className="text-xs font-bold text-primary hover:underline">View All Network Logs</button>
        </div>
      </div>
      

    </div>
  );
};
