import React, { useEffect, useState } from 'react';
import { X, MapPin, MessageCircle, User, ShieldCheck, Heart, Send, CornerDownRight, Share2 } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, where, orderBy, onSnapshot, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../firebase';

export default function AdDetailsModal({ ad, onClose, user, userData, onOpenAuth, onOpenSellerProfile }) {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [respondendoA, setRespondendoA] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (ad && (!user || user.uid !== ad.sellerId)) {
      updateDoc(doc(db, 'anuncios', ad.id), { views: increment(1) }).catch(()=>console.log("Not indexed views"));
    }
  }, [ad?.id, user?.uid]);

  useEffect(() => {
    if (!ad) return;
    const q = query(collection(db, 'comentarios'), where('adId', '==', ad.id), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComentarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [ad]);

  if (!ad) return null;

  const isLiked = ad.likes?.includes(user?.uid);
  const totalLikes = ad.likes?.length || 0;

  const handleToggleLike = async () => {
    if (!user) return onOpenAuth();
    const adRef = doc(db, 'anuncios', ad.id);
    await updateDoc(adRef, { likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
  };

  const handleShare = async () => {
    const shareData = { title: ad.title, text: `Veja este anúncio incrível: ${ad.title}`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link do anúncio copiado!");
    }
  };

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!user) return onOpenAuth();
    if (!novoComentario.trim()) return;

    await addDoc(collection(db, 'comentarios'), {
      adId: ad.id, text: novoComentario, authorId: user.uid, authorName: userData?.fullName || 'Utilizador', authorPhoto: userData?.photoUrl || null, parentId: respondendoA?.id || null, createdAt: new Date().toISOString()
    });
    setNovoComentario(''); setRespondendoA(null);
  };

  const phone = (ad.sellerPhone || '').replace(/\D/g, '');
  const wppLink = `https://wa.me/55${phone}?text=Olá! Vi o seu anúncio "${ad.title || 'Produto'}" no Lojinha's On.`;
  const comentariosPrincipais = comentarios.filter(c => !c.parentId);

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center sm:p-6 transition-all duration-300" style={{ zIndex: 999999 }}>
      <div className="bg-white w-full sm:max-w-3xl h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col relative sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
        
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4">
          <div className="px-4 py-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm"><span className="text-xs font-black text-gray-800 uppercase tracking-widest">{ad.category || 'Geral'}</span></div>
          <button onClick={onClose} className="w-10 h-10 bg-white/80 backdrop-blur-md text-gray-800 rounded-full flex items-center justify-center shadow-sm hover:bg-white active:scale-90 transition-all"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto pb-32 hide-scrollbar">
          <div className="w-full sm:p-4">
            <div className="w-full h-[40vh] min-h-[280px] sm:rounded-3xl overflow-hidden bg-gray-100 relative">
              <img src={ad.image || 'https://via.placeholder.com/600'} alt={ad.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

          <div className="px-5 sm:px-10 mt-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">{ad.title}</h1>
            <div className="flex items-center justify-between mb-6">
              <p className="text-3xl sm:text-5xl font-black text-indigo-600 tracking-tighter">R$ {Number(ad.price || 0).toFixed(2)}</p>
              
              <div className="flex items-center gap-2">
                <button onClick={handleShare} className="flex items-center justify-center w-10 h-10 bg-gray-50 text-gray-500 rounded-full font-bold transition-all active:scale-90 hover:bg-gray-100"><Share2 className="w-5 h-5" /></button>
                <button onClick={handleToggleLike} className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all active:scale-90 ${isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-600' : ''}`} />
                  <span>{totalLikes}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-500 mb-6 font-medium"><MapPin className="w-5 h-5 text-gray-400" /><span>{ad.location}</span></div>

            <div className="bg-gray-50/80 rounded-3xl p-6 sm:p-8 mb-8 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Sobre este produto</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap sm:text-lg">{ad.description}</p>
            </div>

            <div className="mb-8 border-t border-gray-100 pt-8">
              <h3 className="font-bold text-gray-900 mb-6 text-xl flex items-center gap-2"><MessageCircle className="w-6 h-6 text-indigo-500" /> Comentários ({comentarios.length})</h3>
              <div className="space-y-5">
                {comentariosPrincipais.length === 0 ? (
                  <p className="text-gray-400 text-center py-4 bg-gray-50 rounded-2xl">Seja o primeiro a comentar!</p>
                ) : (
                  comentariosPrincipais.map(comentario => (
                    <div key={comentario.id} className="space-y-3">
                      <div className="flex gap-3">
                        {comentario.authorPhoto ? (
                          <img src={comentario.authorPhoto} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500"><User className="w-5 h-5"/></div>
                        )}
                        <div className="flex-1">
                          <div className="bg-gray-50 p-3.5 rounded-2xl rounded-tl-none border border-gray-100">
                            <p className="font-bold text-sm text-gray-900">{comentario.authorName}</p>
                            <p className="text-gray-700 text-sm mt-1">{comentario.text}</p>
                          </div>
                          <button onClick={() => setRespondendoA(comentario)} className="text-xs font-bold text-gray-500 hover:text-indigo-600 mt-1 ml-2">Responder</button>
                        </div>
                      </div>
                      {comentarios.filter(c => c.parentId === comentario.id).map(resposta => (
                        <div key={resposta.id} className="flex gap-3 ml-12">
                          <CornerDownRight className="w-4 h-4 text-gray-300 mt-2" />
                          {resposta.authorPhoto ? (
                            <img src={resposta.authorPhoto} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500"><User className="w-4 h-4"/></div>
                          )}
                          <div className="flex-1">
                            <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none border border-gray-100">
                              <p className="font-bold text-xs text-gray-900">{resposta.authorName}</p>
                              <p className="text-gray-700 text-sm mt-0.5">{resposta.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6">
                {respondendoA && (
                  <div className="flex items-center justify-between bg-indigo-50 px-4 py-2 rounded-t-xl border-b border-indigo-100">
                    <span className="text-xs font-medium text-indigo-600">A responder a <b>{respondendoA.authorName}</b></span>
                    <button onClick={() => setRespondendoA(null)} className="text-indigo-400 hover:text-indigo-600"><X className="w-4 h-4"/></button>
                  </div>
                )}
                <form onSubmit={handleEnviarComentario} className="flex gap-2">
                  <input type="text" placeholder={user ? "Escreva um comentário..." : "Faça login para comentar"} value={novoComentario} onChange={(e) => setNovoComentario(e.target.value)} disabled={!user} className={`flex-1 p-3 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none ${respondendoA ? 'rounded-b-xl rounded-t-none' : 'rounded-xl'}`} />
                  <button type="submit" disabled={!user || !novoComentario.trim()} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors"><Send className="w-5 h-5" /></button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 sm:px-8 sm:py-5 z-50">
          <div className="flex items-center justify-between gap-4">
            <div onClick={() => { onClose(); onOpenSellerProfile && onOpenSellerProfile(ad.sellerId); }} className="flex items-center gap-3 cursor-pointer group p-1.5 -ml-1.5 rounded-xl hover:bg-gray-50 transition-colors">
              {ad.sellerPhoto ? (
                <img src={ad.sellerPhoto} className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-indigo-100 transition-all" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-indigo-200 transition-all"><User className="w-6 h-6 text-gray-400"/></div>
              )}
              <div className="hidden sm:block">
                <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{ad.sellerName || 'Vendedor'}</p>
                <div className="flex items-center gap-1 text-green-600 text-xs font-bold mt-0.5">{ad.sellerVerified && <ShieldCheck className="w-3 h-3" />} <span>Verificado</span></div>
              </div>
            </div>
            <a href={wppLink} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-bold active:scale-95 transition-all shadow-lg shadow-indigo-600/30">
              <MessageCircle className="w-5 h-5" /><span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
