import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/storeContext';

export const metadata: Metadata = {
  title: 'EmpireNexs Management System | YouTube Automation ERP',
  description: 'Multi-branch operations & YouTube automation system for EmpireNexs (Musafirkhana, Bahawalpur, Rahim Yar Khan)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
