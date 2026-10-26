import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '@/globals.css';

export const metadata: Metadata = {
  title: 'CompanyCam – Field Documentation App',
  description: 'Professional photo documentation and team collaboration for contractors',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white">
        {children}
      </body>
    </html>
  );
}
