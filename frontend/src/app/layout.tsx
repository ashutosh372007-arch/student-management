import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Student Management System',
  description: 'A comprehensive student management system for schools and educational institutions',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-pattern" />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
