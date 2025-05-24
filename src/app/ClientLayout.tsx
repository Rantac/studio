'use client';

import { Plus_Jakarta_Sans } from 'next/font/google';
import {useEffect} from 'react';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
});


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // This code will only run on the client side
    document.body.className = `${plusJakartaSans.variable} antialiased`;
  }, []);

  return (
    <>
      {children}
    </>
  );
}
