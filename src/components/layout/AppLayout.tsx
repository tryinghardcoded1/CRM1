import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/lib/AuthContext';
import { Toaster } from '@/components/common/sonner';

export const AppLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
};
