import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquareText, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils'; // wait, I did `components.json` the previous step, so `@/lib/utils` is valid.

export const Sidebar = () => {
  const { logout } = useAuth();
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">CRM</h1>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1">
        <NavLink 
          to="/"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800/50 hover:text-white"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink 
          to="/pipeline"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800/50 hover:text-white"
          )}
        >
          <Users className="h-4 w-4" />
          Pipeline
        </NavLink>
        <NavLink 
          to="/tasks"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800/50 hover:text-white"
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-square"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Tasks
        </NavLink>
        <NavLink 
          to="/chat"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800/50 hover:text-white transition-colors"
        >
          <MessageSquareText className="h-4 w-4" />
          Live AI Chat (Demo)
        </NavLink>
      </nav>

      <div className="p-3">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
