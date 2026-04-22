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
  const [version, setVersion] = useState('');

  useEffect(() => {
    const fetchVersion = async () => {
      // @ts-ignore
      if (window.electron && window.electron.getAppVersion) {
        // @ts-ignore
        const v = await window.electron.getAppVersion();
        setVersion(v);
      }
    };
    fetchVersion();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase.channel('presence_layer', { 
      config: { 
        presence: { key: user.id } 
      } 
    });

    const sync = () => {
      const state = channel.presenceState();
      const ids = Object.values(state)
        .flat()
        .map((p: any) => [p.id, p.username])
        .flat()
        .filter(Boolean);
      setOnlineIds([...new Set(ids)]);
    };

    channel
      .on('presence', { event: 'sync' }, sync)
      .on('presence', { event: 'join' }, sync)
      .on('presence', { event: 'leave' }, sync)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            id: user.id, 
            username: user.username, 
            display_name: user.display_name,
            online_at: new Date().toISOString()
          });
        }
      });

    // Re-track cada 30 segundos para mantener la presencia activa
    const interval = setInterval(async () => {
      if (channel.state === 'joined') {
        await channel.track({ 
          id: user.id, 
          username: user.username, 
          display_name: user.display_name,
          online_at: new Date().toISOString()
        });
      }
    }, 30000);

    return () => { 
      clearInterval(interval);
      supabase.removeChannel(channel); 
    };
  }, [user?.id, user?.username]);

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
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px', position: 'relative', overflow: 'hidden', fontFamily: "'Outfit', sans-serif" }}>
        <div className="mesh-gradient" />
        <Toaster position="bottom-right" expand={false} richColors />
        <UserSettings user={user} isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onLogout={handleLogout} onUpdate={setUser} />

        <div className="glass-container" style={{ 
          width: '100%', 
          maxWidth: '1440px', 
          height: '95vh', 
          borderRadius: '28px', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10
        }}>
          
          <div style={{ height: '54px', background: 'rgba(26, 58, 58, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(129, 216, 208, 0.6)', fontWeight: '900', letterSpacing: '2px' }}>
                {version ? `LYNX V${version}` : 'LYNX CHAT'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {isAdmin && (
                <button onClick={openDebug} title="Consola" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Terminal size={14} />
                </button>
              )}

              {isAdmin && (
                <button onClick={() => setView(view === 'chat' ? 'admin' : 'chat')} style={{ padding: '6px 16px', borderRadius: '10px', border: 'none', backgroundColor: view === 'admin' ? '#0ABAB5' : 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {view === 'admin' ? <><MessageSquare size={14} /> Chat</> : <><Shield size={14} /> Panel Admin</>}
                </button>
              )}

              <button onClick={() => setIsSettingsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '10px', backgroundColor: '#0ABAB5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '800' }}>
                  {(user.display_name || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>{user.display_name || 'Usuario'}</span>
              </button>

              <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><LogOut size={16} /></button>
            </div>
          </div>

          <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {view === 'admin' ? <AdminPanel /> : <ChatModule currentUser={user} onlineIds={onlineIds} />}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
