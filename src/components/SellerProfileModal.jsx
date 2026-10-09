import React, { useEffect, useState } from 'react';
import { X, MapPin, Package, User, ShieldCheck, Calendar, Loader2, Star, Send } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, addDoc, onSnapshot, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../firebase';

export default function SellerProfileModal({ sellerId, onClose, onOpenAd, user, userData, onOpenAuth }) {
  const [seller, setSeller] = useState(null);
  const [sellerAds, setSellerAds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!sellerId) return;
    const fetchSellerData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', sellerId));
        if (userDoc.exists()) setSeller(userDoc.data());

        const qAds = query(collection(db, 'anuncios'), where('sellerId', '==', sellerId), where('status', '==', 'ativo'));
        const querySnapshot = await getDocs(qAds);
        const adsData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        adsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSellerAds(adsData);
      } catch (error) { toast.error("Erro ao carregar perfil."); } 
      finally { setLoading(false); }
    };
    fetchSellerData();

    const qRev = query(collection(db, 'avaliacoes'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));
    const unsubRev = onSnapshot(qRev, (snap) => setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsubRev();
  }, [sellerId]);

  if (!sellerId) return null;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { onClose(); return onOpenAuth(); }
    if (user.uid === sellerId) return toast.error("Não pode avaliar-se a si mesmo.");
    if (!newReviewText.trim()) return toast.error("Escreva um comentário.");
    
    const toastId = toast.loading("Enviando avaliação...");
    try {
      await addDoc(collection(db, 'avaliacoes'), {
        sellerId, reviewerId: user.uid, reviewerName: userData.fullName, reviewerPhoto: userData.photoUrl, rating: newRating, text: newReviewText, createdAt: new Date().toISOString()
      });
      toast.success("Avaliação enviada!", { id: toastId });
      setNewReviewText(''); setNewRating(5);
    } catch (error) { toast.error("Erro ao avaliar.", { id: toastId }); }
  };

  const dataAdesao = seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Data desconhecida';
  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center sm:p-6 transition-all duration-300" style={{ zIndex: 9999999 }}>
      <div className="bg-white w-full sm:max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col relative sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
        
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-end p-4">
          <button onClick={onClose} className="w-10 h-10 bg-white/80 backdrop-blur-md text-gray-800 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 active:scale-90 transition-all border border-gray-200"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" /><p className="text-gray-500 font-medium">A carregar perfil...</p></div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row overflow-y-auto hide-scrollbar">
            
            <div className="w-full sm:w-1/3 bg-gray-50 flex-shrink-0 border-r border-gray-100">
              <div className="w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative"></div>
              <div className="px-6 pb-6 relative flex flex-col items-center text-center">
                <div className="-mt-16 mb-4 relative z-10">
                  {seller?.photoUrl ? (
                    <img src={seller.photoUrl} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-indigo-50 border-4 border-white shadow-md flex items-center justify-center"><User className="w-12 h-12 text-indigo-300" /></div>
                  )}
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-1 flex items-center justify-center gap-2">
                  {seller?.fullName || 'Utilizador Desconhecido'} {seller?.isVerified && <ShieldCheck className="w-5 h-5 text-green-500" />}
                </h1>
                
                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold mt-2 border border-yellow-100">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {averageRating > 0 ? `${averageRating} (${reviews.length} avaliações)` : 'Novo vendedor'}
                </div>

                <div className="w-full mt-6 space-y-3 text-sm text-gray-600 text-left bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-400 uppercase font-bold">Adesão</p><p className="font-medium capitalize">{dataAdesao}</p></div></div>
                  {seller?.address && <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-400 uppercase font-bold">Localização</p><p className="font-medium line-clamp-2">{seller.address}</p></div></div>}
                </div>
              </div>
            </div>

            <div className="w-full sm:w-2/3 p-6 sm:p-8 bg-white flex flex-col gap-8">
              
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2"><Package className="w-6 h-6 text-indigo-500" /> Vitrine ({sellerAds.length})</h2>
                {sellerAds.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">Este vendedor não possui anúncios ativos.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {sellerAds.map((ad) => (
                      <div key={ad.id} onClick={() => { onClose(); onOpenAd(ad); }} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col hover:shadow-md cursor-pointer transition-transform active:scale-95 group">
                        <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-100 mb-3 relative"><img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                        <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">{ad.title}</h3>
                        <p className="text-lg font-black text-indigo-600 mt-auto pt-2">R$ {Number(ad.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              <div>
                <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2"><Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /> Avaliações</h2>
                
                <form onSubmit={handleSubmitReview} className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    {[1,2,3,4,5].map(star => (
                      <button type="button" key={star} onClick={() => setNewRating(star)} className="focus:outline-none transition-transform active:scale-90">
                        <Star className={`w-7 h-7 ${star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder={user ? "Como foi a negociação?" : "Faça login para avaliar"} value={newReviewText} onChange={e=>setNewReviewText(e.target.value)} disabled={!user} className="flex-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button type="submit" disabled={!user || !newReviewText.trim()} className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"><Send className="w-5 h-5"/></button>
                  </div>
                </form>

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhuma avaliação ainda.</p>
                  ) : (
                    reviews.map(rev => (
                      <div key={rev.id} className="flex gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        {rev.reviewerPhoto ? (
                          <img src={rev.reviewerPhoto} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><User className="w-5 h-5 text-gray-400"/></div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 text-sm">{rev.reviewerName}</h4>
                            <div className="flex items-center"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1"/> <span className="text-xs font-bold text-yellow-600">{rev.rating}.0</span></div>
                          </div>
                          <p className="text-gray-600 text-sm">{rev.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
