import React, { useEffect, useState, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import {
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
  UserPlus,
  Menu,
  X
} from 'lucide-react';
import { useMe } from '@/hooks/useMe';
import { useLogout } from '@/hooks/useLogout';
import { useChat } from '@/contexts/ChatContext';
import useNotifications from '@/hooks/useNotifications';

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

  if (user?.role === 'admin') {
    navigationItems.push({ type: 'admin-dropdown', label: 'Admin' });
  }

  useEffect(() => {
    if (error?.Message?.includes('deactivated') || error?.Message?.includes('Authentication failed')) {
      doLogout();
    }
  }, [error, doLogout]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // --- SUB-COMPONENTS RENDER LAYERS ---

  const NavLink = ({ item }) => {
    const isActive = activePath === item.path;
    const { state: chatState } = useChat();
    const totalUnread = Object.values(chatState.unreadCounts).reduce((sum, count) => sum + count, 0);

    return (
      <Link
        to={item.path}
        className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-colors duration-200 rounded-lg group ${isActive ? 'text-primary font-medium bg-primary/5' : 'text-muted-foreground hover:text-foreground'
          }`}
      >
        <item.icon size={15} className="shrink-0 stroke-[1.75]" />
        <span className="hidden lg:block">{item.label}</span>
        {item.path === '/chat' && totalUnread > 0 && (
          <span className="h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center font-bold">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </Link>
    );
  };

  const AdminMenu = () => {
    const isAdminPath = activePath.startsWith('/admin');
    return (
      <HeadlessMenu as="div" className="relative">
        <HeadlessMenu.Button className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-colors duration-200 rounded-lg ${isAdminPath ? 'text-secondary font-medium bg-secondary/5' : 'text-muted-foreground hover:text-foreground'
          }`}>
          <Settings size={15} className="shrink-0 stroke-[1.75]" />
          <span className="hidden lg:block">Admin</span>
          <ChevronDown size={12} className="opacity-40" />
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
          <HeadlessMenu.Items className="absolute left-0 mt-2 w-52 origin-top-left bg-card text-foreground border border-border/40 rounded-xl shadow-xl focus:outline-none z-50 p-1">
            {adminNavItems.map((item) => (
              <HeadlessMenu.Item key={item.path}>
                {({ active }) => (
                  <Link to={item.path} className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wide transition-colors ${active ? 'bg-muted text-foreground' : 'text-muted-foreground'
                    }`}>
                    <item.icon className="mr-2.5 h-3.5 w-3.5 stroke-[1.5]" /> {item.label}
                  </Link>
                )}
              </HeadlessMenu.Item>
            ))}
          </HeadlessMenu.Items>
        </Transition>
      </HeadlessMenu>
    );
  };

  const NotificationIcon = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const getIconElement = (type) => {
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

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors border border-transparent hover:border-border/30"
          aria-label="Open notifications overlay panel"
        >
          <Bell size={16} className="stroke-[1.75]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-primary rounded-full h-1.5 w-1.5 animate-pulse" />
          )}
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 bg-background/20 backdrop-blur-xs z-40 md:hidden" onClick={() => setIsOpen(false)} />

            <div className="absolute right-0 top-full mt-2 bg-card border border-border/40 text-foreground rounded-xl shadow-2xl z-50 overflow-hidden w-[calc(100vw-2rem)] max-w-sm md:w-80">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/20">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-foreground font-medium">
                    Logs Feed {unreadCount > 0 && `(${unreadCount})`}
                  </h3>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => { markAllAsRead(); setIsOpen(false); }}
                        className="text-[10px] uppercase tracking-wider font-mono text-primary hover:underline flex items-center gap-1"
                      >
                        <CheckCheck size={12} /> Acknowledge All
                      </button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="text-muted-foreground/40 hover:text-foreground transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground/60 font-light space-y-2">
                    <Bell className="mx-auto h-5 w-5 opacity-30 stroke-[1.25]" />
                    <p>Activity log empty</p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification._id}
                        onClick={() => {
                          if (!notification.read) markAsRead(notification._id);
                          setIsOpen(false);
                          if (['exchange_request', 'exchange_rejected', 'exchange_accepted', 'exchange_completed', 'session_scheduled'].includes(notification.type)) navigate('/exchanges');
                          else if (notification.type === 'message') navigate('/chat');
                          else if (notification.type === 'review_received') navigate('/reviews');
                          else if (['account_deactivated', 'account_activated', 'account_deleted'].includes(notification.type)) navigate('/settings');
                        }}
                        className={`p-3 rounded-lg cursor-pointer text-left border transition-all ${!notification.read ? 'border-primary/20 bg-primary/[0.02]' : 'border-transparent hover:bg-muted/40'
                          }`}
                      >
                        <div className="flex gap-2.5 items-start">
                          <span className="text-sm shrink-0 mt-0.5">{getIconElement(notification.type)}</span>
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <h4 className={`text-xs truncate tracking-tight ${!notification.read ? 'font-medium text-foreground' : 'font-light text-muted-foreground'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-[11px] text-muted-foreground/70 truncate font-light">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {notifications.length > 0 && (
                  <div className="pt-2 border-t border-border/20">
                    <button
                      onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                      className="block w-full text-center py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg bg-background/50 hover:bg-muted transition-colors border border-border/10"
                    >
                      All Notifications
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const UserProfileMenu = () => (
    <HeadlessMenu as="div" className="relative">
      <HeadlessMenu.Button className="flex items-center gap-2 p-1 border border-border/40 bg-card rounded-full hover:border-foreground/20 transition-colors">
        <img
          src={user.profilePic?.url || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
          alt={user.name}
          loading="lazy"
          className="w-7 h-7 rounded-full object-cover filter grayscale"
        />
        <div className="hidden lg:flex flex-col text-left pr-1.5 space-y-0">
          <span className="font-medium text-xs text-foreground truncate max-w-[90px]">{user.name || 'User'}</span>
        </div>
        <ChevronDown size={12} className="text-muted-foreground/60 hidden lg:block mr-1.5" />
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
        <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-card text-foreground border border-border/40 rounded-xl shadow-xl z-50 p-1 divide-y divide-border/20">
          <div className="py-1">
            <HeadlessMenu.Item>
              {({ active }) => (
                <Link to="/me" className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wide transition-colors ${active ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  }`}>
                  <User className="mr-2.5 h-3.5 w-3.5 stroke-[1.5]" /> Profile
                </Link>
              )}
            </HeadlessMenu.Item>
            <HeadlessMenu.Item>
              {({ active }) => (
                <Link to="/settings" className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wide transition-colors ${active ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  }`}>
                  <Settings className="mr-2.5 h-3.5 w-3.5 stroke-[1.5]" /> Settings
                </Link>
              )}
            </HeadlessMenu.Item>
            <HeadlessMenu.Item>
              {({ active }) => (
                <Link to="/reviews" className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wide transition-colors ${active ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  }`}>
                  <Star className="mr-2.5 h-3.5 w-3.5 stroke-[1.5]" /> My Reviews
                </Link>
              )}
            </HeadlessMenu.Item>
          </div>
          <div className="pt-1">
            <HeadlessMenu.Item>
              {({ active }) => (
                <button onClick={() => doLogout()} disabled={loggingOut} className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wide transition-colors font-medium text-destructive ${active ? 'bg-destructive/10' : ''
                  }`}>
                  <LogOut className="mr-2.5 h-3.5 w-3.5 stroke-[1.5]" /> {loggingOut ? 'Disconnecting...' : 'Logout'}
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
      <Link to="/login" className="flex items-center gap-1.5 px-4 h-9 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
        <User size={14} /> <span>Login</span>
      </Link>
      <Link to="/register" className="flex items-center gap-1.5 px-4 h-9 text-xs font-mono uppercase tracking-wider bg-foreground text-background hover:opacity-90 rounded-lg transition-opacity shadow-sm">
        <UserPlus size={14} /> <span>Sign Up</span>
      </Link>
    </div>
  );

  const ThemeToggle = ({ isMobile = false }) => {
    const cycleTheme = () => {
      const themes = ['light', 'dark', 'system'];
      const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    };

    if (isMobile) {
      return (
        <button onClick={cycleTheme} className="flex items-center justify-between w-full p-3 rounded-xl border border-border/30 bg-card text-xs font-mono uppercase tracking-wider text-foreground">
          <span className="flex items-center gap-3">
            {theme === 'light' && <Sun size={16} />}
            {theme === 'dark' && <Moon size={16} />}
            {theme === 'system' && <Monitor size={16} />}
            Switch Theme
          </span>
          <span className="text-muted-foreground/60 normal-case">{theme}</span>
        </button>
      );
    }

    return (
      <button onClick={cycleTheme} className="p-2.5 rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors border border-transparent hover:border-border/30 flex items-center justify-center relative w-9 h-9">
        {theme === 'light' && <Sun size={16} className="stroke-[1.75]" />}
        {theme === 'dark' && <Moon size={16} className="stroke-[1.75]" />}
        {theme === 'system' && <Monitor size={16} className="stroke-[1.75]" />}
      </button>
    );
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">

          {/* Logo Frame */}
          <Link
            to="/"
            className="flex items-center gap-3.5 group relative select-none focus-visible:outline-none"
            aria-label="SkillExchange Home Coordinates"
          >
            {/* VISUAL GEOMETRIC HANDSHAKE MARQUE */}
            <div className="relative w-8 h-8 flex items-center justify-center transition-transform duration-500 ease-[0.16, 1, 0.3, 1] group-hover:scale-[1.04]">

              {/* Base Shifting Anchor (Skill Left) */}
              <div className="absolute left-0 w-5 h-5 rounded-md border border-primary/30 bg-primary/5 rotate-45 transition-transform duration-500 ease-[0.16, 1, 0.3, 1] group-hover:rotate-[135deg] group-hover:border-primary/60" />

              {/* Intersecting Trajectory Anchor (Exchange Right) */}
              <div className="absolute right-0 w-5 h-5 rounded-md border border-secondary/40 bg-secondary/10 rotate-45 mix-blend-difference dark:mix-blend-screen transition-transform duration-500 ease-[0.16, 1, 0.3, 1] group-hover:rotate-[-45deg] group-hover:border-secondary/70" />

              {/* Central Core Handshake Node */}
              <div className="absolute h-1.5 w-1.5 rounded-full bg-foreground border border-background shadow-xs relative z-10" />
            </div>

            {/* TYPOGRAPHY BRAND MARK SYSTEM STRING */}
            <span className="hidden sm:block font-sans text-base tracking-[-0.03em] text-foreground transition-colors duration-200">
              <span className="font-light text-muted-foreground/80 group-hover:text-foreground transition-colors">Skill</span>
              <span className="font-semibold text-foreground">Exchange</span>
              <span className="text-primary font-black inline-block ml-0.5 animate-pulse">.</span>
            </span>
          </Link>

          {/* Desktop/Tablet Middle Navigation Array */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) =>
                item.type === 'admin-dropdown' ? (
                  <AdminMenu key={item.label} />
                ) : (
                  <NavLink key={item.path} item={item} />
                )
              )}
            </div>
          )}

          {/* Right Core Action Quadrants */}
          <div className="hidden md:flex items-center gap-2">
            {isLoading ? (
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
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

          {/* Mobile Panel Triggers */}
          <div className="md:hidden flex items-center gap-2">
            {user && <NotificationIcon />}
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-muted-foreground hover:text-foreground">
              <Menu size={20} />
            </button>
          </div>

        </div>
      </nav>

      {/* --- SLEEK RESPONSIVE MOBILE ACCORDION OVERLAY PANEL --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/40 backdrop-blur-xs z-50 md:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 35 }}
              className="fixed top-0 right-0 h-full w-72 bg-card text-foreground border-l border-border/40 shadow-2xl z-50 md:hidden flex flex-col p-6 space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-border/20">
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground/60">Navigation Console</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Active Core Links Array Grid */}
              {user && (
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[50vh] pr-1 scrollbar-none">
                  {navigationItems.map((item) => {
                    if (item.type === 'admin-dropdown') {
                      return (
                        <div key={item.label} className="pt-4 border-t border-border/10 mt-2 space-y-1">
                          <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40 font-medium">Administrative Core</p>
                          {adminNavItems.map(adminItem => {
                            const isActive = activePath === adminItem.path;
                            return (
                              <Link key={adminItem.path} to={adminItem.path} className={`flex items-center gap-4 p-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-muted-foreground'
                                }`}>
                                <adminItem.icon size={16} /> {adminItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      );
                    }
                    const isActive = activePath === item.path;
                    return (
                      <Link key={item.path} to={item.path} className={`flex items-center gap-4 p-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-muted-foreground'
                        }`}>
                        <item.icon size={16} /> {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Mobile Footer Status Blocks Panel controls */}
              <div className="mt-auto space-y-4 pt-4 border-t border-border/20">
                <ThemeToggle isMobile={true} />

                {isLoading ? (
                  <div className="w-full h-12 bg-muted rounded-xl animate-pulse" />
                ) : user ? (
                  <div className="flex flex-col gap-1.5 pt-2">
                    <Link to="/me" className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border/30 mb-2">
                      <img src={user.profilePic?.url || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-8 h-8 rounded-full object-cover filter grayscale" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs truncate text-foreground">{user.name}</div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50">View Workspace</div>
                      </div>
                    </Link>

                    <button onClick={() => doLogout()} disabled={loggingOut} className="flex items-center gap-3 w-full p-3 rounded-xl text-xs font-mono uppercase tracking-wider text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50">
                      <LogOut size={15} /> {loggingOut ? 'Disconnecting...' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-border/40 text-xs font-mono uppercase tracking-wider text-foreground hover:bg-muted/50 transition-colors">
                      <User size={15} /> <span>Login</span>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-foreground text-background text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm">
                      <UserPlus size={15} /> <span>Sign Up</span>
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