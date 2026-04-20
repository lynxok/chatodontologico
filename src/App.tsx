import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Login } from './components/Login';
import { ChatModule } from './components/chat/ChatModule';
import { AdminPanel } from './components/admin/AdminPanel';
import { LogOut, Shield, MessageSquare, AlertCircle, Terminal } from 'lucide-react';
import { Toaster } from 'sonner';
import { UserSettings } from './components/UserSettings';
import { supabase } from './lib/supabase';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <AlertCircle size={64} color="#ef4444" />
          <h1 style={{ color: '#1a3a3a', margin: 0 }}>Error de Sistema</h1>
          <pre style={{ backgroundColor: '#f8fafb', padding: '20px', borderRadius: '12px', color: '#ef4444', maxWidth: '80%', overflow: 'auto' }}>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: '#0ABAB5', color: 'white', border: 'none', cursor: 'pointer' }}>Reiniciar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState<any | null>(null);
  const [view, setView] = useState<'chat' | 'admin'>('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel('presence_layer', { config: { presence: { key: user.id } } });
    const sync = () => {
      const state = channel.presenceState();
      const ids = Object.keys(state);
      setOnlineIds(ids);
    };
    channel.on('presence', { event: 'sync' }, sync).on('presence', { event: 'join' }, sync).on('presence', { event: 'leave' }, sync)
      .subscribe(async (status) => { if (status === 'SUBSCRIBED') await channel.track({ id: user.id, display_name: user.display_name }); });
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleLogin = (userData: any) => {
    if (!userData) return;
    setUser(userData);
    setView(userData?.role === 'admin' ? 'admin' : 'chat');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('chat');
  };

  const openDebug = () => {
    // @ts-ignore
    if (window.electron && window.electron.openDevTools) {
      // @ts-ignore
      window.electron.openDevTools();
    }
  };

  if (!user) {
    return (
      <ErrorBoundary>
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f5' }}>
          <Toaster position="bottom-right" expand={false} richColors /><Login onLogin={handleLogin} />
        </div>
      </ErrorBoundary>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: "'Outfit', sans-serif", backgroundColor: '#f0f4f5' }}>
        <Toaster position="bottom-right" expand={false} richColors />
        <UserSettings user={user} isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onLogout={handleLogout} onUpdate={setUser} />

        <div style={{ height: '42px', backgroundColor: '#1a3a3a', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px', gap: '12px' }}>
          
          {/* Debug Button (Admin only) */}
          {isAdmin && (
            <button 
              onClick={openDebug}
              title="Abrir consola de depuración"
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              <Terminal size={14} />
            </button>
          )}

          <button onClick={() => setIsSettingsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#0ABAB5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '800' }}>
              {(user.display_name || 'U').charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '12px', color: '#81D8D0', fontWeight: 700 }}>{user.display_name || 'Usuario'}</span>
          </button>

          <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)' }}></div>

          {isAdmin && (
            <button onClick={() => setView(view === 'chat' ? 'admin' : 'chat')} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', backgroundColor: view === 'admin' ? '#0ABAB5' : 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
              {view === 'admin' ? <MessageSquare size={13} /> : <Shield size={13} />}
            </button>
          )}
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><LogOut size={13} /></button>
        </div>

        <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {view === 'admin' ? <AdminPanel /> : <ChatModule currentUser={user} onlineIds={onlineIds} />}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
