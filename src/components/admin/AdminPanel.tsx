import React, { useState, useEffect } from 'react';
import { Users, Save, Lock, Edit2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  role: string;
  pin: string;
}

export const AdminPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});

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

  const startEdit = (profile: Profile) => {
    setEditingId(profile.id);
    setEditForm(profile);
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: editForm.display_name,
        pin: editForm.pin,
      })
      .eq('id', editingId);

    if (error) {
      toast.error('Error al actualizar');
    } else {
      toast.success('Perfil actualizado correctamente');
      setEditingId(null);
      fetchProfiles();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tiffany-green"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-medical-white">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <ShieldAlert className="text-tiffany-green" size={32} />
              Panel de Administración
            </h1>
            <p className="text-text-secondary mt-2">Gestione usuarios, consultorios y claves de acceso.</p>
          </div>
          <button 
            onClick={fetchProfiles}
            className="p-3 rounded-full hover:bg-tiffany-soft transition-colors"
          >
            <Users size={20} className="text-tiffany-green" />
          </button>
        </header>

        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {profiles.map((profile) => (
              <motion.div
                key={profile.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-6 rounded-3xl"
              >
                {editingId === profile.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">
                          Nombre Visible
                        </label>
                        <input
                          type="text"
                          value={editForm.display_name || ''}
                          onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                          className="premium-input text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">
                          PIN de Acceso
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={editForm.pin || ''}
                          onChange={(e) => setEditForm({...editForm, pin: e.target.value.replace(/\D/g, '')})}
                          className="premium-input text-base font-mono tracking-widest"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setEditingId(null)}
                        className="px-6 py-2 text-text-secondary hover:underline"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleUpdate}
                        className="premium-button flex items-center gap-2"
                      >
                        <Save size={18} /> Guardar Cambios
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-tiffany-soft flex items-center justify-center">
                        <User className="text-tiffany-green" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-text-primary">{profile.display_name}</h3>
                        <p className="text-sm text-text-secondary flex items-center gap-2">
                          <span className="capitalize px-2 py-0.5 rounded-full bg-tiffany-soft text-[10px] font-bold text-tiffany-green border border-tiffany-green/20">
                            {profile.role}
                          </span>
                          • @{profile.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-text-secondary mb-0.5 opacity-50">PIN Actual</p>
                        <p className="font-mono font-bold text-tiffany-green tracking-widest">****</p>
                      </div>
                      <button 
                        onClick={() => startEdit(profile)}
                        className="p-3 bg-tiffany-soft/50 text-tiffany-green rounded-2xl hover:bg-tiffany-green hover:text-white transition-all"
                      >
                        <Edit2 size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const User = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
