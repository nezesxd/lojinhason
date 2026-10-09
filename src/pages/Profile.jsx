import React, { useState } from 'react';
import { Camera, Plus, Trash2, Power, Loader2, UserCircle, Edit2, Save, X, MessageCircle, Heart, Eye } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import { db } from '../firebase';

export default function Profile({ ads = [], user, userData, categories = [], onOpenAuth, onOpenSupport, onOpenAd }) {
  const [activeTab, setActiveTab] = useState('meus');
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const IMGBB_API_KEY = "b3a0993c8e5f41e0a238d872a31f03d7";

  if (!user || !userData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <UserCircle className="w-20 h-20 text-indigo-200 mb-4" />
        <h2 className="text-2xl font-black text-gray-800 mb-2">Acesse sua conta</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Para anunciar produtos, guardar favoritos e aceder ao suporte, precisa estar logado.</p>
        <button onClick={onOpenAuth} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-95">Fazer Login ou Cadastro</button>
      </div>
    );
  }

  const compressImage = async (file) => {
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true };
    try { return await imageCompression(file, options); } 
    catch (error) { toast.error("Erro ao otimizar imagem."); return file; }
  };

  const handleOpenEditProfile = () => {
    setEditName(userData.fullName || ''); setEditPhone(userData.phone || ''); setEditAddress(userData.address || ''); setEditPhotoFile(null); setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!editName || !editPhone || !editAddress) return toast.error("Preencha todos os campos!");
    setIsUpdatingProfile(true);
    const toastId = toast.loading("Atualizando perfil...");
    
    try {
      let newPhotoUrl = userData.photoUrl;
      if (editPhotoFile) {
        if (IMGBB_API_KEY === "SUA_CHAVE_IMGBB_AQUI") throw new Error("Chave ImgBB ausente.");
        const compressed = await compressImage(editPhotoFile);
        const formData = new FormData(); formData.append('image', compressed);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
        const data = await response.json();
        if (data.success) newPhotoUrl = data.data.url;
        else throw new Error("Falha no upload da imagem.");
      }
      await updateDoc(doc(db, 'users', user.uid), { fullName: editName, phone: editPhone, address: editAddress, photoUrl: newPhotoUrl });
      toast.success("Perfil atualizado com sucesso!", { id: toastId });
      setIsEditingProfile(false);
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally { setIsUpdatingProfile(false); }
  };

  const handleSubmitAd = async (e) => {
    e.preventDefault();
    if(!title || !price || !category || !imageFile || !description) return toast.error("Preencha tudo e selecione foto!");
    setIsUploading(true);
    const toastId = toast.loading("A publicar anúncio...");
    try {
      if (IMGBB_API_KEY === "SUA_CHAVE_IMGBB_AQUI") throw new Error("Chave ImgBB ausente.");
      const compressed = await compressImage(imageFile);
      const formData = new FormData(); formData.append('image', compressed);
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
      const data = await response.json();
      if (data.success) {
        await addDoc(collection(db, 'anuncios'), {
          title, description, price: parseFloat(price), category, location: userData.address, status: 'ativo', image: data.data.url, sellerId: user.uid, sellerName: userData.fullName, sellerPhone: userData.phone, sellerPhoto: userData.photoUrl, createdAt: new Date().toISOString(), likes: [], views: 0, isFeatured: false
        });
        toast.success("Anúncio publicado!", { id: toastId });
        setTitle(''); setPrice(''); setDescription(''); setCategory(''); setImageFile(null); setActiveTab('meus');
      } else throw new Error("Falha no upload.");
    } catch (error) { toast.error(error.message, { id: toastId }); } 
    finally { setIsUploading(false); }
  };

  const myAds = ads.filter(a => a.sellerId === user.uid);
  const favoriteAds = ads.filter(a => a.likes?.includes(user.uid));

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 mt-8">
          
          <div className="relative group flex-shrink-0">
            {userData.photoUrl ? (
              <img src={userData.photoUrl} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg bg-white" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-indigo-50 border-4 border-white shadow-lg flex items-center justify-center text-indigo-300"><UserCircle className="w-14 h-14" /></div>
            )}
          </div>
          
          {isEditingProfile ? (
            <div className="w-full flex-1 bg-gray-50/50 p-5 rounded-3xl border border-gray-100 animate-in fade-in duration-300">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Edit2 className="w-5 h-5 text-indigo-500" /> Editar Perfil</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"><Camera className="w-5 h-5" /></div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-gray-700">Alterar Fotografia</p>
                    <p className="text-xs text-gray-500 truncate">{editPhotoFile ? editPhotoFile.name : 'Nenhuma imagem selecionada'}</p>
                  </div>
                  <input type="file" accept="image/*" onChange={e => setEditPhotoFile(e.target.files[0])} className="hidden" />
                </label>
                <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Nome Completo" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                <input type="tel" value={editPhone} onChange={e=>setEditPhone(e.target.value)} placeholder="WhatsApp" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                <textarea rows="2" value={editAddress} onChange={e=>setEditAddress(e.target.value)} placeholder="Endereço Completo" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all" />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button onClick={handleSaveProfile} disabled={isUpdatingProfile} className="flex-[2] py-3.5 bg-indigo-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all">
                    {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-5 h-5" /> Guardar Alterações</>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center sm:text-left flex-1 w-full animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-gray-900 text-2xl">{userData.fullName}</h3>
                  <p className="text-sm font-medium text-gray-500">{user.email}</p>
                </div>
                <button onClick={handleOpenEditProfile} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"><Edit2 className="w-4 h-4" /> Editar</button>
              </div>
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">📞 {userData.phone}</span>
                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 truncate max-w-[200px]">📍 {userData.address.split(',')[0]}</span>
              </div>
              <button onClick={onOpenSupport} className="mt-5 w-full sm:w-auto px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors border border-indigo-100"><MessageCircle className="w-5 h-5" /> Falar com Suporte</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto hide-scrollbar sticky top-16 z-30">
        <button onClick={() => setActiveTab('meus')} className={`flex-1 min-w-[120px] py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'meus' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Meus Anúncios</button>
        <button onClick={() => setActiveTab('favoritos')} className={`flex-1 min-w-[120px] py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'favoritos' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><Heart className="w-4 h-4" /> Favoritos</button>
        <button onClick={() => setActiveTab('novo')} className={`flex-1 min-w-[120px] py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'novo' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><Plus className="w-4 h-4" /> Publicar</button>
      </div>

      {activeTab === 'novo' && (
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-black text-gray-800 mb-6">Criar Novo Anúncio</h2>
          <form onSubmit={handleSubmitAd} className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-indigo-200 border-dashed rounded-2xl cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 transition-colors group">
              {imageFile ? <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-contain p-2" /> : <div className="flex flex-col items-center text-indigo-500 group-hover:scale-110 transition-transform"><Camera className="w-10 h-10 mb-2" /><span className="text-sm font-bold">Toque para adicionar foto</span><span className="text-xs opacity-70 font-medium mt-1">Imagens serão otimizadas automaticamente</span></div>}
              <input type="file" className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
            </label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título do Produto" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none" required />
            <textarea rows="4" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Descrição detalhada..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none" required />
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Preço (R$)" className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none" required />
              <select value={category} onChange={e=>setCategory(e.target.value)} className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none" required>
                <option value="">Selecione a Categoria</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={isUploading} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl flex justify-center text-lg shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all">{isUploading ? <Loader2 className="w-6 h-6 animate-spin"/> : 'Publicar Anúncio'}</button>
          </form>
        </div>
      )}

      {activeTab === 'meus' && (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in">
          <h2 className="text-xl font-black text-gray-800 mb-6">Meus Anúncios ({myAds.length})</h2>
          {myAds.length === 0 ? (
            <p className="text-center py-10 text-gray-400 font-medium bg-gray-50 rounded-2xl">Não tem nenhum anúncio ativo.</p>
          ) : (
            <div className="space-y-4">
              {myAds.map((ad) => (
                <div key={ad.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${ad.status === 'ativo' ? 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md' : 'border-gray-100 bg-gray-50 opacity-60 grayscale'}`}>
                  <img src={ad.image} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 line-clamp-1">{ad.title}</h4>
                    <p className="text-indigo-600 font-black">R$ {Number(ad.price).toFixed(2)}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${ad.status==='ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{ad.status}</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-gray-400"><Eye className="w-3.5 h-3.5"/> {ad.views || 0}</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-gray-400"><Heart className="w-3.5 h-3.5"/> {ad.likes?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { updateDoc(doc(db, 'anuncios', ad.id), { status: ad.status === 'ativo' ? 'vendido' : 'ativo' }); toast.success(ad.status === 'ativo' ? 'Marcado como vendido' : 'Reativado'); }} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"><Power className="w-5 h-5 text-gray-700" /></button>
                    <button onClick={() => { if(window.confirm("Apagar anúncio?")) { deleteDoc(doc(db, 'anuncios', ad.id)); toast.success("Apagado"); } }} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'favoritos' && (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in">
          <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2"><Heart className="w-6 h-6 text-red-500 fill-red-500" /> Favoritos Guardados</h2>
          {favoriteAds.length === 0 ? (
            <p className="text-center py-10 text-gray-400 font-medium bg-gray-50 rounded-2xl">Ainda não guardou nenhum anúncio.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {favoriteAds.map((ad) => (
                <div key={ad.id} onClick={() => onOpenAd && onOpenAd(ad)} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col hover:shadow-md cursor-pointer transition-transform active:scale-95 group relative">
                  <div className="absolute top-4 right-4 z-10 p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm"><Heart className="w-4 h-4 text-red-500 fill-red-500" /></div>
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-100 mb-3"><img src={ad.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1">{ad.title}</h3>
                  <p className="text-lg font-black text-indigo-600 mt-auto">R$ {Number(ad.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
