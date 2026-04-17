import React, { useState, useEffect } from 'react';
import { Users, Megaphone, Search, Circle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  role: string;
}

interface ChatSidebarProps {
  onSelectTarget: (target: Profile | 'broadcast') => void;
  selectedTarget: Profile | 'broadcast' | null;
  onlineIds: string[];
  currentUser: any;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  onSelectTarget, 
  selectedTarget, 
  onlineIds,
  currentUser 
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProfiles();
    fetchUnreadCounts();

    // Suscribirse a nuevos mensajes y actualizaciones de lectura
    const channel = supabase
      .channel('sidebar_updates_v5')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' }, // Escuchar TODO (Insert, Update, Delete)
        () => {
          fetchUnreadCounts();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.username, selectedTarget]); // Refrescar cuando cambie el chat seleccionado

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('username', currentUser?.username)
      .order('display_name');
    setProfiles(data || []);
  };

  const fetchUnreadCounts = async () => {
    if (!currentUser?.username) return;

    const { data, error } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('recipient_id', currentUser.username)
      .is('read_at', null);

    if (!error && data) {
      const counts: Record<string, number> = {};
      data.forEach(msg => {
        counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
      });
      setUnreadCounts(counts);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ width: '320px', borderRight: '1px solid #e8eef0', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
      <div style={{ padding: '30px 24px 20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1A3A3A', margin: 0 }}>Chat <span style={{ color: '#0ABAB5' }}>Clínico</span></h1>
        <div style={{ marginTop: '20px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Buscar consultorio..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '14px', border: '1.5px solid #eef2f2', backgroundColor: '#f8fafb', fontSize: '14px', outline: 'none', transition: 'all 0.2s', fontWeight: '600' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
        <div 
          onClick={() => onSelectTarget('broadcast')}
          style={{ padding: '16px 12px', borderRadius: '16px', cursor: 'pointer', backgroundColor: selectedTarget === 'broadcast' ? '#f0f7f7' : 'transparent', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#0ABAB5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(10, 186, 181, 0.2)' }}>
            <Megaphone size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#1A3A3A', fontSize: '15px' }}>Difusión General</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Toda la clínica</div>
          </div>
        </div>

        <div style={{ margin: '20px 12px 10px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Contactos</div>

        {filteredProfiles.map((profile) => {
          const isSelected = (selectedTarget as Profile)?.id === profile.id;
          const isOnline = Array.isArray(onlineIds) && onlineIds.includes(profile.id);
          const unreadCount = unreadCounts[profile.username] || 0;

          return (
            <div 
              key={profile.id}
              onClick={() => onSelectTarget(profile)}
              style={{ padding: '12px', borderRadius: '16px', cursor: 'pointer', backgroundColor: isSelected ? '#f0f7f7' : 'transparent', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#f0f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ABAB5', fontWeight: 800, fontSize: '18px', border: '1.5px solid #eef2f2' }}>
                    {profile.display_name.charAt(0)}
                  </div>
                  {isOnline && (
                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#22c55e', border: '3px solid white' }}></div>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#1A3A3A', fontSize: '15px' }}>{profile.display_name}</div>
                  <div style={{ fontSize: '12px', color: isOnline ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>{isOnline ? 'En línea' : 'Desconectado'}</div>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <div style={{ backgroundColor: '#EF4444', color: 'white', minWidth: '22px', height: '22px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', padding: '0 6px', boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)' }}>
                  {unreadCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
