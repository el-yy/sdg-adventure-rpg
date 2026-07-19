import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import DashboardPage from './components/dashboard/DashboardPage';
import GamePage from './components/dashboard/GamePage';
import AchievementPage from './components/achievements/AchievementPage';
import LeaderboardPage from './components/leaderboard/LeaderboardPage';
import InventoryPage from './components/inventory/InventoryPage';
import HowToPlayPage from './components/guide/HowToPlayPage';

function ProtectedRoute({ children, user }: { children: React.ReactNode; user: unknown }) {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser as unknown);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading SDG Adventure...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/" element={<ProtectedRoute user={user}><DashboardPage /></ProtectedRoute>} />
        <Route path="/play/:worldId" element={<ProtectedRoute user={user}><GamePage /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute user={user}><AchievementPage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute user={user}><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute user={user}><InventoryPage /></ProtectedRoute>} />
        <Route path="/how-to-play" element={<ProtectedRoute user={user}><HowToPlayPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
