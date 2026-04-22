import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MoreVertical, FileText, Image as ImageIcon, MoreHorizontal, X, RefreshCcw } from 'lucide-react';
import { notifyNewMessage } from '../../lib/notifications';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_broadcast?: boolean;
  recipient_id?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
}

interface ChatWindowProps {
  currentUser: any;
  target: any | 'broadcast';
  onlineIds: string[]; // Añadido para saber el estado real
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, target, onlineIds }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBroadcast = target === 'broadcast';
  const targetName = isBroadcast ? 'Difusión General' : target?.display_name ?? '';
  const targetId = isBroadcast ? null : (target?.id || target?.username || null);
  const isOnline = !isBroadcast && Array.isArray(onlineIds) && (onlineIds.includes(target?.id) || onlineIds.includes(target?.username));
  
  const quickReplies = (currentUser?.quick_replies && Array.isArray(currentUser.quick_replies) && currentUser.quick_replies.length > 0) 
    ? currentUser.quick_replies 
    : ['Siguiente paciente', 'Paciente en sala', 'Faltan insumos', 'Demora de 10 min'];

  useEffect(() => {
    setMessages([]);
    fetchMessages();
    markAsRead();

    const channel = supabase
      .channel('public_messages_v10')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as Message;
          const isRelevant = isBroadcast
            ? msg.is_broadcast
            : (!msg.is_broadcast && (
                (
                  (msg.sender_id === target?.id || msg.sender_id === target?.username) &&
                  (msg.recipient_id === currentUser.id || msg.recipient_id === currentUser.username)
                ) ||
                (
                  (msg.sender_id === currentUser.id || msg.sender_id === currentUser.username) &&
                  (msg.recipient_id === target?.id || msg.recipient_id === target?.username)
                )
              ));

          if (isRelevant) {
            setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
            if (msg.sender_id !== currentUser.id && msg.sender_id !== currentUser.username) {
              markAsRead();
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [targetId, isBroadcast, currentUser.id]);

  const markAsRead = async () => {
    if (!currentUser.id) return;

    if (isBroadcast) {
      // Para difusión, marcamos todos los mensajes de difusión como leídos
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('is_broadcast', true)
        .is('read_at', null);
    } else if (targetId) {
      // Para chats privados, marcamos los mensajes de ese contacto
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .or(`sender_id.eq.${targetId},sender_id.eq.${target?.username}`)
        .or(`recipient_id.eq.${currentUser.id},recipient_id.eq.${currentUser.username}`)
        .is('read_at', null);
    }
  };

  const fetchMessages = async () => {
    let query = supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (isBroadcast) {
      query = query.eq('is_broadcast', true);
    } else if (target?.id || target?.username) {
      const uId = currentUser.id;
      const uName = currentUser.username;
      const tId = target?.id;
      const tName = target?.username;
      
      const conditions = [];
      if (uId && tId) conditions.push(`and(sender_id.eq.${uId},recipient_id.eq.${tId})`, `and(sender_id.eq.${tId},recipient_id.eq.${uId})`);
      if (uId && tName) conditions.push(`and(sender_id.eq.${uId},recipient_id.eq.${tName})`, `and(sender_id.eq.${tName},recipient_id.eq.${uId})`);
      if (uName && tId) conditions.push(`and(sender_id.eq.${uName},recipient_id.eq.${tId})`, `and(sender_id.eq.${tId},recipient_id.eq.${uName})`);
      if (uName && tName) conditions.push(`and(sender_id.eq.${uName},recipient_id.eq.${tName})`, `and(sender_id.eq.${tName},recipient_id.eq.${uName})`);
      
      query = query.or(conditions.join(','));
    }
    const { data, error } = await query;
    if (!error) setMessages(data || []);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (content: string, fileData?: { url: string, name: string, type: string }) => {
    if (!content.trim() && !fileData) return;
    const messageContent = content.trim();
    setInputValue('');

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUser.id, // Usar ID siempre
      sender_name: currentUser.display_name,
      recipient_id: isBroadcast ? null : targetId,
      content: messageContent || `Envió un archivo: ${fileData?.name}`,
      is_broadcast: isBroadcast,
      file_url: fileData?.url,
      file_name: fileData?.name,
      file_type: fileData?.type
    });

    if (error) toast.error('Error al enviar mensaje');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Límite de 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande (máximo 10MB)');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          throw new Error('El contenedor de archivos "chat-attachments" no existe en Supabase.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      await sendMessage('', {
        url: publicUrl,
        name: file.name,
        type: file.type
      });

      toast.success('Archivo enviado correctamente');
    } catch (error: any) {
      console.error('Error al subir archivo:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(inputValue); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); } };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f0f4f5', overflow: 'hidden', minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '70px', minHeight: '70px', backgroundColor: 'white', borderBottom: '1px solid #e8eef0', flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '17px', color: '#1A3A3A' }}>{isBroadcast ? 'Difusión General' : targetName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline || isBroadcast ? '#22c55e' : '#94a3b8', display: 'inline-block' }}></span>
            <span style={{ fontSize: '12px', color: isOnline || isBroadcast ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>
              {isBroadcast ? 'Todos los consultorios' : (isOnline ? 'En línea' : 'Desconectado')}
            </span>
          </div>
        </div>
        <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          <MoreVertical size={20} />
        </button>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser.id || msg.sender_id === currentUser.username;
          const isImage = msg.file_type?.startsWith('image/');
          const time = new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '10px' }}>
              {!isMe && (
                <div style={{ width: '34px', height: '34px', borderRadius: '12px', backgroundColor: '#e0f7f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', color: '#0ABAB5', flexShrink: 0, border: '1.5px solid #c8eeec' }}>
                  {(msg.sender_name || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                <div style={{ padding: msg.file_url && isImage ? '8px' : '12px 16px', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', backgroundColor: isMe ? '#0ABAB5' : 'white', color: isMe ? 'white' : '#1A3A3A', fontSize: '14px', fontWeight: 500, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  {msg.file_url ? (isImage ? <img src={msg.file_url} alt="adjunto" style={{ maxWidth: '100%', borderRadius: '12px', display: 'block', cursor: 'pointer' }} onClick={() => window.open(msg.file_url, '_blank')} /> : <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px' }}><div style={{ padding: '10px', borderRadius: '10px', backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : '#f0f7f7' }}><FileText size={24} /></div><div style={{ overflow: 'hidden' }}><p style={{ margin: 0, fontSize: '13px', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{msg.file_name}</p><a href={msg.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: isMe ? 'rgba(255,255,255,0.8)' : '#0ABAB5', textDecoration: 'none', fontWeight: '800' }}>Descargar archivo</a></div></div>) : msg.content}
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontWeight: '700' }}>{time}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '10px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap', backgroundColor: 'transparent' }}>
        {quickReplies.map((reply) => (
          <button key={reply} onClick={() => sendMessage(reply)} style={{ padding: '8px 16px', borderRadius: '12px', border: '1.5px solid #d1d5db', backgroundColor: 'white', color: '#374151', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#0ABAB5'; e.currentTarget.style.color = '#0ABAB5'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; }}>{reply}</button>
        ))}
      </div>

      <div style={{ backgroundColor: 'white', padding: '15px 24px 25px', borderTop: '1px solid #e8eef0' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafb', borderRadius: '18px', padding: '6px 6px 6px 16px', border: '1.5px solid #eef2f2' }}>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isUploading ? '#0ABAB5' : '#94a3b8', padding: '8px' }}>
            {isUploading ? <RefreshCcw size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Paperclip size={20} />}
          </button>
          <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={isUploading ? "Subiendo archivo..." : "Escribe un mensaje..."} style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '14px', color: '#1A3A3A', fontWeight: '600' }} />
          <button type="submit" disabled={!inputValue.trim() || isUploading} style={{ width: '45px', height: '45px', borderRadius: '14px', border: 'none', backgroundColor: (inputValue.trim() && !isUploading) ? '#0ABAB5' : '#eef2f2', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={18} /></button>
        </form>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>

  );
};
