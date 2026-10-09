import React, { useState } from 'react';
import { X, Camera, Mail, Lock, User, Phone, MapPin, Loader2, Map } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';

export default function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');

  const IMGBB_API_KEY = "b3a0993c8e5f41e0a238d872a31f03d7"; 

  const handleCepChange = async (e) => {
    const numericCep = e.target.value.replace(/\D/g, '');
    setCep(numericCep);
    if (numericCep.length === 8) {
      setFetchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${numericCep}/json/`);
        const data = await response.json();
        if (!data.erro) setAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
        else toast.error("CEP não encontrado.");
      } catch (error) { toast.error("Erro ao buscar CEP"); } 
      finally { setFetchingCep(false); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("A processar...");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Bem-vindo de volta!", { id: toastId });
        onClose();
      } else {
        if (!imageFile || !fullName || !phone || !address || !cep || !addressNumber) {
          toast.error("Preencha todos os campos obrigatórios.", { id: toastId });
          setLoading(false); return;
        }
        if (IMGBB_API_KEY === "SUA_CHAVE_IMGBB_AQUI") throw new Error("Chave ImgBB ausente.");
        
        const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };
        const compressedFile = await imageCompression(imageFile, options);

        const formData = new FormData(); formData.append('image', compressedFile);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
        const data = await response.json();
        
        if (data.success) {
          const userCred = await createUserWithEmailAndPassword(auth, email, password);
          const fullAddress = `${address}, Nº ${addressNumber}${addressComplement ? ` - ${addressComplement}` : ''}`;
          await setDoc(doc(db, 'users', userCred.user.uid), {
            fullName, phone, cep, address: fullAddress, photoUrl: data.data.url, email, createdAt: new Date().toISOString(), isVerified: false
          });
          toast.success("Conta criada com sucesso!", { id: toastId });
          onClose();
        } else throw new Error("Erro no upload da foto.");
      }
    } catch (error) { toast.error(error.message, { id: toastId }); } 
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 z-10"><X className="w-5 h-5" /></button>
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}</h2>
          
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
            <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 py-2 font-bold rounded-xl transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Entrar</button>
            <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 py-2 font-bold rounded-xl transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Cadastrar</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto px-1 hide-scrollbar">
            {!isLogin && (
              <div className="space-y-4 animate-in fade-in">
                <label className="flex flex-col items-center justify-center w-24 h-24 mx-auto border-2 border-indigo-300 border-dashed rounded-full cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors overflow-hidden group">
                  {imageFile ? <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center group-hover:scale-110 transition-transform"><Camera className="w-6 h-6 text-indigo-500" /><span className="text-[10px] font-bold text-indigo-600 mt-1">Rosto</span></div>}
                  <input type="file" className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                </label>
                
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Nome Completo" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required={!isLogin} /></div>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="tel" placeholder="WhatsApp (DDDAAAAAAAA)" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required={!isLogin} /></div>

                <div className="flex gap-2">
                  <div className="relative w-1/3"><Map className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="CEP" maxLength="8" value={cep} onChange={handleCepChange} className="w-full pl-10 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required={!isLogin} /></div>
                  <div className="relative flex-1"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder={fetchingCep ? "Buscando..." : "Rua, Bairro..."} value={address} onChange={e=>setAddress(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required={!isLogin} /></div>
                </div>
                <div className="flex gap-2">
                  <div className="relative w-1/3"><input type="text" placeholder="Número" value={addressNumber} onChange={e=>setAddressNumber(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required={!isLogin} /></div>
                  <div className="relative flex-1"><input type="text" placeholder="Complemento" value={addressComplement} onChange={e=>setAddressComplement(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                </div>
              </div>
            )}
            
            <div className="relative mt-4"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
            
            <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl flex justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-95">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? 'Entrar Agora' : 'Criar Conta')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
