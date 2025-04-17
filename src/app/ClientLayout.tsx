'use client';

import {Geist, Geist_Mono} from 'next/font/google';
import {useEffect} from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // This code will only run on the client side
    document.body.className = `${geistSans.variable} ${geistMono.variable} antialiased`;
  }, []);

  return (
    <>
      {children}
    </>
  );
}
