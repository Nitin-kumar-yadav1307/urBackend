import React from 'react';
import { 
  Square, Layout, Briefcase, Filter, 
  PieChart, Users, Settings, LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ onNavigate }) {
  const menuItems = [
    { id: 'boards', icon: Layout, label: 'BOARDS', color: 'text-[#2563eb]', action: onNavigate },
    { id: 'work', icon: Briefcase, label: 'YOUR WORK', color: 'text-[#db2777]' },
    { id: 'filters', icon: Filter, label: 'FILTERS', color: 'text-[#0891b2]' },
    { id: 'reports', icon: PieChart, label: 'REPORTS', color: 'text-[#16a34a]' },
  ];

  return (
    <aside className="w-[var(--sidebar-width)] h-screen bg-white border-r-[3px] border-black flex flex-col shrink-0">
      {/* Sidebar Header */}
      <div className="p-6 border-b-[3px] border-black mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-black w-10 h-10 flex items-center justify-center">
              <Square className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase leading-none">urKanban</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (item.action) item.action();
              // Future: setView(item.id)
            }}
            className="w-full flex items-center justify-between px-4 py-3 border-[2px] border-transparent hover:border-black hover:bg-black hover:text-white transition-all group rounded-none"
          >
            <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.color} group-hover:text-white`} />
                <span className="font-black text-xs tracking-widest">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
          </button>
        ))}
        
        <div className="pt-10 pb-2 px-4">
            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Utilities</span>
        </div>
        
        <button className="w-full flex items-center gap-3 px-4 py-3 border-[2px] border-transparent hover:border-black transition-all font-black text-xs tracking-widest uppercase">
          <Users className="w-5 h-5 text-[#ca8a04]" />
          <span>Team</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 border-[2px] border-transparent hover:border-black transition-all font-black text-xs tracking-widest uppercase">
          <Settings className="w-5 h-5 text-[#7c3aed]" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t-[3px] border-black bg-[#fef08a]">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black flex items-center justify-center text-[10px] font-black text-white px-1">
                  PRO
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Active Plan</span>
          </div>
      </div>
    </aside>
  );
}
