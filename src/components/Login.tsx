import React, { useState, useEffect } from 'react';
import { Lock, User, ArrowLeft, ShieldCheck, Mail, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: (userData: any) => void;
}

import logoLs from '../assets/logo_ls.jpg';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        onLogin(profile);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Error de acceso: ' + error.message);
      } else if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          toast.error('Error al cargar perfil');
        } else {
          toast.success('Bienvenido de nuevo');
          onLogin(profile);
        }
      }
    } catch (err) {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f0f7f7',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'white',
        borderRadius: '35px',
        padding: '40px',
        boxShadow: '0 20px 50px rgba(26, 58, 58, 0.1)',
        border: '1px solid #eef2f2'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ 
            width: '90px', 
            height: '90px', 
            margin: '0 auto 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
          }}>
            <img 
              src={logoLs} 
              alt="Logo LS" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/90?text=LS'; }}
            />
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#1A3A3A', margin: '0' }}>LS <span style={{ color: '#0ABAB5' }}>Chat</span></h1>
          <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: '#4A5568', opacity: '0.6', marginTop: '8px' }}>Sistema de Comunicación Interna</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '22px' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#1A3A3A', marginLeft: '5px', textTransform: 'uppercase' }}>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@lsclinica.com"
                style={{
                  width: '100%',
                  height: '55px',
                  padding: '0 20px 0 50px',
                  backgroundColor: '#f8fafb',
                  border: '1.5px solid #eef2f2',
                  borderRadius: '15px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#1A3A3A', marginLeft: '5px', textTransform: 'uppercase' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  height: '55px',
                  padding: '0 50px 0 50px',
                  backgroundColor: '#f8fafb',
                  border: '1.5px solid #eef2f2',
                  borderRadius: '15px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#4A5568' }}>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0ABAB5' }} 
              />
              Mantener sesión iniciada
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: '60px',
              backgroundColor: '#1A3A3A',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: '800',
              cursor: isLoading ? 'default' : 'pointer',
              boxShadow: '0 10px 25px rgba(26, 58, 58, 0.2)',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.7 : 1,
              marginTop: '10px'
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Ingresar al Chat'}
          </button>
        </form>
        {version && (
          <div style={{ 
            marginTop: '25px', 
            textAlign: 'center', 
            opacity: 0.4, 
            fontSize: '10px', 
            fontWeight: '800', 
            color: '#1A3A3A',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            v{version}
          </div>
        )}
      </div>
    </div>
  );
};
