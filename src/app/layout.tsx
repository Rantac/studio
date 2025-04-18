import type {Metadata} from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'Generated by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
