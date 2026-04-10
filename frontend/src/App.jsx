import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar      from './components/Navbar';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Home        from './pages/Home';
import Quiz        from './pages/Quiz';
import Result      from './pages/Result';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminScores    from './pages/admin/AdminScores';

// Redirect to login if not authenticated
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;

  return user ? children : <Navigate to="/login" replace />;
};

// Redirect non-admins away
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}

      <Routes>

        {/* Auth */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* Protected */}
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />

        {/* ✅ FIX: Result should NOT hard crash */}
        <Route path="/result" element={
          <PrivateRoute>
            <Result />
          </PrivateRoute>
        } />

        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/questions" element={<AdminRoute><AdminQuestions /></AdminRoute>} />
        <Route path="/admin/scores" element={<AdminRoute><AdminScores /></AdminRoute>} />

        {/* ✅ FINAL SAFETY FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}