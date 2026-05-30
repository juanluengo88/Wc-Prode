'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProde } from '../../../context/ProdeContext';
import MatchDetailView from '../../../components/views/MatchDetailView';

export default function MatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;

  const { isLoggedIn, matches, predictions, currentUser, handleSavePrediction } = useProde();

  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const match = matches.find((m) => m.matchId === matchId);
  const prediction = predictions.find(
    (p) => p.matchId === matchId && p.uid === currentUser.uid
  );

  // If matchId doesn't correspond to any match, go back
  if (!match) {
    router.replace('/fixture');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <MatchDetailView
        match={match}
        prediction={prediction}
        onSavePrediction={handleSavePrediction}
        onBack={() => router.back()}
      />
    </div>
  );
}
