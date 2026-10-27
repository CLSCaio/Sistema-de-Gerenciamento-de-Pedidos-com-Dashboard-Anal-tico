import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';

export function AppShell() {
  return (
    <div className="min-h-screen bg-cream text-ink lg:flex">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
