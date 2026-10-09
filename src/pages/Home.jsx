import React, { useState, useEffect } from 'react';
import { Search, MapPin, Tag, User, SlidersHorizontal, Award } from 'lucide-react';

export default function Home({ ads = [], categories = [], onOpenAd, onOpenSellerProfile }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [ads]);

  const uniqueSellers = [];
  const sellerIds = new Set();
  ads.forEach(ad => {
    if (!sellerIds.has(ad.sellerId) && ad.sellerName && ad.status === 'ativo') {
      sellerIds.add(ad.sellerId);
      uniqueSellers.push({ id: ad.sellerId, name: ad.sellerName, photo: ad.sellerPhoto });
    }
  });

  const matchedSellers = searchTerm ? uniqueSellers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];
  
  let activeAds = ads.filter(ad => {
    const isAtivo = ad.status === 'ativo';
    const matchesSearch = (ad.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (ad.sellerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? ad.category === selectedCategory : true;
    const matchesMinPrice = minPrice ? Number(ad.price) >= Number(minPrice) : true;
    const matchesMaxPrice = maxPrice ? Number(ad.price) <= Number(maxPrice) : true;
    return isAtivo && matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  activeAds.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    
    if (sortBy === 'lowest') return Number(a.price) - Number(b.price);
    if (sortBy === 'highest') return Number(b.price) - Number(a.price);
    return 0; // Default recent
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-2 relative z-20">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Pesquisar produtos ou lojas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-2xl border transition-all flex items-center justify-center shadow-sm ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-lg animate-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Filtros Avançados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Preço Mínimo</label>
              <input type="number" placeholder="R$ 0,00" value={minPrice} onChange={e=>setMinPrice(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Preço Máximo</label>
              <input type="number" placeholder="R$ 999,00" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Ordenar por</label>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="recent">Mais Recentes</option>
                <option value="lowest">Menor Preço</option>
                <option value="highest">Maior Preço</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => {setMinPrice(''); setMaxPrice(''); setSortBy('recent'); setSelectedCategory('');}} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 px-4 py-2">Limpar Filtros</button>
          </div>
        </div>
      )}

      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        <button onClick={() => setSelectedCategory('')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${selectedCategory === '' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'}`}>Todas as Lojas</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-sm ${selectedCategory === cat.name ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'}`}><Tag className="w-4 h-4" /> {cat.name}</button>
        ))}
      </div>

      {searchTerm && matchedSellers.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Vendedores Encontrados</h3>
          <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-2">
            {matchedSellers.map(seller => (
              <div key={seller.id} onClick={() => onOpenSellerProfile && onOpenSellerProfile(seller.id)} className="flex flex-col items-center gap-2 cursor-pointer group active:scale-95 transition-all min-w-[80px]">
                {seller.photo ? (
                  <img src={seller.photo} className="w-16 h-16 rounded-full object-cover border-[3px] border-indigo-50 group-hover:border-indigo-500 transition-colors shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border-[3px] border-transparent group-hover:border-indigo-500 flex items-center justify-center transition-colors shadow-sm"><User className="w-6 h-6 text-indigo-300"/></div>
                )}
                <span className="text-xs font-bold text-gray-700 text-center line-clamp-1 w-full">{seller.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col">
              <div className="aspect-square w-full rounded-xl bg-gray-200 animate-pulse mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
              <div className="mt-auto h-6 bg-indigo-100 rounded w-1/3 animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeAds.map((ad, index) => (
            <div key={ad.id || index} onClick={() => onOpenAd && onOpenAd(ad)} className={`bg-white rounded-2xl p-3 shadow-sm border flex flex-col hover:shadow-lg cursor-pointer transition-all active:scale-95 group relative ${ad.isFeatured ? 'border-yellow-400 ring-2 ring-yellow-400/50 bg-yellow-50/10' : 'border-gray-100'}`}>
              
              {ad.isFeatured && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md z-10 shadow-md flex items-center gap-1">
                  <Award className="w-3 h-3"/> Destaque
                </div>
              )}

              <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-100 mb-3 relative">
                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">{ad.title}</h3>
              <div className="mt-auto">
                <p className="text-xl font-black text-indigo-600">R$ {Number(ad.price).toFixed(2)}</p>
                <div className="flex items-center text-xs text-gray-400 mt-1 font-medium"><MapPin className="w-3 h-3 mr-1 flex-shrink-0 text-gray-300" /><span className="truncate">{ad.location}</span></div>
              </div>
            </div>
          ))}
          {activeAds.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">Nenhum resultado encontrado</h3>
              <p className="text-gray-500">Tente ajustar os seus filtros ou buscar por outro termo.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
