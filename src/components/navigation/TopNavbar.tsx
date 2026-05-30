'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProde } from '../../context/ProdeContext';

export default function TopNavbar() {
  const router = useRouter();
  const { currentUser, handleLogout } = useProde();

  const handleLogoutAndRedirect = () => {
    handleLogout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-4 py-3 sm:px-8">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* App Logo - Click routes back to fixture dashboard */}
        <div 
          onClick={() => router.push('/fixture')} 
          className="flex items-center gap-3 cursor-pointer group active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-slate-950">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-5.25c-.621 0-1.125.504-1.125 1.125v3.375m9 0ZM9 18.75V10.5m-3.75 3h7.5M12 3a9 9 0 0 1 9 9m-18 0a9 9 0 0 1 9-9Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white bg-gradient-to-r from-amber-250 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase">
              MUNDIAL PRODE
            </h2>
            <p className="text-[10px] text-slate-400 hidden sm:block">Muestra tus conocimientos</p>
          </div>
        </div>

        {/* Profile and Logout Actions */}
        <div className="flex items-center gap-3">
          
          {/* Clickable Profile Card */}
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-850 hover:border-slate-500 hover:scale-[1.02] active:scale-[0.98] py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-full border border-slate-700/60 cursor-pointer transition-all"
            title="Ver Perfil"
          >
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-[10px] sm:text-xs">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-xs sm:text-sm font-semibold flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-none sm:leading-normal">
              <span className="text-slate-200 truncate max-w-[70px] sm:max-w-none">{currentUser.displayName.split(' ')[0]}</span>
              <span className="text-amber-400 font-bold">{currentUser.totalPoints} pts</span>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogoutAndRedirect}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors py-1 px-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            Salir
          </button>
        </div>

      </div>
    </header>
  );
}
