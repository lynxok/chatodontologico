import { useState, useEffect } from 'react';
import { Users, Save, Lock, Edit2, ShieldAlert, RefreshCw, UserPlus, Trash2, X, Eye, EyeOff, FileText, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  role: string;
  email?: string;
  raw_password?: string;
}

interface SystemLog {
  id: string;
  user_id: string;
  user_name: string;
  error_type: string;
  error_message: string;
  details: any;
  created_at: string;
}

export const AdminPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    display_name: '',
    username: '',
    role: 'consultorio'
  });

  useEffect(() => {
    if (activeTab === 'users') fetchProfiles();
    else fetchLogs();
  }, [activeTab]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      toast.error('Error al cargar logs');
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('display_name');

    if (error) {
      toast.error('Error al cargar perfiles');
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const handleOpenEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      email: profile.email || '',
      password: profile.raw_password || '',
      display_name: profile.display_name,
      username: profile.username,
      role: profile.role
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProfile) {
        // ACTUALIZAR EXISTENTE
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: formData.display_name,
            username: formData.username,
            role: formData.role,
            raw_password: formData.password
          })
          .eq('id', editingProfile.id);

        if (error) throw error;
        toast.success('Usuario actualizado');
      } else {
        // CREAR NUEVO
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              display_name: formData.display_name,
              role: formData.role
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          await supabase
            .from('profiles')
            .update({ raw_password: formData.password })
            .eq('id', data.user.id);
        }
        toast.success('Usuario creado correctamente');
      }

      setIsModalOpen(false);
      setEditingProfile(null);
      setFormData({ email: '', password: '', display_name: '', username: '', role: 'consultorio' });
      fetchProfiles();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esto no borrará sus credenciales de acceso pero sí su perfil de chat.')) return;
    
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar');
    } else {
      toast.success('Perfil eliminado');
      fetchProfiles();
    }
  };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ flex: 1, padding: '40px', overflowY: 'auto', backgroundColor: '#f0f7f7' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1A3A3A', margin: 0 }}>Panel de <span style={{ color: '#0ABAB5' }}>Control Admin</span></h1>
              <p style={{ color: '#4A5568', opacity: 0.7, margin: '5px 0 0' }}>Administración de usuarios y monitoreo de errores</p>
            </div>
            {activeTab === 'users' && (
              <button onClick={() => { setEditingProfile(null); setFormData({ email: '', password: '', display_name: '', username: '', role: 'consultorio' }); setIsModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', backgroundColor: '#0ABAB5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                <UserPlus size={18} /> Nuevo Usuario
              </button>
            )}
            {activeTab === 'logs' && (
              <button onClick={fetchLogs} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', backgroundColor: 'white', color: '#1A3A3A', border: '1px solid #eef2f2', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Actualizar
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', backgroundColor: 'rgba(26, 58, 58, 0.05)', padding: '6px', borderRadius: '14px', width: 'fit-content' }}>
            <button 
              onClick={() => setActiveTab('users')}
              style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'users' ? 'white' : 'transparent', color: activeTab === 'users' ? '#1A3A3A' : '#94a3b8', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: activeTab === 'users' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none' }}
            >
              <Users size={16} /> Usuarios
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'logs' ? 'white' : 'transparent', color: activeTab === 'logs' ? '#1A3A3A' : '#94a3b8', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: activeTab === 'logs' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none' }}
            >
              <FileText size={16} /> Logs de Errores
            </button>
          </div>
        </header>

        {activeTab === 'users' ? (
          <div style={{ display: 'grid', gap: '15px' }}>
          {profiles.map((profile) => (
            <div key={profile.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eef2f2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f7f7', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ABAB5' }}>
                  <Users size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: '700', color: '#1A3A3A' }}>{profile.display_name}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>@{profile.username} · {profile.role}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafb', padding: '8px 12px', borderRadius: '10px', minWidth: '150px' }}>
                  <Lock size={14} color="#94a3b8" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#4A5568', flex: 1 }}>
                    {showPasswords[profile.id] ? (profile.raw_password || '********') : '••••••••'}
                  </span>
                  <button onClick={() => togglePassword(profile.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0ABAB5' }}>
                    {showPasswords[profile.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => handleOpenEdit(profile)} style={{ padding: '10px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = '#0ABAB5'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => handleDelete(profile.id)} style={{ padding: '10px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>
                <AlertTriangle size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
                <p style={{ fontWeight: '700' }}>No se han registrado errores por ahora.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #eef2f2', overflow: 'hidden' }}>
                  <div 
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ margin: 0, fontWeight: '800', color: '#1A3A3A', fontSize: '14px' }}>{log.error_type}</h3>
                          <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#64748b', fontWeight: '700' }}>{log.user_name}</span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#4A5568', fontWeight: '600' }}>{log.error_message}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                        <Clock size={14} />
                        <span style={{ fontSize: '11px', fontWeight: '700' }}>{new Date(log.created_at).toLocaleString('es-AR')}</span>
                      </div>
                      {expandedLog === log.id ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                    </div>
                  </div>
                  
                  {expandedLog === log.id && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f8fafb' }}>
                      <div style={{ backgroundColor: '#f8fafb', padding: '15px', borderRadius: '12px', marginTop: '15px' }}>
                        <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Detalles Técnicos (JSON)</p>
                        <pre style={{ margin: 0, fontSize: '12px', color: '#1A3A3A', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                      <p style={{ margin: '15px 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>ID de Log: {log.id} · ID Usuario: {log.user_id}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1A3A3A' }}>{editingProfile ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSave} style={{ display: 'grid', gap: '15px' }}>
                {!editingProfile && (
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#1A3A3A', textTransform: 'uppercase' }}>Correo Electrónico</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f2', marginTop: '5px' }} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#1A3A3A', textTransform: 'uppercase' }}>Contraseña</label>
                  <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f2', marginTop: '5px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#1A3A3A', textTransform: 'uppercase' }}>Nombre a Mostrar</label>
                  <input required value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f2', marginTop: '5px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#1A3A3A', textTransform: 'uppercase' }}>Usuario (ID)</label>
                  <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f2', marginTop: '5px' }} />
                </div>
                
                <button type="submit" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1A3A3A', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
                  {loading ? 'Guardando...' : (editingProfile ? 'Guardar Cambios' : 'Crear Usuario')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
