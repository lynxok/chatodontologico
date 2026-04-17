import React, { useState } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';

interface ChatModuleProps {
  currentUser: any;
  onlineIds: string[]; // Cambiado de Set a Array para coincidir con App.tsx
}

export const ChatModule: React.FC<ChatModuleProps> = ({ currentUser, onlineIds }) => {
  const [selectedTarget, setSelectedTarget] = useState<any | 'broadcast'>(
    currentUser?.role === 'secretary' ? 'broadcast' : null
  );

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
