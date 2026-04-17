import { useState, useEffect } from 'react';
import { Users, Save, Lock, Edit2, ShieldAlert, RefreshCw, UserPlus, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  role: string;
  email?: string;
  raw_password?: string; // Campo para la contraseña visible
}

export const AdminPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  
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
      .order('display_name');

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
      // 1. Crear en Auth
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

      // 2. Actualizar el perfil con la contraseña legible (el trigger crea el perfil, nosotros lo actualizamos)
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ raw_password: formData.password })
          .eq('id', data.user.id);
      }

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

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ flex: 1, padding: '40px', overflowY: 'auto', backgroundColor: '#f0f7f7' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1A3A3A', margin: 0 }}>Gestión de <span style={{ color: '#0ABAB5' }}>Usuarios</span></h1>
            <p style={{ color: '#4A5568', opacity: 0.7, margin: '5px 0 0' }}>Ver y administrar accesos del personal</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', backgroundColor: '#0ABAB5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
            <UserPlus size={18} /> Nuevo Usuario
          </button>
        </header>

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
                {/* Visualización de Contraseña */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafb', padding: '8px 12px', borderRadius: '10px', minWidth: '150px' }}>
                  <Lock size={14} color="#94a3b8" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#4A5568', flex: 1 }}>
                    {showPasswords[profile.id] ? (profile.raw_password || '********') : '••••••••'}
                  </span>
                  <button onClick={() => togglePassword(profile.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0ABAB5', display: 'flex', alignItems: 'center' }}>
                    {showPasswords[profile.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button style={{ padding: '10px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1A3A3A' }}>Crear Nuevo Usuario</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#1A3A3A', textTransform: 'uppercase' }}>Correo Electrónico</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eef2f2', marginTop: '5px' }} />
                </div>
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
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
