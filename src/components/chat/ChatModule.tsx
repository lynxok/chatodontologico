import React, { useState, useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { supabase } from '../../lib/supabase';
import { notifyNewMessage } from '../../lib/notifications';

interface ChatModuleProps {
  currentUser: any;
  onlineIds: string[]; // Cambiado de Set a Array para coincidir con App.tsx
}

export const ChatModule: React.FC<ChatModuleProps> = ({ currentUser, onlineIds }) => {
  const [selectedTarget, setSelectedTarget] = useState<any | 'broadcast'>(
    currentUser?.role === 'secretary' ? 'broadcast' : null
  );

  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase
      .channel('global_notifications_v1')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new;
          
          // Verificar si el mensaje es para mí (ID, username o broadcast)
          const isForMe = msg.recipient_id === currentUser.id || 
                          msg.recipient_id === currentUser.username || 
                          msg.is_broadcast;
          
          // No notificar si soy el remitente
          const isFromMe = msg.sender_id === currentUser.id || 
                           msg.sender_id === currentUser.username;

          if (isForMe && !isFromMe) {
            const notificationTitle = msg.is_broadcast 
              ? `📢 DIFUSIÓN de ${msg.sender_name}` 
              : msg.sender_name;
            
            notifyNewMessage(notificationTitle, msg.content, currentUser.notification_tone || 'media');
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id, currentUser?.username, currentUser?.notification_tone]);

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden', backgroundColor: '#f0f4f5' }}>
      <ChatSidebar
        currentUser={currentUser}
        onSelectTarget={setSelectedTarget} // Nombre corregido para coincidir con ChatSidebar.tsx
        selectedTarget={selectedTarget}     // Nombre corregido
        onlineIds={onlineIds}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedTarget ? (
          <ChatWindow 
            key={selectedTarget === 'broadcast' ? 'broadcast' : selectedTarget.id} 
            currentUser={currentUser} 
            target={selectedTarget} 
            onlineIds={onlineIds}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '12px' }}>
            <div style={{ fontSize: '48px' }}>💬</div>
            <p style={{ fontSize: '15px', fontWeight: 600 }}>Seleccione un contacto para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
};
