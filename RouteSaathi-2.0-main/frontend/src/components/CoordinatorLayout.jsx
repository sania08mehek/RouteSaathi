import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { LayoutDashboard, MapPin, Brain, MessageSquare, LogOut, Bus, BarChart3, Menu, X } from 'lucide-react';

function CoordinatorLayout({ children, title, subtitle }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/coordinator', icon: LayoutDashboard, label: t('dashboard'), end: true },
    { path: '/coordinator/routes', icon: MapPin, label: t('live_tracking') },
    { path: '/coordinator/ai', icon: Brain, label: t('ai_recommendations') },
    { path: '/coordinator/analytics', icon: BarChart3, label: t('analytics') },
    { path: '/coordinator/communication', icon: MessageSquare, label: t('broadcast') },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="app-header">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="logo">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1>RouteSaathi</h1>
              <p className="hidden sm:block">BMTC Fleet Management</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <LanguageSwitcher />
          <div className="text-right hidden md:block">
            <p className="font-semibold text-sm">{user?.name || t('coordinator')}</p>
            <p className="text-xs text-blue-200">Control Center</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 text-white p-2 sm:px-4 sm:py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Sidebar (Desktop & Mobile) */}
        <aside className={`sidebar overflow-y-auto transition-all duration-300 z-50 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 fixed md:relative h-[calc(100vh-80px)] md:h-auto w-64 md:block`}
        >
          <nav className="py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-auto p-6 text-xs text-white/50">
            <p>© 2025 BMTC</p>
            <p>RouteSaathi v2.0</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#F3F4F6]">
          <div className="page-content">
            {title && (
              <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
                  {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 font-medium">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
            )}
            <div className="animate-fadeIn">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CoordinatorLayout;
