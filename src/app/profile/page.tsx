'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProde } from '../../context/ProdeContext';
import TopNavbar from '../../components/navigation/TopNavbar';
import BottomNav from '../../components/navigation/BottomNav';
import ProfileView from '../../components/views/ProfileView';

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, currentUser, handleUpdateProfile, handleLogout } = useProde();

  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const onLogout = () => {
    handleLogout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <TopNavbar />
      <div className="flex-1 flex flex-col">
        <ProfileView
          user={currentUser}
          onUpdateProfile={handleUpdateProfile}
          onLogout={onLogout}
        />
      </div>
      <BottomNav />
    </div>
  );
}
