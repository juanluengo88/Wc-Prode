'use client';

import { useState } from 'react';
import {
  CURRENT_USER,
  mockMatches,
  mockPredictions,
  mockUsers,
  Match,
  Prediction,
  User,
} from '../lib/mockData';

export function useProdeApp() {
  // Authentication Mock States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);

  // Navigation Mock States
  const [activeTab, setActiveTab] = useState<'FIXTURE' | 'PREDICTIONS' | 'LEADERBOARD' | 'PROFILE'>('FIXTURE');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Mock Database State
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [predictions, setPredictions] = useState<Prediction[]>(mockPredictions);
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Auth Handlers
  const handleLoginSuccess = (userProfile: { displayName: string; email: string }) => {
    // Create new session user
    const sessionUser: User = {
      uid: 'user-session-999',
      displayName: userProfile.displayName,
      email: userProfile.email,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      totalPoints: 14, // Starts with some points for demo visual purposes
      rank: 4,
    };
    
    // Inject current session user into leaderboard
    const updatedUsers = [...mockUsers.filter((u) => u.uid !== 'user-current-123'), sessionUser]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((u, index) => ({ ...u, rank: index + 1 }));
    
    const matchedSessionUser = updatedUsers.find((u) => u.uid === 'user-session-999') || sessionUser;

    setCurrentUser(matchedSessionUser);
    setUsers(updatedUsers);
    setIsLoggedIn(true);
    setActiveTab('FIXTURE');
    setSelectedMatchId(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedMatchId(null);
  };

  // Prediction Save Handler
  const handleSavePrediction = async (matchId: string, predictHome: number, predictAway: number) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setPredictions((prev) => {
      const existingIndex = prev.findIndex((p) => p.matchId === matchId && p.uid === currentUser.uid);
      
      if (existingIndex > -1) {
        // Update existing prediction
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          predictHome,
          predictAway,
        };
        return updated;
      } else {
        // Insert new prediction
        const newPred: Prediction = {
          predictionId: `pred-${Date.now()}`,
          uid: currentUser.uid,
          matchId,
          predictHome,
          predictAway,
          pointsEarned: null,
        };
        return [...prev, newPred];
      }
    });
  };

  // Profile Update Handler
  const handleUpdateProfile = async (displayName: string, photoURL: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setCurrentUser((prev) => {
      const updatedUser = {
        ...prev,
        displayName,
        photoURL,
      };

      // Also update the user in the leaderboard lists
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.uid === prev.uid) {
            return {
              ...u,
              displayName,
              photoURL,
            };
          }
          return u;
        })
      );

      return updatedUser;
    });
  };

  // Derived States
  const selectedMatch = matches.find((m) => m.matchId === selectedMatchId);
  const userPredictionForSelected = predictions.find(
    (p) => p.matchId === selectedMatchId && p.uid === currentUser.uid
  );

  return {
    isLoggedIn,
    currentUser,
    activeTab,
    selectedMatchId,
    matches,
    predictions,
    users,
    selectedMatch,
    userPredictionForSelected,
    handleLoginSuccess,
    handleLogout,
    handleSavePrediction,
    handleUpdateProfile,
    setSelectedMatchId,
    setActiveTab,
  };
}
