'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProde } from '../../context/ProdeContext';
import LoginView from '../../components/views/LoginView';

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, handleLoginSuccess } = useProde();

  // If already logged in, redirect to fixture
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/fixture');
    }
  }, [isLoggedIn, router]);

  const onLogin = (userProfile: { displayName: string; email: string }) => {
    handleLoginSuccess(userProfile);
    router.push('/fixture');
  };

  return <LoginView onLoginSuccess={onLogin} />;
}
