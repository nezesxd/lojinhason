import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Trash2, Tag, Plus, ShieldAlert, MessageCircle, ChevronLeft, Send, CheckCircle, ShieldCheck, Award } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../firebase';

export default function Admin({ ads = [], categories = [], user, userData }) {
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [supportMessages, setSupportMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const bottomRef = useRef(null);

  const totalValue = ads.reduce((acc, curr) => acc + Number(curr.price || 0), 0);

  useEffect(() => {
    if (userData?.isAdmin !== true) return;
    const qSup = query(collection(db, 'suporte'), orderBy('createdAt', 'asc'));
    const unSup = onSnapshot(qSup, (snapshot) => {
      setSupportMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    
    const unUsers = onSnapshot(collection(db, 'users'), (snap) => setAllUsers(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    
    return () => { unSup(); unUsers(); };
  }, [userData]);

  const chatsAgrupados = {};
  supportMessages.forEach(msg => {
    if (!chatsAgrupados[msg.chatId]) {
      chatsAgrupados[msg.chatId] = { chatId: msg.chatId, userName: msg.isAdminReply ? 'Cliente' : msg.senderName, lastMessage: msg.text, updatedAt: msg.createdAt, messages: [] };
    }
    chatsAgrupados[msg.chatId].messages.push(msg);
    chatsAgrupados[msg.chatId].lastMessage = msg.text;
    chatsAgrupados[msg.chatId].updatedAt = msg.createdAt;
    if (!msg.isAdminReply) chatsAgrupados[msg.chatId].userName = msg.senderName;
  });
  const listaChats = Object.values(chatsAgrupados).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if(!newCategory) return;
    await addDoc(collection(db, 'categorias'), { name: newCategory });
    setNewCategory(''); toast.success("Categoria adicionada");
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedChat) return;
    await addDoc(collection(db, 'suporte'), { chatId: selectedChat, senderId: user.uid, senderName: 'Suporte Admin', text: adminReply, isAdminReply: true, createdAt: new Date().toISOString() });
    setAdminReply('');
  };

  const toggleVerifyUser = async (userId, currentStatus) => {
    await updateDoc(doc(db, 'users', userId), { isVerified: !currentStatus });
    toast.success(!currentStatus ? "Vendedor Verificado!" : "Verificação Removida");
  };

  const toggleFeaturedAd = async (adId, currentStatus) => {
    await updateDoc(doc(db, 'anuncios', adId), { isFeatured: !currentStatus });
    toast.success(!currentStatus ? "Anúncio Destacado!" : "Destaque Removido");
  };

  if (!user || userData?.isAdmin !== true) return <div className="py-20 text-center"><ShieldAlert className="w-16 h-16 text-red-300 mx-auto mb-4" /><h2 className="text-xl font-bold">Acesso Negado</h2></div>;

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto hide-scrollbar">
        <button onClick={() => setActiveTab('dashboard')} className={`flex-1 min-w-[120px] py-2.5 font-bold rounded-xl text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Dashboard</button>
        <button onClick={() => setActiveTab('suporte')} className={`flex-1 min-w-[120px] py-2.5 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'suporte' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><MessageCircle className="w-4 h-4" /> Chats ({listaChats.length})</button>
        <button onClick={() => setActiveTab('usuarios')} className={`flex-1 min-w-[120px] py-2.5 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'usuarios' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><CheckCircle className="w-4 h-4" /> Vendedores</button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100"><p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Anúncios Ativos</p><p className="text-3xl font-black text-indigo-600 mt-1">{ads.length}</p></div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100"><p className="text-xs text-gray-500 uppercase font-bold tracking-wider">GMV Estimado</p><p className="text-3xl font-black text-green-500 mt-1">R$ {totalValue.toFixed(0)}</p></div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Gestão de Anúncios</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {ads.map(ad => (
                <div key={ad.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={ad.image} className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                    <div>
                      <p className="font-bold text-sm text-gray-900 line-clamp-1 flex items-center gap-2">
                        {ad.title} {ad.isFeatured && <Award className="w-4 h-4 text-yellow-500" />}
                      </p>
                      <p className="text-xs text-gray-500">R$ {Number(ad.price).toFixed(2)} • {ad.sellerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFeaturedAd(ad.id, ad.isFeatured)} className={`p-2 rounded-xl transition-colors ${ad.isFeatured ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600'}`} title="Destacar">
                      <Award className="w-5 h-5" />
                    </button>
                    <button onClick={() => { if(window.confirm("Apagar anúncio?")) deleteDoc(doc(db, 'anuncios', ad.id)) }} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-indigo-500"/> Categorias de Produto</h2>
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
              <input type="text" value={newCategory} onChange={e=>setNewCategory(e.target.value)} placeholder="Nova categoria..." className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" className="px-5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"><Plus className="w-5 h-5"/></button>
            </form>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                  <span className="font-bold text-sm text-gray-700">{cat.name}</span>
                  <button onClick={()=>{ if(window.confirm("Apagar?")) deleteDoc(doc(db, 'categorias', cat.id)); }} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
          <div className="p-5 border-b border-gray-100 bg-gray-50"><h2 className="text-lg font-bold text-gray-900">Verificação de Vendedores</h2><p className="text-sm text-gray-500">Aprove vendedores para receberem o selo oficial.</p></div>
          <div className="divide-y divide-gray-100">
            {allUsers.map(u => (
              <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={u.photoUrl || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  <div>
                    <p className="font-bold text-sm text-gray-900 flex items-center gap-1">{u.fullName} {u.isVerified && <ShieldCheck className="w-4 h-4 text-green-500"/>}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <button onClick={() => toggleVerifyUser(u.id, u.isVerified)} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${u.isVerified ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                  {u.isVerified ? 'Remover Selo' : 'Aprovar Selo'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'suporte' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col animate-in fade-in">
          {!selectedChat ? (
            <>
              <div className="p-5 border-b border-gray-100 bg-gray-50"><h2 className="text-lg font-bold">Caixa de Entrada</h2></div>
              <div className="flex-1 overflow-y-auto hide-scrollbar divide-y divide-gray-50">
                {listaChats.length === 0 ? <p className="p-10 text-center text-gray-400">Tudo tranquilo por aqui.</p> : listaChats.map(chat => (
                  <div key={chat.chatId} onClick={() => setSelectedChat(chat.chatId)} className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4 transition-colors">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 font-bold rounded-full flex items-center justify-center text-lg">{chat.userName.charAt(0).toUpperCase()}</div>
                    <div className="flex-1 overflow-hidden"><h4 className="font-bold text-gray-900">{chat.userName}</h4><p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full bg-gray-50">
              <div className="bg-white p-4 flex items-center gap-3 border-b border-gray-100 shadow-sm z-10">
                <button onClick={() => setSelectedChat(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"><ChevronLeft className="w-5 h-5"/></button>
                <h3 className="font-bold text-gray-900">{chatsAgrupados[selectedChat]?.userName || 'Cliente'}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 hide-scrollbar">
                {chatsAgrupados[selectedChat]?.messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.isAdminReply ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.isAdminReply ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>{msg.text}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input type="text" placeholder="Escreva a resposta..." value={adminReply} onChange={e => setAdminReply(e.target.value)} className="flex-1 px-4 py-3 bg-gray-100 focus:bg-white focus:border-indigo-500 border border-transparent rounded-xl outline-none transition-colors" />
                  <button type="submit" disabled={!adminReply.trim()} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"><Send className="w-5 h-5"/></button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
