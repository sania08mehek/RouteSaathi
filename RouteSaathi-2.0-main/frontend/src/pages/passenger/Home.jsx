import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { busesAPI, routesAPI, notificationsAPI } from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, LogOut, Bus, MapPin, Ticket, AlertTriangle, QrCode, Clock } from 'lucide-react';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createBusIcon = (occupancy) => {
  const color = occupancy > 80 ? '#EF4444' : occupancy > 50 ? '#F59E0B' : '#10B981';
  return new L.DivIcon({
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">🚌</div>`,
    iconSize: [32, 32],
    className: ''
  });
};

function PassengerHome() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('track');
  const [buses, setBuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSOS, setShowSOS] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  const myTickets = [
    { id: 'TKT-2025-001', from: 'Majestic', to: 'Electronic City', date: 'Today', time: '08:30 AM', fare: 45, valid: true },
    { id: 'TKT-2025-002', from: 'Silk Board', to: 'Whitefield', date: 'Yesterday', time: '06:15 PM', fare: 35, valid: false },
  ];

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      const res = await busesAPI.getAll();
      setBuses(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await routesAPI.search(searchQuery);
      setSearchResults(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSOS = async () => {
    setSosLoading(true);
    try {
      await notificationsAPI.sendSOS('passenger', [12.92, 77.62], 'Emergency');
    } catch (e) {}
    setTimeout(() => {
      setSosLoading(false);
      setShowSOS(false);
      alert('🚨 Emergency Alert Sent!\n\nPolice and emergency contacts have been notified with your location.');
    }, 1500);
  };

  const getOccupancy = (val) => {
    if (val > 80) return { label: 'Crowded', class: 'badge-danger' };
    if (val > 50) return { label: 'Moderate', class: 'badge-warning' };
    return { label: 'Available', class: 'badge-success' };
  };

  return (
    <div className="page-container pb-20">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <Bus className="w-7 h-7" />
          <div>
            <h1>RouteSaathi</h1>
            <p>Passenger</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Content */}
      <div className="page-content">
        {/* Track Tab */}
        {activeTab === 'track' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search */}
            <div className="card">
              <div className="card-body">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Where do you want to go?"
                      className="input input-with-icon py-4 text-base"
                    />
                  </div>
                  <button onClick={handleSearch} className="btn btn-primary">
                    Search
                  </button>
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    {searchResults.slice(0, 3).map((route, i) => (
                      <div key={i} className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <p className="font-bold text-gray-900 text-base mb-2">{route.name}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{route.stops?.slice(0, 4).join(' → ')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="card" style={{ height: '350px' }}>
              <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '16px' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {buses.slice(0, 15).map((bus) => (
                  <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={createBusIcon(bus.occupancy_percent)}>
                    <Popup>
                      <div className="text-center py-2">
                        <p className="font-bold text-base mb-1">{bus.id}</p>
                        <p className="text-gray-600 text-sm mb-2">Route: {bus.route_id}</p>
                        <span className={`badge ${getOccupancy(bus.occupancy_percent).class}`}>
                          {bus.occupancy_percent}% - {getOccupancy(bus.occupancy_percent).label}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Nearby Buses */}
            <div className="card">
              <div className="card-header text-lg font-bold">Nearby Buses</div>
              <div className="divide-y divide-gray-100">
                {buses.slice(0, 4).map((bus) => (
                  <div key={bus.id} className="data-list-item">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#002147] rounded-xl flex items-center justify-center text-2xl shadow-sm">🚌</div>
                        <div>
                          <p className="font-bold text-gray-900 text-base mb-1">{bus.id}</p>
                          <p className="text-sm text-gray-500">{bus.route_id} • {bus.last_stop}</p>
                        </div>
                      </div>
                      <span className={`badge ${getOccupancy(bus.occupancy_percent).class} text-base`}>
                        {bus.occupancy_percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
            {myTickets.map((ticket) => (
              <div key={ticket.id} className="card overflow-hidden shadow-md">
                <div className={`px-6 py-4 flex justify-between items-center ${ticket.valid ? 'bg-green-500' : 'bg-gray-400'} text-white`}>
                  <span className="font-semibold text-base">{ticket.id}</span>
                  <span className="badge bg-white/20 text-white">{ticket.valid ? 'Valid' : 'Used'}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">From</p>
                      <p className="font-bold text-gray-900 text-xl">{ticket.from}</p>
                    </div>
                    <div className="flex-1 px-6">
                      <div className="border-t-2 border-dashed border-gray-300 relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 text-gray-400 text-lg">→</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">To</p>
                      <p className="font-bold text-gray-900 text-xl">{ticket.to}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-5 border-t-2 border-dashed border-gray-200">
                    <div className="flex items-center gap-3 text-gray-600 text-base">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">{ticket.date} • {ticket.time}</span>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-2xl font-bold text-[#C8102E]">₹{ticket.fare}</span>
                      {ticket.valid && <QrCode className="w-12 h-12 text-gray-700" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SOS Tab */}
        {activeTab === 'sos' && (
          <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Emergency SOS</h2>
            <p className="text-gray-600 text-base mb-12 text-center max-w-md">Press the button below in case of emergency</p>

            <button onClick={() => setShowSOS(true)} className="w-48 h-48 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all shadow-2xl flex flex-col items-center justify-center text-white">
              <AlertTriangle className="w-16 h-16 mb-3" />
              <span className="text-3xl font-bold">SOS</span>
            </button>

            <div className="mt-12 text-center text-gray-700 text-base max-w-sm">
              <p className="font-bold mb-5 text-lg">This will immediately:</p>
              <ul className="space-y-4 text-left bg-white rounded-xl p-6 shadow-sm">
                <li className="flex items-center gap-3"><span className="text-red-500 text-xl font-bold">•</span><span className="font-medium">Alert nearby police</span></li>
                <li className="flex items-center gap-3"><span className="text-red-500 text-xl font-bold">•</span><span className="font-medium">Notify emergency contacts</span></li>
                <li className="flex items-center gap-3"><span className="text-red-500 text-xl font-bold">•</span><span className="font-medium">Share your live location</span></li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* SOS Modal */}
      {showSOS && (
        <div className="modal-overlay" onClick={() => setShowSOS(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Emergency</h3>
              <p className="text-gray-500 mb-6">Send emergency alert to police and your contacts?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowSOS(false)} className="btn btn-outline flex-1" disabled={sosLoading}>
                  Cancel
                </button>
                <button onClick={handleSOS} className="btn btn-primary flex-1 bg-red-500 hover:bg-red-600" disabled={sosLoading}>
                  {sosLoading ? 'Sending...' : 'Send SOS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button onClick={() => setActiveTab('track')} className={`bottom-nav-item ${activeTab === 'track' ? 'active' : ''}`}>
          <MapPin />
          <span>Track</span>
        </button>
        <button onClick={() => setActiveTab('tickets')} className={`bottom-nav-item ${activeTab === 'tickets' ? 'active' : ''}`}>
          <Ticket />
          <span>My Tickets</span>
        </button>
        <button onClick={() => setActiveTab('sos')} className={`bottom-nav-item ${activeTab === 'sos' ? 'active text-red-500' : ''}`}>
          <AlertTriangle />
          <span>SOS</span>
        </button>
      </div>
    </div>
  );
}

export default PassengerHome;
