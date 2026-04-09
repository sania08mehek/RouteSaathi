import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CoordinatorLayout from '../../components/CoordinatorLayout';
import { busesAPI, routesAPI, notificationsAPI, aiAPI } from '../../services/api';
import { Bus, MessageCircle, Lightbulb, ChevronRight, TrendingUp, TrendingDown, AlertCircle, Zap } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeBuses: 35,
    highDemand: 12,
    lowDemand: 7,
    aiSuggestions: 9,
  });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [busStats, routeStats, aiStats, recentAlerts] = await Promise.all([
        busesAPI.getStats(),
        routesAPI.getStats(),
        aiAPI.getMLSuggestionsCount(),
        notificationsAPI.getRecent(4),
      ]);
      setStats({
        activeBuses: busStats.data.total_active_buses || 35,
        highDemand: routeStats.data.routes_with_high_demand || 12,
        lowDemand: routeStats.data.routes_with_low_demand || 7,
        aiSuggestions: aiStats.data.ml_suggested_reallocations || 9,
      });
      setAlerts(recentAlerts.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const statsData = [
    { icon: Bus, value: stats.activeBuses, label: 'Active Buses', color: 'bg-[#002147]', iconColor: 'text-[#002147]', bgLight: 'bg-blue-50' },
    { icon: TrendingUp, value: stats.highDemand, label: 'High Demand', color: 'bg-[#C8102E]', iconColor: 'text-[#C8102E]', bgLight: 'bg-red-50' },
    { icon: TrendingDown, value: stats.lowDemand, label: 'Low Demand', color: 'bg-[#003366]', iconColor: 'text-[#003366]', bgLight: 'bg-blue-50' },
    { icon: Zap, value: stats.aiSuggestions, label: 'AI Actions', color: 'bg-[#a00d24]', iconColor: 'text-[#a00d24]', bgLight: 'bg-red-50' },
  ];

  const defaultAlerts = [
    { message: 'Bus KA-01-F-4532 stuck at Silk Board junction', time: '2 min ago' },
    { message: 'Route R-276 at 90% capacity - dispatch recommended', time: '15 min ago' },
    { message: 'Waterlogging near Hebbal flyover', time: '30 min ago' },
  ];

  return (
    <CoordinatorLayout title="Control Center">
      {/* Stats Grid - Increased Gap */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, idx) => (
          <div key={idx} className="stat-card hover:shadow-lg transition-shadow duration-300">
            <div className={`stat-icon ${stat.bgLight} ${stat.iconColor} rounded-2xl p-4`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="stat-value text-4xl mb-1">{stat.value}</p>
              <p className="stat-label text-base font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts - More Breathing Room */}
        <div className="lg:col-span-2 card h-full">
          <div className="card-header flex items-center justify-between py-6 px-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-[#C8102E]" />
              </div>
              <span className="text-xl">Recent Alerts</span>
            </div>
            <button className="text-[#C8102E] font-semibold flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
              View All <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="card-body p-8 space-y-4">
            {(alerts.length > 0 ? alerts : defaultAlerts).map((alert, idx) => (
              <div key={idx} className="alert-item p-5 border-l-4 border-[#C8102E] bg-red-50/50 rounded-r-xl hover:bg-red-50 transition-colors">
                <p className="text-lg text-gray-800 font-medium">{alert.message}</p>
                <p className="time text-sm text-gray-500 mt-2 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  {alert.time || new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Standardized Buttons */}
        <div className="card h-full">
          <div className="card-header py-6 px-8 text-xl">Quick Actions</div>
          <div className="card-body p-8 flex flex-col gap-4">
            <button 
              onClick={() => navigate('/coordinator/routes')} 
              className="group flex items-center gap-4 p-5 rounded-xl border-2 border-[#002147]/10 hover:border-[#002147] hover:bg-[#002147] hover:text-white transition-all duration-300 text-left"
            >
              <div className="p-3 bg-blue-50 text-[#002147] rounded-lg group-hover:bg-white/10 group-hover:text-white transition-colors">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <span className="block font-bold text-lg">Track Live Buses</span>
                <span className="text-sm text-gray-500 group-hover:text-white/80">View real-time fleet map</span>
              </div>
            </button>

            <button 
              onClick={() => navigate('/coordinator/ai')} 
              className="group flex items-center gap-4 p-5 rounded-xl border-2 border-[#C8102E]/10 hover:border-[#C8102E] hover:bg-[#C8102E] hover:text-white transition-all duration-300 text-left"
            >
              <div className="p-3 bg-red-50 text-[#C8102E] rounded-lg group-hover:bg-white/10 group-hover:text-white transition-colors">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <span className="block font-bold text-lg">AI Recommendations</span>
                <span className="text-sm text-gray-500 group-hover:text-white/80">Optimize fleet allocation</span>
              </div>
            </button>

            <button 
              onClick={() => navigate('/coordinator/communication')} 
              className="group flex items-center gap-4 p-5 rounded-xl border-2 border-[#002147]/10 hover:border-[#002147] hover:bg-[#002147] hover:text-white transition-all duration-300 text-left"
            >
              <div className="p-3 bg-blue-50 text-[#002147] rounded-lg group-hover:bg-white/10 group-hover:text-white transition-colors">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="block font-bold text-lg">Message Conductors</span>
                <span className="text-sm text-gray-500 group-hover:text-white/80">Broadcast updates</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </CoordinatorLayout>
  );
}

export default Dashboard;
