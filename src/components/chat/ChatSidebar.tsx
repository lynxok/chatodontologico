import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import logoLs from '../../assets/logo_ls.jpg';

interface Contact {
  id: string;
  username: string;
  display_name: string;
  role: string;
}

interface ChatSidebarProps {
  currentUser: any;
  onSelectContact: (contact: Contact | 'broadcast') => void;
  selectedId: string | 'broadcast';
}

const FALLBACK_CONTACTS: Contact[] = [
  { id: 'sec', username: 'secretaria', display_name: 'Secretaría', role: 'secretary' },
  { id: 'c1', username: 'consultorio_1', display_name: 'Consultorio 1', role: 'consultorio' },
  { id: 'c2', username: 'consultorio_2', display_name: 'Consultorio 2', role: 'consultorio' },
  { id: 'c3', username: 'consultorio_3', display_name: 'Consultorio 3', role: 'consultorio' },
];

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ currentUser, onSelectContact, selectedId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  // Set of user IDs currently online (from Realtime Presence)
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  // ── Fetch contacts from DB ─────────────────────────────────────────────
  useEffect(() => {
    // Seed with fallback immediately
    const others = FALLBACK_CONTACTS.filter(c => c.username !== currentUser.username);
    setContacts(others);

    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, role')
        .order('display_name');

      if (!error && data) {
        const filtered = data.filter((c: Contact) => c.id !== currentUser.id);
        setContacts(filtered);
      }
      setLoading(false);
    };

    fetchContacts();
  }, [currentUser.id, currentUser.username]);

  // ── Subscribe to Realtime Presence ─────────────────────────────────────
  useEffect(() => {
    const presenceChannel = supabase.channel('app_presence', {
      config: { presence: { key: currentUser.id } },
    });

    const syncOnlineUsers = () => {
      const presenceState = presenceChannel.presenceState();
      const ids = new Set<string>();
      // Each key in presenceState is a user_id; collect all tracked user_ids
      Object.values(presenceState).forEach((presences: any) => {
        presences.forEach((p: any) => {
          if (p.user_id) ids.add(p.user_id);
        });
      });
      setOnlineIds(ids);
    };

    presenceChannel
      .on('presence', { event: 'sync' }, syncOnlineUsers)
      .on('presence', { event: 'join' }, syncOnlineUsers)
      .on('presence', { event: 'leave' }, syncOnlineUsers)
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [currentUser.id]);

  // ── Determine status dot color ─────────────────────────────────────────
  const getStatusColor = (contactId: string): string => {
    if (onlineIds.has(contactId)) return '#22c55e'; // green = online
    return '#cbd5e1'; // gray = offline
  };

  const getStatusLabel = (contactId: string): string => {
    return onlineIds.has(contactId) ? 'Conectado' : 'Desconectado';
  };

  return (
    <div style={{
      width: '300px',
      height: '100%',
      backgroundColor: 'white',
      borderRight: '1px solid #e8eef0',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* ── Logo & Title ── */}
      <div style={{ padding: '25px 24px', borderBottom: '1px solid #f8fafb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            flexShrink: 0,
            backgroundColor: '#f8fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={logoLs}
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#1A3A3A', lineHeight: 1.1 }}>
              LS Centro <br />
              <span style={{ color: '#0ABAB5' }}>Odontológico</span>
            </h1>
          </div>
        </div>
      </div>

      {/* ── Broadcast Button ── */}
      <div style={{ padding: '16px 24px' }}>
        <button
          onClick={() => onSelectContact('broadcast')}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: selectedId === 'broadcast' ? '#1a3a3a' : '#f8fafb',
            color: selectedId === 'broadcast' ? 'white' : '#1a3a3a',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: selectedId === 'broadcast' ? '0 8px 20px rgba(26,58,58,0.2)' : 'none',
          }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            backgroundColor: selectedId === 'broadcast' ? '#0ABAB5' : '#e0f2f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: selectedId === 'broadcast' ? 'white' : '#0ABAB5'
          }}>
            📣
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: '800' }}>Difusión General</div>
            <div style={{ fontSize: '11px', opacity: 0.7, fontWeight: '600' }}>A todos los consultorios</div>
          </div>
        </button>
      </div>

      {/* ── Section label ── */}
      <div style={{ padding: '10px 24px 5px' }}>
        <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
          Consultorios
        </p>
      </div>

      {/* ── Contacts List ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 24px' }}>
        {loading && contacts.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', paddingTop: '20px' }}>
            Cargando...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {contacts.map((contact) => {
              const isOnline = onlineIds.has(contact.id);
              const isSelected = selectedId === contact.id;

              return (
                <button
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '16px',
                    border: 'none',
                    backgroundColor: isSelected ? '#f0f7f7' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafb'; }}
                  onMouseOut={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Avatar with presence dot */}
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '14px',
                      backgroundColor: '#eef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: '800', color: '#1A3A3A',
                      border: isSelected ? '2px solid #0ABAB5' : '2px solid transparent',
                      transition: 'border-color 0.2s ease',
                    }}>
                      {contact.display_name.charAt(0).toUpperCase()}
                    </div>
                    {/* Real presence dot */}
                    <div style={{
                      position: 'absolute', bottom: '-2px', right: '-2px',
                      width: '12px', height: '12px',
                      borderRadius: '50%',
                      border: '2px solid white',
                      backgroundColor: getStatusColor(contact.id),
                      transition: 'background-color 0.4s ease',
                      // Pulse animation only when online
                      boxShadow: isOnline ? '0 0 0 2px rgba(34,197,94,0.25)' : 'none',
                    }} />
                  </div>

                  {/* Name + status text */}
                  <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px', fontWeight: '700', color: '#1A3A3A',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {contact.display_name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: isOnline ? '#22c55e' : '#94a3b8',
                      fontWeight: '600',
                      transition: 'color 0.3s ease',
                    }}>
                      {getStatusLabel(contact.id)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Current User Footer ── */}
      <div style={{ padding: '20px 24px', borderTop: '1px solid #f8fafb', backgroundColor: '#fcfdfe' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            backgroundColor: '#0ABAB5', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '14px'
          }}>
            {currentUser?.display_name ? currentUser.display_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '13px', fontWeight: '800', color: '#1A3A3A',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {currentUser?.display_name || 'Mi Perfil'}
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', marginLeft: '6px' }}>(Tú)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '700' }}>En línea</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
