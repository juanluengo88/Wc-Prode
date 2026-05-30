'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProde } from '../../context/ProdeContext';
import TopNavbar from '../../components/navigation/TopNavbar';
import BottomNav from '../../components/navigation/BottomNav';
import MyPredictionsView from '../../components/views/MyPredictionsView';

export default function PredictionsPage() {
  const router = useRouter();
  const { isLoggedIn, currentUser, matches, predictions } = useProde();

  // Route protection
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <TopNavbar />
      
      <div className="flex-1 flex flex-col">
        <MyPredictionsView
          matches={matches}
          predictions={predictions.filter((p) => p.uid === currentUser.uid)}
          onSelectMatch={(matchId) => router.push(`/match/${matchId}`)}
        />
      </div>
      
      <BottomNav />
    </div>
  );
}
