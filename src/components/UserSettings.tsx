import React, { useState } from 'react';
import { Camera, User, Lock, Save, X, LogOut, Plus, Trash2, MessageSquare, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface UserSettingsProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onUpdate: (updatedUser: any) => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ user, isOpen, onClose, onLogout, onUpdate }) => {
  const [displayName, setDisplayName] = useState(user.display_name);
  const [newPassword, setNewPassword] = useState('');
  const [quickReplies, setQuickReplies] = useState<string[]>(user.quick_replies || []);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'replies'>('profile');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'>('idle');

  React.useEffect(() => {
    // @ts-ignore
    if (!window.electron) return;

    // @ts-ignore
    window.electron.receive('update-available', (info: any) => {
      setUpdateStatus('available');
      toast.info(`Nueva versión disponible: ${info.version}`);
    });

    // @ts-ignore
    window.electron.receive('update-not-available', () => {
      setUpdateStatus('not-available');
      toast.success('Ya tienes la versión más reciente');
    });

    // @ts-ignore
    window.electron.receive('update-download-progress', (progress: any) => {
      setUpdateStatus('downloading');
    });

    // @ts-ignore
    window.electron.receive('update-downloaded', () => {
      setUpdateStatus('downloaded');
      toast.success('Actualización descargada. Reinicia para instalar.');
    });

    // @ts-ignore
    window.electron.receive('update-error', (err: string) => {
      setUpdateStatus('error');
      // Si el error es muy largo o contiene XML, mostramos algo genérico
      const cleanErr = (err.includes('<?xml') || err.length > 100) 
        ? "Servidor de actualizaciones no disponible o versión no publicada." 
        : err;
      toast.error('Error al actualizar: ' + cleanErr);
    });
  }, []);

  const handleCheckUpdates = () => {
    // @ts-ignore
    if (window.electron && window.electron.checkForUpdates) {
      setUpdateStatus('checking');
      // @ts-ignore
      window.electron.checkForUpdates();
    } else {
      toast.error('El actualizador no está disponible en este entorno');
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName,
          quick_replies: quickReplies 
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      onUpdate(data);
      toast.success('Perfil actualizado correctamente');
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Contraseña actualizada');
      setNewPassword('');
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addQuickReply = () => {
    if (newReply.trim() && quickReplies.length < 8) {
      setQuickReplies([...quickReplies, newReply.trim()]);
      setNewReply('');
    } else if (quickReplies.length >= 8) {
      toast.error('Máximo 8 respuestas rápidas');
    }
  };

  const removeQuickReply = (index: number) => {
    setQuickReplies(quickReplies.filter((_, i) => i !== index));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
        >
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            style={{ backgroundColor: 'white', borderRadius: '35px', width: '100%', maxWidth: '500px', boxShadow: '0 30px 70px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
          >
            {/* Header */}
            <div style={{ padding: '30px 35px 20px', borderBottom: '1.5px solid #f0f7f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#1A3A3A' }}>Configuración</h2>
                <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>@{user.username}</p>
              </div>
              <button onClick={onClose} style={{ background: '#f8fafb', border: 'none', cursor: 'pointer', color: '#94a3b8', width: '40px', height: '40px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '10px 35px', gap: '20px', backgroundColor: '#f8fafb' }}>
              <button 
                onClick={() => setActiveTab('profile')}
                style={{ background: 'none', border: 'none', padding: '10px 0', fontSize: '14px', fontWeight: '800', color: activeTab === 'profile' ? '#0ABAB5' : '#94a3b8', cursor: 'pointer', borderBottom: activeTab === 'profile' ? '3px solid #0ABAB5' : '3px solid transparent', transition: 'all 0.2s' }}
              >
                Perfil y Seguridad
              </button>
              <button 
                onClick={() => setActiveTab('replies')}
                style={{ background: 'none', border: 'none', padding: '10px 0', fontSize: '14px', fontWeight: '800', color: activeTab === 'replies' ? '#0ABAB5' : '#94a3b8', cursor: 'pointer', borderBottom: activeTab === 'replies' ? '3px solid #0ABAB5' : '3px solid transparent', transition: 'all 0.2s' }}
              >
                Respuestas Rápidas
              </button>
            </div>

            {/* Content Scroll Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '30px 35px' }}>
              {activeTab === 'profile' ? (
                <div style={{ display: 'grid', gap: '30px' }}>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: '#1A3A3A', textTransform: 'uppercase' }}>Nombre del Consultorio</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        value={displayName} 
                        onChange={e => setDisplayName(e.target.value)}
                        style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1.5px solid #eef2f2', backgroundColor: '#f8fafb', outline: 'none', fontWeight: '600' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: '#1A3A3A', textTransform: 'uppercase' }}>Nueva Contraseña</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1.5px solid #eef2f2', backgroundColor: '#f8fafb', outline: 'none' }}
                      />
                      <button onClick={handleChangePassword} style={{ width: '50px', height: '50px', backgroundColor: '#1A3A3A', color: 'white', border: 'none', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Lock size={18} />
                      </button>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: '#1A3A3A', textTransform: 'uppercase' }}>Sistema</label>
                      <button 
                        onClick={handleCheckUpdates}
                        disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                          padding: '15px', borderRadius: '15px', border: '1.5px solid #eef2f2', 
                          backgroundColor: '#f8fafb', color: '#1A3A3A', fontWeight: '700', cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#eef2f2'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#f8fafb'}
                      >
                        <RefreshCcw size={18} className={updateStatus === 'checking' || updateStatus === 'downloading' ? 'animate-spin' : ''} style={{ animation: (updateStatus === 'checking' || updateStatus === 'downloading') ? 'spin 1s linear infinite' : 'none' }} />
                        {updateStatus === 'checking' ? 'Buscando...' : 
                         updateStatus === 'downloading' ? 'Descargando...' :
                         updateStatus === 'downloaded' ? 'Listo para instalar' :
                         'Buscar Actualización'}
                      </button>
                      <style>{`
                        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                      `}</style>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <p style={{ fontSize: '13px', color: '#4A5568', margin: 0, fontWeight: '500', lineHeight: 1.5 }}>Configura tus frases más usadas para enviarlas con un solo clic.</p>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      placeholder="Nueva frase (ej: Paciente listo)"
                      value={newReply}
                      onChange={e => setNewReply(e.target.value)}
                      maxLength={30}
                      style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1.5px solid #eef2f2', backgroundColor: '#f8fafb', outline: 'none', fontWeight: '600' }}
                    />
                    <button onClick={addQuickReply} style={{ width: '50px', height: '50px', backgroundColor: '#0ABAB5', color: 'white', border: 'none', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Plus size={20} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {quickReplies.map((reply, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', backgroundColor: '#f8fafb', borderRadius: '15px', border: '1px solid #eef2f2' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A3A3A' }}>{reply}</span>
                        <button onClick={() => removeQuickReply(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '25px 35px', backgroundColor: 'white', borderTop: '1.5px solid #f0f7f7', display: 'flex', gap: '15px' }}>
              <button 
                onClick={handleUpdateProfile}
                disabled={loading}
                style={{ flex: 1, padding: '18px', backgroundColor: '#0ABAB5', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(10, 186, 181, 0.2)' }}
              >
                <Save size={20} /> Guardar Cambios
              </button>
              <button 
                onClick={onLogout}
                style={{ width: '60px', height: '56px', borderRadius: '20px', border: '1.5px solid #fee2e2', backgroundColor: 'white', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <LogOut size={20} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
