import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Bus, Shield, UserCircle, ArrowRight } from 'lucide-react';
import logo from '../assets/RouteSaathi_logo.svg';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoUsers = [
    { email: 'admin@bmtc.gov.in', password: 'admin123', label: t('coordinator'), icon: Shield, desc: 'Fleet Management' },
    { email: 'ganesh@bmtc.gov.in', password: 'conductor123', label: t('conductor'), icon: Bus, desc: 'Bus Operations' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const performLogin = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(loginEmail, loginPassword);
      if (response.data.success) {
        login(response.data.user);
        const role = response.data.user.role;
        navigate(role === 'coordinator' ? '/coordinator' : role === 'conductor' ? '/conductor' : '/passenger');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePassengerAccess = async () => {
    await performLogin('user@gmail.com', 'user123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002147] via-[#003366] to-[#002147] flex items-center justify-center p-6 relative">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo and Branding - Increased Spacing */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-[2rem] shadow-2xl mb-8 p-1.5 overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img 
              src={logo} 
              alt="RouteSaathi Logo" 
              className="w-full h-full object-cover rounded-[1.5rem]" 
            />
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-3 drop-shadow-lg">RouteSaathi</h1>
          <p className="text-blue-200 text-xl font-medium tracking-wide">BMTC Fleet Management System</p>
        </div>

        {/* Login Card - Increased Padding */}
        <div className="bg-white rounded-[2rem] shadow-2xl p-14 border border-white/10 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{t('welcome')}</h2>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider text-xs">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input py-4 text-lg bg-gray-50 focus:bg-white transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider text-xs">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input py-4 text-lg bg-gray-50 focus:bg-white transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-medium text-center flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-5 text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all rounded-xl font-bold tracking-wide">
              {loading ? t('signing_in') : t('login')}
            </button>
          </form>

          {/* Passenger Access Button - More Breathing Room */}
          <div className="mt-8">
            <button 
              onClick={handlePassengerAccess}
              disabled={loading}
              className="w-full bg-blue-50 hover:bg-blue-100 text-[#002147] border-2 border-[#002147]/10 py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all group hover:shadow-md"
            >
              <UserCircle className="w-7 h-7" />
              {t('use_as_passenger')}
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Demo Logins - Cleaned Up */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{t('demo_credentials')}</p>
            <div className="space-y-4">
              {demoUsers.map((user, idx) => (
                <button
                  key={idx}
                  onClick={() => performLogin(user.email, user.password)}
                  disabled={loading}
                  className="w-full flex items-center gap-5 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition group border border-transparent hover:border-gray-200 hover:shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    idx === 0 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <user.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-gray-900 text-base">{user.label}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{user.desc}</p>
                  </div>
                  <span className="text-gray-300 group-hover:text-gray-600 text-sm font-medium transition-colors">Login →</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200/60 text-sm mt-10 font-medium tracking-wide">
          © 2025 Bengaluru Metropolitan Transport Corporation
        </p>
      </div>
    </div>
  );
}

export default Login;
