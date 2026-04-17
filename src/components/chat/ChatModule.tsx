import React, { useState } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';

interface ChatModuleProps {
  currentUser: any;
}

export const ChatModule: React.FC<ChatModuleProps> = ({ currentUser }) => {
  const [selectedContact, setSelectedContact] = useState<any | 'broadcast'>('broadcast');

  // If user is not secretary, default to broadcast or specific search
  useState(() => {
    if (currentUser.role !== 'secretary') {
      // For consultants, start with broadcast or we could fetch the secretary profile
      // But 'broadcast' is safest for now
      setSelectedContact('broadcast');
    }
  });

  return (
    <div className="flex-1 flex overflow-hidden bg-medical-white">
      <ChatSidebar 
        currentUser={currentUser} 
        onSelectContact={setSelectedContact} 
        selectedId={typeof selectedContact === 'string' ? selectedContact : selectedContact.id}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedContact ? (
          <ChatWindow currentUser={currentUser} target={selectedContact} />
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-50">
            <p>Seleccione un chat para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
};
