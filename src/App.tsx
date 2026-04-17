import { useState } from 'react';
import { Login } from './components/Login';
import { ChatModule } from './components/chat/ChatModule';
import { AdminPanel } from './components/admin/AdminPanel';
import { LogOut, Shield, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { Toaster } from 'sonner';
import { UserSettings } from './components/UserSettings';
import { supabase } from './lib/supabase';

import logoLs from './assets/logo_ls.jpg';

function App() {
  const [user, setUser] = useState<any | null>(null);
  const [view, setView] = useState<'chat' | 'admin'>('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogin = (userData: any) => {
    if (!userData) return;
    setUser(userData);
    // If admin, go to admin panel. If others, go to chat.
    setView(userData?.role === 'admin' ? 'admin' : 'chat');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('chat');
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f5' }}>
        <Toaster position="top-right" expand={false} richColors />
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      backgroundColor: '#f0f4f5',
    }}>
      <Toaster position="top-right" expand={false} richColors />
      
      <UserSettings 
        user={user} 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onLogout={handleLogout}
        onUpdate={(updated) => setUser(updated)}
      />

      {/* ── Thin top bar ── */}
      <div style={{
        height: '42px',
        minHeight: '42px',
        backgroundColor: '#1a3a3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 20px',
        gap: '12px',
        flexShrink: 0,
      }}>
        {/* User Profile Trigger */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', 
            cursor: 'pointer', padding: '5px 10px', borderRadius: '8px' 
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#0ABAB5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '800' }}>
            {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '12px', color: '#81D8D0', fontWeight: 700 }}>{user?.display_name || user?.username || 'Usuario'}</span>
        </button>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)' }}></div>

        {/* Admin toggle */}
        {isAdmin && (
          <button
            onClick={() => setView(view === 'chat' ? 'admin' : 'chat')}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px', borderRadius: '8px', border: 'none',
              backgroundColor: view === 'admin' ? '#0ABAB5' : 'rgba(255,255,255,0.12)',
              color: 'white', fontWeight: 700, fontSize: '11px', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {view === 'admin'
              ? <><MessageSquare size={13} /> Chat</>
              : <><Shield size={13} /> Admin</>}
          </button>
        )}

        {/* Logout Quick Button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 12px', borderRadius: '8px', border: 'none',
            backgroundColor: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontWeight: 700, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <LogOut size={13} />
        </button>
      </div>

      {/* ── Main Content ── */}
      <main style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
        backgroundColor: '#f0f4f5',
      }}>
        {view === 'admin' ? <AdminPanel /> : <ChatModule currentUser={user} />}
      </main>
    </div>
  );
}

export default App;
