import React, { useState } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';

interface ChatModuleProps {
  currentUser: any;
  onlineIds: Set<string>;
}

export const ChatModule: React.FC<ChatModuleProps> = ({ currentUser, onlineIds }) => {
  const [selectedContact, setSelectedContact] = useState<any | 'broadcast'>(
    currentUser?.role === 'secretary' ? 'broadcast' : null
  );

  const selectedId =
    selectedContact === 'broadcast'
      ? 'broadcast'
      : selectedContact
      ? (selectedContact.id ?? selectedContact.username ?? '')
      : '';

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden', backgroundColor: '#f0f4f5' }}>
      <ChatSidebar
        currentUser={currentUser}
        onSelectContact={setSelectedContact}
        selectedId={selectedId}
        onlineIds={onlineIds}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedContact ? (
          <ChatWindow currentUser={currentUser} target={selectedContact} />
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
