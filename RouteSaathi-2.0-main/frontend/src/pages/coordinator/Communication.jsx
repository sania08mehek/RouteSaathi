import { useState, useEffect } from 'react';
import CoordinatorLayout from '../../components/CoordinatorLayout';
import { conductorsAPI, notificationsAPI } from '../../services/api';
import { Search, Send, Circle } from 'lucide-react';

function Communication() {
  const [conductors, setConductors] = useState([]);
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConductors();
  }, []);

  const loadConductors = async () => {
    try {
      const response = await conductorsAPI.getAll();
      setConductors(response.data || []);
      if (response.data?.length > 0) {
        setSelectedConductor(response.data[0]);
        loadMessages(response.data[0]);
      }
    } catch (err) {
      console.error('Failed to load conductors:', err);
      // Fallback data matching UI
      const fallbackConductors = [
        { id: 'U002', name: 'Ganesh Rao', bus_id: 'KA-01-F-8934', route_id: '500D', status: 'online', unread: true },
        { id: 'U003', name: 'Prakash M', bus_id: 'KA-01-F-3421', route_id: 'G-10', status: 'online', unread: false },
        { id: 'U004', name: 'Anil S', bus_id: 'KA-01-F-5678', route_id: '201', status: 'online', unread: false },
        { id: 'U005', name: 'Venkatesh', bus_id: 'KA-01-F-7890', route_id: '365C', status: 'online', unread: false },
        { id: 'U006', name: 'Ramesh K', bus_id: 'KA-01-F-2345', route_id: '401K', status: 'offline', unread: false },
      ];
      setConductors(fallbackConductors);
      setSelectedConductor(fallbackConductors[0]);
      loadMessages(fallbackConductors[0]);
    }
  };

  const loadMessages = (conductor) => {
    // Simulated messages matching UI
    setMessages([
      { id: 1, type: 'received', text: 'Heavy traffic at Silk Board. Delay expected.', time: '15 mins ago' },
      { id: 2, type: 'sent', text: 'Acknowledged. Take alternate route.', time: '10 mins ago' },
      { id: 3, type: 'sent', text: 'change route as per schedule', time: 'Just now' },
    ]);
  };

  const handleSelectConductor = (conductor) => {
    setSelectedConductor(conductor);
    loadMessages(conductor);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add message to list
    setMessages([...messages, {
      id: Date.now(),
      type: 'sent',
      text: newMessage,
      time: 'Just now'
    }]);

    // Clear input
    setNewMessage('');

    // Send broadcast
    try {
      await notificationsAPI.broadcast(newMessage, 'MEDIUM', 'BROADCAST');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const filteredConductors = conductors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.bus_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' ||
                         (activeFilter === 'online' && c.status === 'online') ||
                         (activeFilter === 'unread' && c.unread);
    return matchesSearch && matchesFilter;
  });

  return (
    <CoordinatorLayout 
      title="Coordinator-Conductor Communication"
      subtitle="Real-time messaging with bus conductors"
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Conductors List */}
        <div className="col-span-3 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Active Conductors</h3>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bus or conductor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b text-sm">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 px-5 py-3 font-semibold transition ${activeFilter === 'all' ? 'text-[#C8102E] border-b-3 border-[#C8102E]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All ({conductors.length})
            </button>
            <button
              onClick={() => setActiveFilter('online')}
              className={`flex-1 px-5 py-3 font-semibold transition ${activeFilter === 'online' ? 'text-[#C8102E] border-b-3 border-[#C8102E]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Online ({conductors.filter(c => c.status === 'online').length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`flex-1 px-5 py-3 font-semibold transition ${activeFilter === 'unread' ? 'text-[#C8102E] border-b-3 border-[#C8102E]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Unread ({conductors.filter(c => c.unread).length})
            </button>
          </div>

          {/* Conductor List */}
          <div className="max-h-[500px] overflow-y-auto">
            {filteredConductors.map((conductor) => (
              <div
                key={conductor.id}
                onClick={() => handleSelectConductor(conductor)}
                className={`data-list-item cursor-pointer ${
                  selectedConductor?.id === conductor.id ? 'bg-blue-50 border-l-4 border-l-[#C8102E]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Circle className={`w-4 h-4 mt-1 ${conductor.status === 'online' ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-base mb-1">
                      {conductor.name}
                      <span className={`ml-2 text-sm ${conductor.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>●</span>
                    </p>
                    <p className="text-sm text-gray-500">Bus: {conductor.bus_id} | Route: {conductor.route_id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-6 bg-white rounded-xl shadow-sm flex flex-col min-h-[600px]">
          {/* Chat Header */}
          {selectedConductor && (
            <div className="p-6 border-b bg-[#002147] text-white rounded-t-xl">
              <h3 className="font-bold text-lg">{selectedConductor.name}</h3>
              <p className="text-sm text-blue-200 mt-1">{selectedConductor.bus_id} | Route {selectedConductor.route_id}</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-6 space-y-5 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                <div className={msg.type === 'sent' ? 'chat-message-sent' : 'chat-message-received'}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={`text-xs mt-2 ${msg.type === 'sent' ? 'text-red-200' : 'text-gray-500'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-6 border-t flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 text-base"
            />
            <button
              onClick={handleSendMessage}
              className="bg-[#C8102E] text-white px-6 py-3 rounded-xl hover:bg-[#a00d24] transition flex items-center justify-center min-w-[60px]"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conductor Info */}
        <div className="col-span-3 bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-6 text-lg">Conductor Information</h3>
          {selectedConductor && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">Conductor Name</p>
                <p className="font-semibold text-gray-800 text-base">{selectedConductor.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">Bus Number</p>
                <p className="font-semibold text-[#C8102E] text-base">{selectedConductor.bus_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">Route</p>
                <p className="font-semibold text-[#002147] text-base">{selectedConductor.route_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">Status</p>
                <p className="font-semibold flex items-center gap-3 text-base">
                  <span className={`w-3 h-3 rounded-full ${selectedConductor.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {selectedConductor.status === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">Last Active</p>
                <p className="font-semibold text-gray-800 text-base">Now</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </CoordinatorLayout>
  );
}

export default Communication;
