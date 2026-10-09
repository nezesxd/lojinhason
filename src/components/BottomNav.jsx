import React from 'react';
import { Home, UserCircle, ShieldAlert } from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab, userData }) {
  const isAdmin = userData?.isAdmin === true;

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        <button onClick={() => setCurrentTab('home')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentTab === 'home' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <Home className={`w-6 h-6 ${currentTab === 'home' ? 'fill-indigo-50' : ''}`} />
          <span className="text-[10px] font-medium">Vitrine</span>
        </button>
        <button onClick={() => setCurrentTab('user')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentTab === 'user' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <UserCircle className={`w-6 h-6 ${currentTab === 'user' ? 'fill-indigo-50' : ''}`} />
          <span className="text-[10px] font-medium">Conta</span>
        </button>
        
        {isAdmin && (
          <button onClick={() => setCurrentTab('admin')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentTab === 'admin' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <ShieldAlert className={`w-6 h-6 ${currentTab === 'admin' ? 'fill-indigo-50' : ''}`} />
            <span className="text-[10px] font-medium">Admin</span>
          </button>
        )}
      </div>
    </nav>
  );
}
