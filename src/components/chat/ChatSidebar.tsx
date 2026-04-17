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
  { id: 'sec', username: 'secretaria', display_name: 'Secretaría (Recepción)', role: 'secretary' },
  { id: 'c1', username: 'consultorio_1', display_name: 'Consultorio 1', role: 'consultorio' },
  { id: 'c2', username: 'consultorio_2', display_name: 'Consultorio 2', role: 'consultorio' },
  { id: 'c3', username: 'consultorio_3', display_name: 'Consultorio 3', role: 'consultorio' },
];

// Simple pseudo-online status: randomise for demo (in production, use presence)
const STATUS_COLORS: Record<number, string> = {
  0: '#22c55e', // green
  1: '#22c55e',
  2: '#f97316', // orange
  3: '#cbd5e1', // gray / offline
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ currentUser, onSelectContact, selectedId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed fallback immediately
    const others = FALLBACK_CONTACTS.filter(c => c.username !== currentUser.username);
    setContacts(others);

    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name');
      
      if (!error && data) {
        const filtered = data.filter(c => c.username !== currentUser.username);
        setContacts(filtered);
      }
      setLoading(false);
    };

    fetchContacts();

    const sub = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => { /* Handle online status sync */ })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [currentUser.username]);

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
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/42?text=LS'; }} 
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

      {/* Broadcasting Area */}
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
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedId === 'broadcast' ? 'white' : '#0ABAB5'
          }}>
            📣
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: '800' }}>Difusión General</div>
            <div style={{ fontSize: '11px', opacity: 0.7, fontWeight: '600' }}>A todos los consultorios</div>
          </div>
        </button>
      </div>

      <div style={{ padding: '10px 24px 5px' }}>
        <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Consultorios</p>
      </div>

      {/* Contacts List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {contacts.map((contact, idx) => (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: selectedId === contact.id ? '#f0f7f7' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => { if (selectedId !== contact.id) e.currentTarget.style.backgroundColor = '#f8fafb'; }}
              onMouseOut={e => { if (selectedId !== contact.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '44px', height: '44px', borderRadius: '14px', 
                  backgroundColor: '#eef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: '800', color: '#1A3A3A', border: selectedId === contact.id ? '2px solid #0ABAB5' : '2px solid transparent'
                }}>
                  {contact.display_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ 
                  position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', 
                  borderRadius: '50%', border: '2px solid white', backgroundColor: STATUS_COLORS[idx % 4] 
                }}></div>
              </div>
              <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1A3A3A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.display_name}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>@{contact.username}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Current User Info */}
      <div style={{ padding: '20px 24px', borderTop: '1px solid #f8fafb', backgroundColor: '#fcfdfe' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#0ABAB5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px' }}>
            {currentUser?.display_name ? currentUser.display_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#1A3A3A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.display_name || 'Mi Perfil'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
              <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '700' }}>En línea</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
