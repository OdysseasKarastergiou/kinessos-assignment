'use client'
import React from 'react';
import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="mt-4 rounded-md bg-red-500 px-4 py-2 text-white font-semibold hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
