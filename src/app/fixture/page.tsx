'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProde } from '../../context/ProdeContext';
import TopNavbar from '../../components/navigation/TopNavbar';
import BottomNav from '../../components/navigation/BottomNav';
import FixtureView from '../../components/views/FixtureView';

export default function FixturePage() {
  const router = useRouter();
  const { isLoggedIn, currentUser, matches, predictions, handleSavePrediction, handleLogout } = useProde();

  // Route protection
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null; // Prevent layout flashes
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <TopNavbar />
      
      <div className="flex-1 flex flex-col">
        <FixtureView
          user={currentUser}
          matches={matches}
          predictions={predictions.filter((p) => p.uid === currentUser.uid)}
          onSavePrediction={handleSavePrediction}
          onSelectMatch={(matchId) => router.push(`/match/${matchId}`)}
          onLogout={handleLogout}
        />
      </div>
      
      <BottomNav />
    </div>
  );
}
