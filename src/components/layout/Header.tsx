import { useAuth } from '@/lib/AuthContext';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/common/input';

export const Header = () => {
  const { user } = useAuth();
  
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center flex-1">
        <div className="relative w-64">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
           <Input 
             type="text" 
             placeholder="Search leads..." 
             className="pl-9 bg-gray-50 border-none w-full shadow-none focus-visible:ring-1 focus-visible:ring-gray-300"
            />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700">
           <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.email}</span>
        </div>
      </div>
    </header>
  );
};
