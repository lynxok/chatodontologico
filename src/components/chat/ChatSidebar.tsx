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
  onlineIds: Set<string>;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ currentUser, onSelectContact, selectedId, onlineIds }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, role')
          .order('display_name');
        if (!error && data) {
          setContacts(data.filter((c: any) => c.id !== currentUser.id));
        }
      } catch (err) { console.error(err); }
    };
    fetchContacts();
  }, [currentUser?.id]);

  if (!currentUser) return <div style={{ width: '300px', backgroundColor: 'white' }} />;

  return (
    <div style={{ width: '300px', height: '100%', backgroundColor: 'white', borderRight: '1px solid #e8eef0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '25px 24px', borderBottom: '1px solid #f8fafb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logoLs} alt="L" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
          <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#1A3A3A', lineHeight: 1.1 }}>LS Centro <br /> <span style={{ color: '#0ABAB5' }}>Odontológico</span></h1>
        </div>
      </div>

      <div style={{ padding: '16px 24px' }}>
        <button
          onClick={() => onSelectContact('broadcast')}
          style={{ width: '100%', padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer', backgroundColor: selectedId === 'broadcast' ? '#1a3a3a' : '#f8fafb', color: selectedId === 'broadcast' ? 'white' : '#1a3a3a', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: selectedId === 'broadcast' ? '#0ABAB5' : '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📣</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: '800' }}>Difusión General</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>A todos</div>
          </div>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {contacts.map((contact) => {
            const isOnline = onlineIds.has(contact.id);
            const isSelected = selectedId === contact.id;
            return (
              <button
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                style={{ width: '100%', padding: '12px', borderRadius: '16px', border: 'none', cursor: 'pointer', backgroundColor: isSelected ? '#f0f7f7' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#eef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', border: isSelected ? '2px solid #0ABAB5' : '2px solid transparent' }}>
                    {(contact.display_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white', backgroundColor: isOnline ? '#22c55e' : '#cbd5e1' }} />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1A3A3A' }}>{contact.display_name}</div>
                  <div style={{ fontSize: '11px', color: isOnline ? '#22c55e' : '#94a3b8' }}>{isOnline ? 'Conectado' : 'Desconectado'}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '20px 24px', borderTop: '1px solid #f8fafb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#0ABAB5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>
            {(currentUser.display_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800' }}>{currentUser.display_name}</div>
            <div style={{ fontSize: '11px', color: '#22c55e' }}>● En línea (Tú)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
