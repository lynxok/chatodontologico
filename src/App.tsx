import { useState } from 'react';
import { Login } from './components/Login';
import { ChatModule } from './components/chat/ChatModule';
import { Settings, LogOut, Shield } from 'lucide-react';
import { Toaster } from 'sonner';

function App() {
  const [user, setUser] = useState<{ role: string } | null>(null);

  const handleLogin = (role: string) => {
    setUser({ role });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <>
        <Toaster position="top-right" expand={false} richColors />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="flex flex-col h-screen overflow-hidden font-['Outfit']">
      <Toaster position="top-right" expand={false} richColors />
      {/* Navigation Header */}
      <header className="h-16 glass-panel border-b flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo ls.jpeg" alt="Logo" className="h-10 w-auto rounded" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-tiffany-green leading-none">LS Chat</h1>
            <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em]">Odontológico</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-text-primary">
                {user.role === 'admin' ? 'Super Administrador' : 
                 user.role === 'secretary' ? 'Recepción' : 
                 user.role.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-[10px] text-green-500 font-bold flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                EN LÍNEA
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-tiffany-green flex items-center justify-center text-white shadow-lg shadow-tiffany-green/20">
              {isAdmin ? <Shield size={20} /> : <Settings size={20} />}
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-medical-gray"></div>
          
          <button 
            onClick={handleLogout}
            className="group flex items-center gap-2 text-text-secondary hover:text-red-500 transition-colors py-2 px-3 rounded-xl hover:bg-red-50"
          >
            <LogOut size={20} />
            <span className="text-xs font-bold hidden sm:block">SALIR</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex bg-medical-white">
        <ChatModule currentUser={user} />
      </main>

      {/* Admin Quick Action (Only for SuperAdmin) */}
      {isAdmin && (
        <div className="absolute bottom-6 right-6 z-50">
          <button className="premium-button flex items-center gap-2 shadow-2xl">
            <Shield size={20} />
            Configurar Clínica
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
