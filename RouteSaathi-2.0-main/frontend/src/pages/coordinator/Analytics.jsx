import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { aiAPI } from '../../services/api';
import CoordinatorLayout from '../../components/CoordinatorLayout';
import { TrendingUp, Users, AlertCircle, IndianRupee } from 'lucide-react';

const COLORS = ['#002147', '#C8102E', '#003366', '#a00d24', '#10b981', '#f59e0b'];

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await aiAPI.getAnalytics();
      setData(res.data);
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CoordinatorLayout title="Analytics"><div className="p-8 text-center">Loading analytics...</div></CoordinatorLayout>;
  if (!data) return <CoordinatorLayout title="Analytics"><div className="p-8 text-center text-red-500">Failed to load data.</div></CoordinatorLayout>;

  return (
    <CoordinatorLayout title="Fleet Analytics" subtitle="Real-time performance metrics and demand patterns">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="stat-icon bg-blue-50 text-[#002147]">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="stat-value">{data.summary.total_tickets}</p>
            <p className="stat-label">Total Tickets</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red-50 text-[#C8102E]">
            <IndianRupee className="w-8 h-8" />
          </div>
          <div>
            <p className="stat-value">₹{Math.round(data.summary.total_revenue)}</p>
            <p className="stat-label">Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-50 text-[#003366]">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="stat-value">{data.summary.active_buses}</p>
            <p className="stat-label">Active Buses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red-50 text-[#a00d24]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="stat-value">{data.summary.total_alerts}</p>
            <p className="stat-label">Total Alerts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demand Over Time */}
        <div className="card">
          <div className="card-header">Hourly Passenger Demand</div>
          <div className="card-body h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.demand_over_time}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#C8102E" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#C8102E', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Per Route */}
        <div className="card">
          <div className="card-header">Revenue by Top Routes (₹)</div>
          <div className="card-body h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenue_per_route} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="route" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={120}
                  tick={{fontSize: 12, fill: '#333', fontWeight: 600}}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#002147" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Distribution */}
        <div className="card">
          <div className="card-header">Alert Type Distribution</div>
          <div className="card-body h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.alert_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.alert_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Summary */}
        <div className="card">
          <div className="card-header">Efficiency Insights</div>
          <div className="card-body">
            <div className="space-y-6">
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-[#002147] mb-2">Peak Performance</h4>
                <p className="text-sm text-gray-600">
                  Route <b>{data.revenue_per_route[0]?.route}</b> is currently generating the highest revenue per trip. Consider increasing frequency during peak hours.
                </p>
              </div>
              <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                <h4 className="font-bold text-[#C8102E] mb-2">Alert Hotspots</h4>
                <p className="text-sm text-gray-600">
                  <b>{data.alert_distribution.find(a => a.name === 'TRAFFIC')?.value || 0}</b> traffic alerts reported in the last hour. AI suggests rerouting for affected vehicles.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Fleet Utilization</h4>
                <p className="text-sm text-gray-600">
                  Current active fleet utilization is at <b>{Math.round((data.summary.active_buses / 20) * 100)}%</b>. 
                  {data.summary.active_buses < 15 ? " Capacity available for additional route assignments." : " Fleet is near maximum capacity."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CoordinatorLayout>
  );
}

export default Analytics;
