import React from 'react';
import { 
  Bell, HelpCircle, 
  Settings, Grid, Search, LogOut,
  User
} from 'lucide-react';

export default function TopNav({ user, onLogout, children }) {
  return (
    <header className="h-[var(--topnav-height)] bg-white border-b-[3px] border-black flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 text-sm font-black tracking-widest uppercase">
          <span className="text-[#666666]">Projects</span>
          <span className="text-black">/</span>
          <span className="bg-[#2563eb] text-white px-2 py-0.5">urKanban Demo</span>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-center max-w-lg mx-auto">
        {children}
      </div>

      <div className="flex items-center gap-4">
            <button className="p-2 border-[2px] border-transparent hover:border-black transition-all">
                <Bell className="w-5 h-5 text-black" />
            </button>
            <button className="p-2 border-[2px] border-transparent hover:border-black transition-all">
                <Settings className="w-5 h-5 text-black" />
            </button>
        </div>

        <div className="h-8 w-[2px] bg-black mx-2"></div>

        <div className="flex items-center gap-4 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black uppercase tracking-widest text-black">{user?.name || user?.username}</p>
            <p className="text-[10px] font-black uppercase text-[#666666] tracking-tighter">Contributor</p>
          </div>
          <div className="bg-black w-10 h-10 border-[2px] border-black flex items-center justify-center text-sm font-black text-white uppercase shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]">
            {user?.name?.[0] || user?.username?.[0] || 'U'}
          </div>
          <button 
            onClick={onLogout}
            className="p-2 border-[2px] border-transparent hover:border-black hover:text-white hover:bg-[#dc2626] transition-all"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        </header>
  );
}
