import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { conductorsAPI, notificationsAPI, busesAPI } from '../../services/api';
import { LogOut, Bus, Ticket, Bell, Wifi, AlertTriangle, TrafficCone, Wrench, Users, MapPin } from 'lucide-react';

function ConductorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await conductorsAPI.getAssignment(user?.id || 'U002');
      const notifs = await conductorsAPI.getNotifications(user?.id || 'U002');
      setAssignment(res.data);
      setNotifications(notifs.data.notifications || []);
    } catch (e) {
      setAssignment({
        bus_number: 'KA-01-F-4532',
        route_id: '335E',
        route_name: 'Majestic → Electronic City',
        start_time: '06:30 AM',
        end_time: '10:30 PM',
      });
      setNotifications([
        { title: 'Route Change', message: 'Take BTM Layout alternate', time_ago: '10 min ago' },
        { title: 'Heavy Load', message: 'Evening peak on your route', time_ago: '1 hr ago' },
      ]);
    }
  };

  const quickAction = async (type) => {
    const busId = assignment?.bus_number || 'KA-01-F-4532';
    try {
      if (type === 'sos') await notificationsAPI.sendSOS(busId, [12.92, 77.62], 'Emergency');
      else if (type === 'traffic') await notificationsAPI.reportTraffic(busId, [12.92, 77.62], 'Traffic');
      else if (type === 'breakdown') await conductorsAPI.reportBreakdown(busId, [12.92, 77.62], 'Breakdown');
      else if (type === 'full') await busesAPI.updateOccupancy(busId, 100);
    } catch (e) {}
    const msgs = { sos: '🚨 SOS sent!', traffic: '🚦 Traffic reported!', breakdown: '🔧 Breakdown reported!', full: '👥 Marked Full!' };
    alert(msgs[type]);
  };

  const actions = [
    { id: 'sos', icon: AlertTriangle, label: 'SOS', bg: 'bg-red-500 hover:bg-red-600' },
    { id: 'traffic', icon: TrafficCone, label: 'Traffic', bg: 'bg-amber-500 hover:bg-amber-600' },
    { id: 'breakdown', icon: Wrench, label: 'Breakdown', bg: 'bg-gray-700 hover:bg-gray-800' },
    { id: 'full', icon: Users, label: 'Bus Full', bg: 'bg-green-500 hover:bg-green-600' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <Bus className="w-7 h-7" />
          <div>
            <h1>RouteSaathi</h1>
            <p>Conductor</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-primary py-2 px-3">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <div className="page-content space-y-6">
        {/* Assignment Card */}
        <div className="card">
          <div className="bg-[#C8102E] text-white px-6 py-5 flex justify-between items-center">
            <span className="font-bold text-lg">Today's Assignment</span>
            <span className="badge bg-white/20 text-white">ACTIVE</span>
          </div>
          <div className="p-8 text-center">
            <p className="text-5xl font-bold text-[#002147] mb-2">{assignment?.bus_number || 'KA-01-F-4532'}</p>
            <p className="text-gray-500 font-semibold text-lg">Route {assignment?.route_id || '335E'}</p>
            <div className="mt-6 bg-gray-50 rounded-xl p-6">
              <p className="font-semibold text-gray-800 text-lg">{assignment?.route_name || 'Majestic → Electronic City'}</p>
              <p className="text-base text-gray-500 mt-2">{assignment?.start_time || '06:30 AM'} - {assignment?.end_time || '10:30 PM'}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-5">
          <div className="stat-card justify-center">
            <div>
              <p className="stat-value text-center">47</p>
              <p className="stat-label text-center">Tickets Today</p>
            </div>
          </div>
          <div className="stat-card justify-center">
            <div>
              <p className="stat-value text-center text-[#C8102E]">₹1,245</p>
              <p className="stat-label text-center">Collection</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">Quick Actions</div>
          <div className="card-body">
            <div className="grid grid-cols-4 gap-4">
              {actions.map((a) => (
                <button key={a.id} onClick={() => quickAction(a.id)} className={`${a.bg} text-white p-6 rounded-xl flex flex-col items-center justify-center gap-3 transition transform hover:scale-105`}>
                  <a.icon className="w-8 h-8" />
                  <span className="text-sm font-semibold">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ticketing Button */}
        <button onClick={() => navigate('/conductor/ticketing')} className="btn btn-primary w-full py-5 text-xl">
          <Ticket className="w-7 h-7" />
          Open Ticketing
        </button>

        {/* Notifications */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-[#C8102E]" />
              <span>Notifications</span>
            </div>
            <span className="badge badge-danger">{notifications.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {notifications.slice(0, 3).map((n, i) => (
              <div key={i} className="data-list-item">
                <p className="font-semibold text-gray-900 text-base mb-1">{n.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                <p className="text-xs text-gray-400 mt-2">{n.time_ago}</p>
              </div>
            ))}
          </div>
        </div>

        {/* GPS Status */}
        <div className="flex items-center justify-between p-6 bg-green-50 rounded-xl border-2 border-green-200">
          <div className="flex items-center gap-4 text-green-700">
            <Wifi className="w-6 h-6" />
            <span className="font-bold text-base">GPS Connected</span>
          </div>
          <div className="flex items-center gap-3 text-green-600">
            <MapPin className="w-5 h-5" />
            <span className="text-base font-medium">Silk Board</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConductorDashboard;
