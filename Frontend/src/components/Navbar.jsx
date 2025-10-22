import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import {
  Menu,
  X,
  Home,
  Search,
  Users,
  MessageCircle,
  BarChart3,
  User,
  Users2,
  LogOut,
  LayoutDashboard,
  Settings,
  Star,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Bell,
  CheckCheck,
  UserPlus
} from 'lucide-react';
import { useMe } from '@/hooks/useMe';
import { useLogout } from '@/hooks/useLogout';
import { useChat } from '@/contexts/ChatContext'; 
import { Fragment } from 'react';
import useNotifications from '@/hooks/useNotifications';

// --- Refactored Navbar Component ---


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: user, isLoading, error } = useMe();
  const { mutate: doLogout, isPending: loggingOut } = useLogout();
  const location = useLocation();
  const activePath = location.pathname;
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  // --- Data & Logic Section ---

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/matches', label: 'Matches', icon: Users },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/exchanges', label: 'Exchanges', icon: BarChart3 },
  ].filter(Boolean);

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Management', icon: Users2 },
    { path: '/admin/skills', label: 'Skills Management', icon: Settings },
  ];

  // Dynamically add admin link
  if (user?.role === 'admin') {
    // Add a placeholder for the admin dropdown
    navigationItems.push({ type: 'admin-dropdown', label: 'Admin' });
  }

  // Effect to auto-logout on auth errors
  useEffect(() => {
    if (error?.Message?.includes('deactivated') || error?.Message?.includes('Authentication failed')) {
      doLogout();
    }
  }, [error, doLogout]);

  // Effect to close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // --- UI Sub-components for better organization ---

  const NavLink = ({ item }) => {
    const isActive = activePath === item.path;
    const { state: chatState } = useChat(); 
    const totalUnread = Object.values(chatState.unreadCounts).reduce((sum, count) => sum + count, 0);

    return (
      <Link
        to={item.path}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors duration-300 group ${isActive
          ? 'text-white'
          : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
          }`}
      >
        <div className="relative flex-shrink-0">
          <item.icon size={20} className="flex-shrink-0" />
          {item.path === '/chat' && totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] text-center font-medium">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </div>
        <span className="hidden lg:block">{item.label}</span>
        {isActive && (
          <motion.div
            layoutId="active-nav-indicator"
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg -z-10"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  const AdminMenu = () => {
    const isAdminPath = activePath.startsWith('/admin');
    return (
      <HeadlessMenu as="div" className="relative">
        <HeadlessMenu.Button className={`relative flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors duration-300 group ${isAdminPath
          ? 'text-white'
          : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
          }`}>
          <Settings size={20} className="flex-shrink-0" />
          <span className="hidden lg:block">Admin</span>
          <ChevronDown size={16} className="hidden lg:block opacity-70" />
          {isAdminPath && (
            <motion.div
              layoutId="active-nav-indicator"
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg -z-10"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </HeadlessMenu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <HeadlessMenu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="p-1">
              {adminNavItems.map((item) => (
                <HeadlessMenu.Item key={item.path}>
                  {({ active }) => (
                    <Link to={item.path} className={`${active ? 'bg-gray-100 dark:bg-white/10' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 dark:text-gray-200`}>
                      <item.icon className="mr-2 h-5 w-5" /> {item.label}
                    </Link>
                  )}
                </HeadlessMenu.Item>
              ))}
            </div>
          </HeadlessMenu.Items>
        </Transition>
      </HeadlessMenu>
    );
  };

  const NotificationIcon = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const getNotificationIcon = (type) => {
      switch (type) {
        case 'exchange_request': return '🔄';
        case 'exchange_rejected': return '❌';
        case 'exchange_accepted': return '✅';
        case 'exchange_completed': return '🏆';
        case 'message': return '💬';
        case 'review_received': return '⭐';
        case 'account_deactivated': return '🚫';
        case 'account_activated': return '✅';
        case 'account_deleted': return '🗑️';
        case 'session_scheduled': return '📅';
        default: return '🔔';
      }
    };

    const formatTime = (date) => {
      const now = new Date();
      const diff = now - new Date(date);
      const minutes = Math.floor(diff / 60000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    };

    return (
      <>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Mobile-Friendly Notification Dropdown */}
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <div className={`
              absolute right-1 md:right-2 top-full mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50
              ${/* Desktop */ 'w-80 max-h-96 overflow-y-auto'}
              ${/* Mobile */ 'w-[calc(100vw-2rem)] max-w-sm max-h-[70vh] overflow-y-auto'}
            `}>
              <div className="p-3 md:p-2">
                {/* Header */}
                <div className="flex items-center justify-between px-2 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base">
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          markAllAsRead();
                          setIsOpen(false);
                        }}
                        className="text-xs md:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        <CheckCheck size={14} />
                        <span className="hidden sm:inline">Mark all read</span>
                        <span className="sm:hidden">Mark all</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Close notifications"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-64 md:max-h-80 overflow-y-auto">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-3 md:p-2 rounded-md cursor-pointer transition-colors touch-manipulation ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification._id);
                          }
                          setIsOpen(false);
                          // Navigate to relevant page based on notification type
                          if (notification.type === 'exchange_request' ||
                            notification.type === 'exchange_rejected' ||
                            notification.type === 'exchange_accepted' ||
                            notification.type === 'exchange_completed' ||
                            notification.type === 'session_scheduled') {
                            navigate('/exchanges');
                          } else if (notification.type === 'message') {
                            navigate('/chat');
                          } else if (notification.type === 'review_received') {
                            navigate('/reviews');
                          } else if (notification.type === 'account_deactivated' ||
                            notification.type === 'account_activated' ||
                            notification.type === 'account_deleted') {
                            navigate('/settings');
                          }
                        }}
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <span className="text-base md:text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm md:text-sm font-medium truncate ${!notification.read
                                  ? 'text-gray-900 dark:text-gray-100'
                                  : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className={`text-xs md:text-sm truncate ${!notification.read
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-500 dark:text-gray-400'
                              }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/notifications');
                      }}
                      className="block w-full text-center py-2 text-xs md:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  const UserProfileMenu = () => (
    <HeadlessMenu as="div" className="relative">
      <HeadlessMenu.Button className="flex items-center gap-2 text-left p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors duration-300">
        <img
          src={user.profilePic?.url || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
          alt={user.name}
          loading="lazy"
          className="w-9 h-9 rounded-full object-cover bg-gray-200"
        />
        <div className="hidden lg:flex flex-col">
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate max-w-28">{user.name || 'User'}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{user.role}</span>
        </div>
        <ChevronDown size={16} className="text-gray-500 hidden lg:block" />
      </HeadlessMenu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-1">
            <HeadlessMenu.Item>
              {({ active }) => (
                <Link to="/me" className={`${active ? 'bg-gray-100 dark:bg-white/10' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 dark:text-gray-200`}>
                  <User className="mr-2 h-5 w-5" /> Profile
                </Link>
              )}
            </HeadlessMenu.Item>
            <HeadlessMenu.Item>
              {({ active }) => (
                <Link to="/settings" className={`${active ? 'bg-gray-100 dark:bg-white/10' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 dark:text-gray-200`}>
                  <Settings className="mr-2 h-5 w-5" /> Settings
                </Link>
              )}
            </HeadlessMenu.Item>
            <HeadlessMenu.Item>
              {({ active }) => (
                <Link to="/reviews" className={`${active ? 'bg-gray-100 dark:bg-white/10' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 dark:text-gray-200`}>
                  <Star className="mr-2 h-5 w-5" /> My Reviews
                </Link>
              )}
            </HeadlessMenu.Item>
          </div>
          <div className="p-1">
            <HeadlessMenu.Item>
              {({ active }) => (
                <button onClick={() => doLogout()} disabled={loggingOut} className={`${active ? 'bg-red-50 dark:bg-red-500/10' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-red-600 dark:text-red-400 disabled:opacity-50`}>
                  <LogOut className="mr-2 h-5 w-5" /> {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              )}
            </HeadlessMenu.Item>
          </div>
        </HeadlessMenu.Items>
      </Transition>
    </HeadlessMenu>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-2">
      <Link 
        to="/login" 
        className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg font-semibold transition-all duration-300"
      >
        <User size={18} />
        <span className="hidden sm:block">Login</span>
      </Link>
      <Link 
        to="/register" 
        className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <UserPlus size={18} />
        <span className="hidden sm:block">Sign Up</span>
      </Link>
    </div>
  );

  const ThemeToggle = ({ isMobile = false }) => {
    const cycleTheme = () => {
      const themes = ['light', 'dark', 'system'];
      const currentIndex = themes.indexOf(theme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    };

    if (isMobile) {
      return (
        <button onClick={cycleTheme} className="flex items-center justify-between w-full p-3 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-white/10">
          <span className="flex items-center gap-4">
            {theme === 'light' && <Sun size={22} />}
            {theme === 'dark' && <Moon size={22} />}
            {theme === 'system' && <Monitor size={22} />}
            Switch Theme
          </span>
          <span className="text-sm capitalize text-gray-500">{theme}</span>
        </button>
      )
    }
    return (
      <button onClick={cycleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
        <Sun size={20} className={`transform transition-transform duration-500 ${theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} style={{ position: 'absolute' }} />
        <Moon size={20} className={`transform transition-transform duration-500 ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} style={{ position: 'absolute' }} />
        <Monitor size={20} className={`transform transition-transform duration-500 ${theme === 'system' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
      </button>
    );
  };

  // --- Main Navbar Render ---
  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/80 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0">SE</div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">SkillExchange</span>
            </Link>

            {/* Unified Desktop/Tablet Navigation - Only show when logged in */}
            {user && (
              <div className="hidden md:flex flex-1 justify-center">
                <div className="flex items-center space-x-1">
                  {navigationItems.map((item) =>
                    item.type === 'admin-dropdown' ? (
                      <AdminMenu key={item.label} />
                    ) : (
                      <NavLink key={item.path} item={item} />
                    )
                  )}
                </div>
              </div>
            )}

            {/* Right side: Notifications, User Menu/Auth Buttons, Theme Toggle */}
            <div className="hidden md:flex items-center gap-1">
              {isLoading ? (
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              ) : user ? (
                <>
                  <NotificationIcon />
                  <UserProfileMenu />
                </>
              ) : (
                <AuthButtons />
              )}
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-1">
              {user && <NotificationIcon />}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* --- Sleek Mobile Menu --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
            />
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 shadow-xl z-50 md:hidden flex flex-col p-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Navigation - Only show when logged in */}
              {user && (
                <div className="flex flex-col space-y-2">
                  {navigationItems.map((item) => {
                    if (item.type === 'admin-dropdown') {
                      return (
                        <div key={item.label} className="pt-2">
                          <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Admin</p>
                          {adminNavItems.map(adminItem => {
                            const isActive = activePath === adminItem.path;
                            return (
                              <Link key={adminItem.path} to={adminItem.path} className={`flex items-center gap-4 p-3 rounded-lg text-base font-medium transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                <adminItem.icon size={22} /> {adminItem.label}
                              </Link>
                            )
                          })}
                        </div>
                      )
                    }
                    const isActive = activePath === item.path;
                    return (
                      <Link key={item.path} to={item.path} className={`flex items-center gap-4 p-3 rounded-lg text-base font-medium transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                        <item.icon size={22} /> {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <ThemeToggle isMobile={true} />
                {isLoading ? (
                  <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ) : user ? (
                  <div className="flex flex-col space-y-2">
                    <Link to="/me" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                      <img src={user.profilePic?.url || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} loading="lazy"
                        className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">View Profile</div>
                      </div>
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                      <Settings size={20} className="text-gray-600 dark:text-gray-400" />
                      <span className="font-medium">Settings</span>
                    </Link>
                    <Link to="/reviews" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                      <Star size={20} className="text-gray-600 dark:text-gray-400" />
                      <span className="font-medium">My Reviews</span>
                    </Link>
                    <button onClick={() => doLogout()} disabled={loggingOut} className="flex items-center gap-3 w-full p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50">
                    <LogOut size={20} /> {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          ) : (
            // Mobile Auth Buttons (when not logged in)
            <div className="flex flex-col space-y-2">
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-3 p-3 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <User size={20} />
                <span>Login</span>
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-3 p-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <UserPlus size={20} />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
</>
);
};

export default Navbar;