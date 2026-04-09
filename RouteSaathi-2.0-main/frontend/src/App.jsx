import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import CoordinatorDashboard from './pages/coordinator/Dashboard';
import CoordinatorRoutes from './pages/coordinator/TrackRoutes';
import CoordinatorAI from './pages/coordinator/AIRecommendations';
import CoordinatorAnalytics from './pages/coordinator/Analytics';
import CoordinatorCommunication from './pages/coordinator/Communication';
import ConductorDashboard from './pages/conductor/Dashboard';
import ConductorTicketing from './pages/conductor/Ticketing';
import PassengerHome from './pages/passenger/Home';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'coordinator') return <Navigate to="/coordinator" replace />;
    if (user.role === 'conductor') return <Navigate to="/conductor" replace />;
    if (user.role === 'commuter') return <Navigate to="/passenger" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

// App Content with Routes
function AppContent() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? (
          user.role === 'coordinator' ? <Navigate to="/coordinator" replace /> :
          user.role === 'conductor' ? <Navigate to="/conductor" replace /> :
          <Navigate to="/passenger" replace />
        ) : <Login />
      } />

      {/* Coordinator Routes */}
      <Route path="/coordinator" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <CoordinatorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/coordinator/routes" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <CoordinatorRoutes />
        </ProtectedRoute>
      } />
      <Route path="/coordinator/ai" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <CoordinatorAI />
        </ProtectedRoute>
      } />
      <Route path="/coordinator/analytics" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <CoordinatorAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/coordinator/communication" element={
        <ProtectedRoute allowedRoles={['coordinator']}>
          <CoordinatorCommunication />
        </ProtectedRoute>
      } />

      {/* Conductor Routes */}
      <Route path="/conductor" element={
        <ProtectedRoute allowedRoles={['conductor']}>
          <ConductorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/conductor/ticketing" element={
        <ProtectedRoute allowedRoles={['conductor']}>
          <ConductorTicketing />
        </ProtectedRoute>
      } />

      {/* Passenger Routes */}
      <Route path="/passenger" element={
        <ProtectedRoute allowedRoles={['commuter']}>
          <PassengerHome />
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
