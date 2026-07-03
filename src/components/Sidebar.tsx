import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Calendar, 
  Music,
  UserCheck,
  ChevronRight,
  Megaphone,
  BookOpen,
  GraduationCap,
  TrendingUp,
  BarChart3,
  X
} from 'lucide-react';
import { Tutor } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  tutors: Tutor[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ currentTab, setCurrentTab, tutors, isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads CRM', icon: Users },
    { id: 'campaigns', label: 'Marketing Hub', icon: Megaphone },
    { id: 'courses', label: 'Courses & Batches', icon: BookOpen },
    { id: 'interactions', label: 'Interactions Log', icon: MessageSquare },
    { id: 'schedule', label: 'Schedules & Attendance', icon: Calendar },
    { id: 'performance', label: 'Performance Tracker', icon: TrendingUp },
    { id: 'tutor-analytics', label: 'Tutor Analytics', icon: BarChart3 },
    { id: 'portal', label: 'Student Portal', icon: GraduationCap },
  ];

  return (
    <aside className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40 md:z-20 transition-transform duration-300 md:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/60 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <Music className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white tracking-tight leading-tight text-base">
              Music Academy
            </h1>
            <p className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              CRM Portal
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent md:hidden block transition-colors"
          title="Close Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                isActive 
                  ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                }`} />
                <span>{item.label}</span>
              </div>
              
              {isActive ? (
                <div className="w-1.5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 absolute left-0 top-1/2 -translate-y-1/2" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          );
        })}

        {/* Tutors Section - Custom "Assets" look from Crypto Dashboards */}
        <div className="pt-8">
          <div className="px-3 mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Academy Tutors
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
              <UserCheck className="w-3 h-3" />
              ACTIVE
            </span>
          </div>

          <div className="space-y-2.5 px-1">
            {tutors.map((tutor) => (
              <div 
                key={tutor.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 border border-transparent hover:border-slate-100 dark:hover:border-slate-800/40 transition-all duration-150"
              >
                <img 
                  src={tutor.avatar} 
                  alt={tutor.name} 
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {tutor.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {tutor.specialty.slice(0, 2).join(', ')}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs ring-2 ring-indigo-50/40">
            M
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              Ganesh (Registrar)
            </h4>
            <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
              babuganesh5@gmail
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
