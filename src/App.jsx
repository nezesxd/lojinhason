import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';
import { db, auth } from './firebase';

import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import AdDetailsModal from './components/AdDetailsModal';
import SellerProfileModal from './components/SellerProfileModal';
import SupportModal from './components/SupportModal';
import InfoModal from './components/InfoModal';

import Home from './pages/Home';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [infoPage, setInfoPage] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const unsubUser = onSnapshot(collection(db, 'users'), (snap) => {
          const uData = snap.docs.find(d => d.id === currentUser.uid);
          if (uData) setUserData(uData.data());
        });
        return () => unsubUser();
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubAds = onSnapshot(query(collection(db, 'anuncios'), orderBy('createdAt', 'desc')), (snap) => {
      setAds(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCats = onSnapshot(query(collection(db, 'categorias'), orderBy('name', 'asc')), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubAds(); unsubCats(); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Toaster position="top-center" reverseOrder={false} />
      
      <Header 
        currentTab={currentTab} 
        user={user} 
        userData={userData} 
        onLoginClick={() => setShowAuthModal(true)} 
        onOpenSupport={() => setShowSupportModal(true)} 
      />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-4 pb-10">
        {currentTab === 'home' && (
          <Home ads={ads} categories={categories} onOpenAd={setSelectedAd} onOpenSellerProfile={setSelectedSellerId} />
        )}
        {currentTab === 'user' && (
          <Profile ads={ads} user={user} userData={userData} categories={categories} onOpenAuth={() => setShowAuthModal(true)} onOpenSupport={() => setShowSupportModal(true)} onOpenAd={setSelectedAd} />
        )}
        {currentTab === 'admin' && <Admin ads={ads} categories={categories} user={user} userData={userData} />}
      </main>

      <Footer onOpenInfo={setInfoPage} />
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} userData={userData} />

      {infoPage && <InfoModal page={infoPage} onClose={() => setInfoPage(null)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      
      {selectedAd && (
        <AdDetailsModal ad={selectedAd} onClose={() => setSelectedAd(null)} user={user} userData={userData} onOpenAuth={() => { setSelectedAd(null); setShowAuthModal(true); }} onOpenSellerProfile={(id) => { setSelectedAd(null); setSelectedSellerId(id); }} />
      )}

      {selectedSellerId && (
        <SellerProfileModal sellerId={selectedSellerId} onClose={() => setSelectedSellerId(null)} onOpenAd={(ad) => { setSelectedSellerId(null); setSelectedAd(ad); }} user={user} userData={userData} onOpenAuth={() => { setSelectedSellerId(null); setShowAuthModal(true); }} />
      )}

      {showSupportModal && <SupportModal user={user} userData={userData} onClose={() => setShowSupportModal(false)} />}
    </div>
  );
}
