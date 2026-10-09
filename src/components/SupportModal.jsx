import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, ShieldCheck } from 'lucide-react';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function SupportModal({ user, userData, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'suporte'), where('chatId', '==', user.uid), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    await addDoc(collection(db, 'suporte'), {
      chatId: user.uid,
      senderId: user.uid,
      senderName: userData?.fullName || 'Utilizador',
      text: newMessage,
      isAdminReply: false,
      createdAt: new Date().toISOString()
    });
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center sm:p-6 transition-all duration-300" style={{ zIndex: 999999 }}>
      <div className="bg-white w-full sm:max-w-md h-[85vh] sm:h-[600px] flex flex-col relative sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        
        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Suporte Oficial</h2>
              <p className="text-indigo-200 text-xs font-medium">Respondemos o mais rápido possível</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 hide-scrollbar">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <MessageCircle className="w-12 h-12 mb-2" />
              <p className="text-sm font-medium">Envie a sua dúvida ou problema.<br/>Um administrador irá ajudá-lo.</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = !msg.isAdminReply;
            return (
              <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                {!isMe && <span className="text-[10px] text-gray-400 font-bold ml-1 mb-0.5">Equipa de Suporte</span>}
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex gap-2">
            <input type="text" placeholder="Escreva a sua mensagem..." value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 px-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 border rounded-xl outline-none transition-colors" />
            <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors flex items-center justify-center"><Send className="w-5 h-5" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}
