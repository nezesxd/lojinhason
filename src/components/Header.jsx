import React, { useEffect, useState } from 'react';
import { Store, UserCircle, LogOut, Bell } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Header({ currentTab, user, userData, onLoginClick, onOpenSupport }) {
  const titles = { home: "Vitrine", user: "Minha Conta", admin: "Painel Admin" };
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'suporte'), where('chatId', '==', user.uid), where('isAdminReply', '==', true));
    const unsub = onSnapshot(q, snap => {
      setHasNotifications(snap.docs.length > 0);
    });
    return () => unsub();
  }, [user]);
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl"><Store className="w-5 h-5 text-white" /></div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Lojinha's On</h1>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{titles[currentTab]}</div>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <button onClick={onOpenSupport} className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors mr-1">
                <Bell className="w-5 h-5" />
                {hasNotifications && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700 hidden sm:block">{userData?.fullName?.split(' ')[0]}</span>
                {userData?.photoUrl ? (
                  <img src={userData.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                ) : (
                  <UserCircle className="w-8 h-8 text-gray-400" />
                )}
                <button onClick={() => signOut(auth)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 ml-1"><LogOut className="w-4 h-4" /></button>
              </div>
            </>
          ) : (
            <button onClick={onLoginClick} className="text-sm font-bold bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full hover:bg-indigo-100">Entrar</button>
          )}
        </div>
      </div>
    </header>
  );
}
