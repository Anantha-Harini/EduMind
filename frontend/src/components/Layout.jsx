import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/notifications/', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);


  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    if (user.role === 'student') return '/student';
    if (user.role === 'faculty') return '/faculty';
    return '/admin';
  };

  const allNavItems = [
    { name: 'Dashboard', path: getDashboardPath(), icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', roles: ['student', 'faculty', 'admin'] },
    { name: 'Library', path: '/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', roles: ['student', 'faculty', 'admin'] },
    { name: 'Quizzes', path: '/quizzes', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['student'] },
    { name: 'Flashcards', path: '/flashcards', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', roles: ['student', 'faculty'] },
    { name: 'Upload', path: '/upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12', roles: ['faculty', 'admin'] },
    { name: 'Leaderboard', path: '/leaderboard', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', roles: ['student'] },
    { name: 'Bookmarks', path: '/bookmarks', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', roles: ['student', 'faculty'] },
    { name: 'Admin Console', path: '/admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', roles: ['admin'] },
  ];

  const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 fixed h-full border-r border-white/5 glass-panel hidden md:flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-blue-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <span className="text-2xl font-bold text-gradient">EduMind</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} to={item.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute left-0 top-0 bottom-0 w-1 bg-brand-400" />
                  )}
                  <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-brand-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 relative min-h-screen">
        {/* Top Header */}
        <header className="h-20 glass-panel border-x-0 border-t-0 flex items-center justify-between px-8 sticky top-0 z-40">
          {/* Page title area (left) */}
          <div className="hidden md:block">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">Knowledge Management Portal</p>
          </div>
            {/* Header right side: Notification bell and user profile */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative">
                <button onClick={() => setShowNotif(!showNotif)} className="text-slate-400 hover:text-slate-200 focus:outline-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.64 5.36 6 7.929 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-bounce">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {/* Dropdown */}
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center font-medium text-slate-800 dark:text-slate-200">
                      <span>Notifications</span>
                      <button onClick={() => { fetchNotifications(); }} className="text-xs text-brand-500 hover:underline">Refresh</button>
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <li className="p-3 text-sm text-slate-500">No new notifications</li>
                      ) : (
                        notifications.map((n) => (
                          <li key={n.id} className="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex justify-between items-start">
                            <Link to={n.link || '/'} onClick={() => setShowNotif(false)} className="block text-sm text-slate-800 dark:text-slate-200 flex-1 mr-2">
                              {n.message}
                            </Link>
                            <button onClick={async () => {
                              try {
                                await fetch(`http://localhost:8000/api/notifications/${n.id}/read`, {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${user?.token}` }
                                });
                              } catch (e) { console.error(e); }
                              setNotifications(prev => prev.filter(notif => notif.id !== n.id));
                            }} className="text-xs text-slate-400 hover:text-slate-600">×</button>
                          </li>
                        ))
                      )}
                    </ul>
                    {notifications.length > 0 && (
                      <div className="p-2 border-t border-slate-200 dark:border-slate-700 text-center">
                        <button onClick={async () => {
                          try {
                            const res = await fetch('http://localhost:8000/api/notifications/read', {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${user?.token}` }
                            });
                            if (res.ok) setNotifications([]);
                          } catch (e) {
                            console.error('Failed to mark notifications read', e);
                          }
                        }} className="text-xs text-brand-500 hover:underline">
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* User Profile */}
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-brand-300 transition-colors">{user?.fullName || user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-brand-400 uppercase tracking-wider">{user?.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-blue-500 border border-white/10 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  {(user?.fullName || user?.email)?.[0]?.toUpperCase()}
                </div>
              </Link>
            </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
