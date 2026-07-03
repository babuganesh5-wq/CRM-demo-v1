import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Search, 
  Bell, 
  CalendarClock,
  Music4,
  Menu
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: Array<{ id: string; text: string; time: string; read: boolean }>;
  markNotificationsAsRead: () => void;
  toggleSidebar: () => void;
}

export default function Header({ 
  currentTab, 
  isDarkMode, 
  setIsDarkMode, 
  searchQuery, 
  setSearchQuery,
  notifications,
  markNotificationsAsRead,
  toggleSidebar
}: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Academy Overview';
      case 'leads': return 'Student Leads CRM';
      case 'interactions': return 'Interaction Timeline';
      case 'schedule': return 'Lesson Schedule & Planner';
      default: return 'Music Academy CRM';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 transition-colors duration-200">
      {/* Title / Context */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 md:hidden flex items-center justify-center transition-all cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="md:block hidden">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            {getTabTitle()}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Music Academy Registrar Portal
          </p>
        </div>

        <div className="md:hidden block">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">
            {getTabTitle()}
          </h2>
        </div>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-md mx-8 relative md:block hidden">
        <Search className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search leads, instruments, teachers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-sm rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/40 transition-all duration-150"
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        {/* Real-time Clock Card */}
        <div className="sm:flex hidden items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs text-slate-600 dark:text-indigo-300">
          <CalendarClock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{time || '00:00:00'}</span>
        </div>

        {/* Light/Dark Toggle (Crypto style) */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-amber-400 border border-slate-100 dark:border-slate-800 transition-all duration-150"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun className="w-4.5 h-4.5 animate-spin-slow" />
          ) : (
            <Moon className="w-4.5 h-4.5" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markNotificationsAsRead();
            }}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 relative transition-all duration-150"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-30 py-2.5 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Recent Activities</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full font-semibold">
                  New Alert
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto px-1.5 space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No recent updates</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer flex gap-3"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0">
                        <Music4 className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                          {notif.text}
                        </p>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-1 block">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick User Badge */}
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" 
            alt="User profile" 
            className="w-8.5 h-8.5 rounded-xl object-cover ring-2 ring-indigo-50 dark:ring-indigo-950/60"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
