import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (role: string) => void;
}

const ROLES = [
  { id: 'secretary', name: 'Secretaría', icon: User },
  { id: 'consultorio_1', name: 'Consultorio 1', icon: ShieldCheck },
  { id: 'consultorio_2', name: 'Consultorio 2', icon: ShieldCheck },
  { id: 'consultorio_3', name: 'Consultorio 3', icon: ShieldCheck },
  { id: 'admin', name: 'SuperAdmin', icon: Lock },
];

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setPin('');
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, any PIN works for testing as requested
    // We will later verify against Supabase profiles
    if (pin.length < 4) {
      setError('PIN debe tener al menos 4 dígitos');
      return;
    }
    
    // Success simulation
    onLogin(selectedRole!);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-medical-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl text-center"
      >
        <img 
          src="/logo ls.jpeg" 
          alt="LS Odontología" 
          className="h-24 mx-auto mb-6 object-contain"
        />
        
        {!selectedRole ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary mb-6">Seleccione su Rol</h2>
            <div className="grid grid-cols-1 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="flex items-center p-4 bg-white border-2 border-transparent hover:border-tiffany-green rounded-2xl transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-tiffany-soft flex items-center justify-center group-hover:bg-tiffany-green group-hover:text-white transition-colors">
                    <role.icon size={20} />
                  </div>
                  <span className="ml-4 font-medium text-text-secondary group-hover:text-tiffany-green">{role.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setSelectedRole(null)}
              className="text-sm text-tiffany-green hover:underline mb-4 inline-block"
            >
              ← Volver a roles
            </button>
            <h2 className="text-2xl font-semibold text-text-primary">
              Ingrese PIN para {ROLES.find(r => r.id === selectedRole)?.name}
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="premium-input text-center text-3xl tracking-widest"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" className="premium-button w-full text-lg">
                Ingresar
              </button>
            </form>
          </motion.div>
        )}
      </motion.div>
      
      <p className="mt-8 text-xs text-text-secondary opacity-50">
        © 2026 LS Odontología • Chat Interno
      </p>
    </div>
  );
};
