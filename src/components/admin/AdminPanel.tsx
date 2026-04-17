import React, { useState, useEffect } from 'react';
import { Users, Save, Lock, Edit2, ShieldAlert, RefreshCw, UserPlus, Trash2, X, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  role: string;
  email?: string;
}

export const AdminPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New User Form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    display_name: '',
    username: '',
    role: 'consultorio'
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('username');

    if (error) {
      toast.error('Error al cargar perfiles');
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create User in Auth (Note: Admin would ideally use Auth API, 
      // but for this MVP we'll use signUp which creates the profile via trigger)
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

      toast.success('Usuario creado correctamente');
      setIsModalOpen(false);
      setFormData({ email: '', password: '', display_name: '', username: '', role: 'consultorio' });
      fetchProfiles();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (profile: Profile) => {
    setEditingId(profile.id);
    setFormData({
      ...formData,
      display_name: profile.display_name,
      username: profile.username,
      role: profile.role
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          username: formData.username,
          role: formData.role
        })
        .eq('id', editingId);

      if (error) throw error;

      toast.success('Perfil actualizado');
      setEditingId(null);
      fetchProfiles();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f7f7' }}>
        <RefreshCw className="animate-spin text-tiffany-green" size={40} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '40px', overflowY: 'auto', backgroundColor: '#f0f7f7' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1A3A3A', margin: 0 }}>Gestión de <span style={{ color: '#0ABAB5' }}>Usuarios</span></h1>
            <p style={{ color: '#4A5568', opacity: 0.7, margin: '5px 0 0' }}>Administre los accesos de la clínica</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', 
              backgroundColor: '#0ABAB5', color: 'white', border: 'none', borderRadius: '12px', 
              fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(10, 186, 181, 0.2)' 
            }}
          >
            <UserPlus size={18} /> Nuevo Usuario
          </button>
        </header>

        <div style={{ display: 'grid', gap: '15px' }}>
          {profiles.map((profile) => (
            <div 
              key={profile.id} 
              style={{ 
                backgroundColor: 'white', padding: '20px', borderRadius: '20px', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.02)', border: '1px solid #eef2f2'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f7f7', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ABAB5' }}>
                  <Users size={24} />
                </div>
                <div>
                  {editingId === profile.id ? (
                    <input 
                      value={formData.display_name} 
                      onChange={e => setFormData({...formData, display_name: e.target.value})}
                      style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', fontWeight: '700' }}
                    />
                  ) : (
                    <h3 style={{ margin: 0, fontWeight: '700', color: '#1A3A3A' }}>{profile.display_name}</h3>
                  )}
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>@{profile.username} · {profile.role}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                {editingId === profile.id ? (
                  <>
                    <button onClick={handleUpdate} style={{ padding: '10px', color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer' }}><Save size={20} /></button>
                    <button onClick={() => setEditingId(null)} style={{ padding: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                  </>
                ) : (
                  <button onClick={() => startEdit(profile)} style={{ padding: '10px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={20} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1A3A3A' }}>Crear Nuevo Usuario</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#1A3A3A' }}>Correo Electrónico (Para Login)</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eef2f2', backgroundColor: '#f8fafb' }} />
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#1A3A3A' }}>Contraseña Inicial</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eef2f2', backgroundColor: '#f8fafb' }} />
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#1A3A3A' }}>Nombre a Mostrar (Ej: Consultorio 1)</label>
                  <input required value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eef2f2', backgroundColor: '#f8fafb' }} />
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#1A3A3A' }}>Nombre de Usuario (ID único)</label>
                  <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eef2f2', backgroundColor: '#f8fafb' }} />
                </div>
                
                <button type="submit" style={{ marginTop: '10px', height: '55px', backgroundColor: '#1A3A3A', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '800', cursor: 'pointer' }}>
                  Crear Usuario
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
