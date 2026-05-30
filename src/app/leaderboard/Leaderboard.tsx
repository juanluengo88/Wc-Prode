'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProde } from '../../context/ProdeContext';
import TopNavbar from '../../components/navigation/TopNavbar';
import BottomNav from '../../components/navigation/BottomNav';
import LeaderboardView from '../../components/views/LeaderboardView';

export default function LeaderboardPage() {
  const router = useRouter();
  const { isLoggedIn, currentUser, users } = useProde();

  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <TopNavbar />
      <div className="flex-1 flex flex-col">
        <LeaderboardView currentUser={currentUser} users={users} />
      </div>
      <BottomNav />
    </div>
  );
}
