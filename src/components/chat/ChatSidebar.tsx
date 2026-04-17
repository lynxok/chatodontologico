import React, { useEffect, useState } from 'react';
import { User, Users, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Contact {
  id: string;
  username: string;
  display_name: string;
  role: string;
  isOnline: boolean;
  avatar_url?: string;
}

interface ChatSidebarProps {
  currentUser: any;
  onSelectContact: (contact: Contact | 'broadcast') => void;
  selectedId: string | 'broadcast';
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ currentUser, onSelectContact, selectedId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('username', currentUser.username);

      if (!error) {
        setContacts(data.map(d => ({
          id: d.id,
          username: d.username,
          display_name: d.display_name,
          role: d.role,
          isOnline: true, // Simulation for now
          avatar_url: d.avatar_url
        })));
      }
      setLoading(false);
    };

    fetchContacts();
  }, [currentUser.username]);

  return (
    <div className="w-80 h-full border-r glass-panel flex flex-col">
      <div className="p-4 border-b space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-50" size={18} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="premium-input pl-10 py-2 text-sm"
          />
        </div>

        {currentUser.role === 'secretary' && (
          <button
            onClick={() => onSelectContact('broadcast')}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${
              selectedId === 'broadcast' 
                ? 'bg-tiffany-green text-white shadow-lg' 
                : 'bg-white hover:bg-tiffany-soft border border-medical-gray'
            }`}
          >
            <Users size={20} />
            <span className="ml-3 font-semibold">Difundir a Todos</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-text-secondary opacity-50 font-bold mb-2">
          Contactos
        </p>
        
        {loading ? (
          <div className="py-8 text-center text-xs text-text-secondary">Cargando contactos...</div>
        ) : (
          contacts.map((contact) => (
            <button
              key={contact.username}
              onClick={() => onSelectContact(contact)}
              className={`w-full flex items-center p-3 rounded-xl transition-all group ${
                selectedId === contact.id || selectedId === contact.username
                  ? 'bg-tiffany-soft border-l-4 border-tiffany-green' 
                  : 'hover:bg-white'
              }`}
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-medical-gray flex items-center justify-center text-tiffany-green overflow-hidden">
                  {contact.avatar_url ? (
                    <img src={contact.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                {contact.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div className="ml-4 text-left">
                <p className={`font-semibold text-sm ${selectedId === contact.id ? 'text-tiffany-green' : 'text-text-primary'}`}>
                  {contact.display_name}
                </p>
                <p className="text-[10px] text-text-secondary opacity-70 truncate px-2 py-0.5 rounded-full bg-medical-gray/50 inline-block mt-1">
                  {contact.role === 'secretary' ? 'RECEPCIÓN' : 'CONSULTORIO'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
