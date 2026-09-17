import { useState, useEffect } from 'react';
import { getSession, logout } from '@/lib/api';
import type { User } from '@/lib/types';
import AnimatedBackground from './components/AnimatedBackground';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
    setReady(true);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (!ready) {
    return (
      <>
        <AnimatedBackground />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedBackground />
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage onAuth={setUser} />
      )}
    </>
  );
}
