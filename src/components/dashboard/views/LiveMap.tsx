import { useState, useMemo, useEffect } from 'react';
import { Map, Layers } from 'lucide-react';
import { useStructureData } from '@/hooks/useStructureData';
import { AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { TacticalOverlay } from './TacticalOverlay';
import { Structure } from '@/store/useAppStore';

// Fix for default Leaflet marker icons in React
// @ts-expect-error -- Leaflet generic type definition mismatch
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored markers using DivIcon for performance and styling
const createCustomIcon = (color: string) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    background-color: ${color};
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 10px ${color};
    position: relative;
  ">
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
      background-color: ${color};
      opacity: 0.3;
      border-radius: 50%;
      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    "></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

// Component to recenter map when selectedId changes
const MapUpdater = ({ selectedId, structures }: { selectedId: string | null, structures: Structure[] }) => {
  const map = useMap();
  
  useMemo(() => {
    if (selectedId) {
      const s = structures.find(st => st.id === selectedId);
      if (s) {
         // Convert x/y to lat/lng or use GPS
         const lat = s.gps?.lat ?? (12.9716 + (s.position.y - 300) / 5000);
         const lng = s.gps?.lng ?? (77.5946 + (s.position.x - 500) / 5000);
         map.flyTo([lat, lng], 15);
      }
    }
  }, [selectedId, structures, map]);

  return null;
};

const defaultCenter: [number, number] = [12.9716, 77.5946]; // Bangalore "HQ" or Center

export const LiveMap = () => {
  const { structures } = useStructureData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  
  // Reset route when selection changes
  useEffect(() => {
    setShowRoute(false);
  }, [selectedId]);

  const selectedStructure = useMemo(() => 
    structures.find(s => s.id === selectedId) || null
  , [structures, selectedId]);

  const routePositions = useMemo(() => {
    if (!selectedStructure) return [];
    
    // Mock user/HQ location (slightly offset from default center to look like "travel")
    const hqLat = defaultCenter[0] - 0.01;
    const hqLng = defaultCenter[1] - 0.01;

    const targetLat = selectedStructure.gps?.lat ?? (defaultCenter[0] + (selectedStructure.position.y - 300) / 5000);
    const targetLng = selectedStructure.gps?.lng ?? (defaultCenter[1] + (selectedStructure.position.x - 500) / 5000);

    // Create a simple 3-point bent line to look less artificial than a straight line
    const midLat = (hqLat + targetLat) / 2 + 0.002;
    const midLng = (hqLng + targetLng) / 2 - 0.002;

    return [
      [hqLat, hqLng] as [number, number],
      [midLat, midLng] as [number, number],
      [targetLat, targetLng] as [number, number]
    ];
  }, [selectedStructure]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Map className="w-6 h-6 text-primary" />
             Geospatial Monitoring
           </h2>
           <p className="text-slate-500">Real-time satellite tracking of 142 active sensor nodes.</p>
        </div>
        <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-medium text-slate-600 hover:text-primary shadow-sm flex items-center gap-2">
               <Layers className="w-4 h-4" /> Satellite
             </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl h-[600px] w-full relative overflow-hidden border border-slate-700 shadow-2xl z-0">
          <MapContainer 
            center={defaultCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
             {/* Esri World Imagery (Satellite) */}
             <TileLayer
               attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
               url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
             />
             {/* Optional Label Layer to make it "Hybrid" */}
             <TileLayer
               url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}{r}.png"
               opacity={0.3}
             />

             <MapUpdater selectedId={selectedId} structures={structures} />

             {/* Show Route Line */}
             {showRoute && selectedStructure && (
               <>
                 <Polyline 
                   positions={routePositions} 
                   pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.8 }} 
                 />
                 {/* Start Point Marker (HQ) */}
                 <Marker 
                   position={routePositions[0]} 
                   icon={new L.DivIcon({
                     className: 'hq-marker',
                     html: '<div style="background:#3b82f6; width:12px; height:12px; border-radius:50%; border:2px solid white;"></div>',
                   })}
                 />
               </>
             )}

             {structures.map((s) => {
                 const lat = s.gps?.lat ?? (defaultCenter[0] + (s.position.y - 300) / 5000);
                 const lng = s.gps?.lng ?? (defaultCenter[1] + (s.position.x - 500) / 5000);
                const color = s.health === 'stable' ? '#10b981' : s.health === 'warning' ? '#f59e0b' : '#ef4444';
                
                return (
                  <Marker 
                    key={s.id} 
                    position={[lat, lng]}
                    icon={createCustomIcon(color)}
                    eventHandlers={{
                      click: () => setSelectedId(s.id),
                    }}
                  />
                );
             })}
          </MapContainer>
          
          {/* Tactical Overlay (Floating Sidebar) */}
          <AnimatePresence>
            {selectedId && (
              <TacticalOverlay 
                structure={selectedStructure} 
                onClose={() => setSelectedId(null)} 
                isRouteActive={showRoute}
                onToggleRoute={() => setShowRoute(!showRoute)}
              />
            )}
          </AnimatePresence>
          
          {/* Overlay Stats - Hide if overlay is open to reduce clutter? Or keep. Keeping for now. */}
          {!selectedId && (
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur text-white p-3 rounded-lg border border-slate-700 z-[1000] text-xs">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Stable: {structures.filter(s => s.health === 'stable').length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>Alerts: {structures.filter(s => s.health !== 'stable').length}</span>
                </div>
            </div>
          )}
      </div>
    </div>
  );
};
