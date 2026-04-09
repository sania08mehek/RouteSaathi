import { useState, useEffect } from 'react';
import CoordinatorLayout from '../../components/CoordinatorLayout';
import { busesAPI, routesAPI } from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RefreshCw, Search } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icons
const createBusIcon = (color) => new L.DivIcon({
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
    <span style="font-size: 12px;">🚌</span>
  </div>`,
  iconSize: [24, 24],
  className: 'custom-bus-icon'
});

function TrackRoutes() {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      const response = await busesAPI.getAll();
      setBuses(response.data || []);
    } catch (err) {
      console.error('Failed to load buses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'MOVING': return '#10B981';
      case 'IDLE': return '#6B7280';
      case 'STUCK': return '#EF4444';
      case 'BREAKDOWN': return '#000000';
      default: return '#F59E0B';
    }
  };

  const filteredBuses = buses.filter(bus => 
    bus.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.route_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.last_stop?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Bangalore center coordinates
  const center = [12.9716, 77.5946];

  return (
    <CoordinatorLayout 
      title="Track Bus Routes"
      subtitle="Live fleet tracking with real-time bus positions"
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Bus List Sidebar */}
        <div className="col-span-3 bg-white rounded-xl shadow-sm overflow-hidden max-h-[75vh]">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Active Buses</h3>
              <button onClick={loadBuses} className="text-gray-500 hover:text-gray-700 transition p-2 hover:bg-gray-100 rounded-lg">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bus or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {filteredBuses.map((bus) => (
              <div
                key={bus.id}
                onClick={() => setSelectedBus(bus)}
                className={`data-list-item cursor-pointer ${
                  selectedBus?.id === bus.id ? 'bg-blue-50 border-l-4 border-l-[#C8102E]' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-base">{bus.id}</p>
                    <p className="text-sm text-gray-500 mt-1">Route: {bus.route_id}</p>
                  </div>
                  <span
                    className="px-4 py-2 rounded-full text-xs font-bold text-white whitespace-nowrap"
                    style={{ backgroundColor: getStatusColor(bus.status) }}
                  >
                    {bus.status}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">📍 {bus.last_stop}</span>
                  <span className="flex items-center gap-1.5">🚗 {bus.speed}</span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${bus.occupancy_percent}%`,
                        backgroundColor: bus.occupancy_percent > 80 ? '#EF4444' : bus.occupancy_percent > 50 ? '#F59E0B' : '#10B981'
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 text-right mt-2 font-medium">{bus.occupancy_percent}% Full</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="col-span-9">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: '70vh' }}>
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {buses.map((bus) => (
                <Marker
                  key={bus.id}
                  position={[bus.lat, bus.lng]}
                  icon={createBusIcon(getStatusColor(bus.status))}
                  eventHandlers={{
                    click: () => setSelectedBus(bus)
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-48">
                      <h4 className="font-bold text-lg">{bus.id}</h4>
                      <p className="text-sm text-gray-600">Route: {bus.route_id}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Status:</strong> <span style={{ color: getStatusColor(bus.status) }}>{bus.status}</span></p>
                        <p><strong>Speed:</strong> {bus.speed}</p>
                        <p><strong>Occupancy:</strong> {bus.occupancy_percent}%</p>
                        <p><strong>Last Stop:</strong> {bus.last_stop}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Selected Bus Details */}
          {selectedBus && (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-xl mb-5">Vehicle Details: {selectedBus.id}</h3>
              <div className="grid grid-cols-5 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2 font-medium">Route</p>
                  <p className="font-bold text-base">{selectedBus.route_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2 font-medium">Status</p>
                  <p className="font-bold text-base" style={{ color: getStatusColor(selectedBus.status) }}>{selectedBus.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2 font-medium">Speed</p>
                  <p className="font-bold text-base">{selectedBus.speed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2 font-medium">Occupancy</p>
                  <p className="font-bold text-base">{selectedBus.occupancy_percent}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2 font-medium">Last Stop</p>
                  <p className="font-bold text-base">{selectedBus.last_stop}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CoordinatorLayout>
  );
}

export default TrackRoutes;
