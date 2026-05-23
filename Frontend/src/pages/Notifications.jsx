import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import { toast } from 'sonner';
import { useMe } from '@/hooks/useMe';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Icons
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  X,
  Loader2,
  ArrowLeftRight,
  XCircle,
  CheckCircle2,
  Trophy,
  MessageSquare,
  Star,
  MinusCircle,
  AlertOctagon,
  Calendar,
  AlertCircle
} from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';

export default function Notifications() {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch all notifications from your endpoint array
  const { data: notificationsData, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/api/notifications');
      return response.data.data;
    },
    enabled: !!user,
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  // Update displayed notifications when data changes safely
  useEffect(() => {
    if (notifications.length > 0) {
      setDisplayedNotifications(notifications.slice(0, visibleCount));
    }
  }, [notifications, visibleCount]);

  // Premium Context Icon Resolution Matrix instead of loose emojis
  const getNotificationIcon = (type) => {
    const defaultClasses = "h-4 w-4 stroke-[1.5]";
    switch (type) {
      case 'exchange_request': 
        return <ArrowLeftRight className={`${defaultClasses} text-primary`} />;
      case 'exchange_rejected': 
        return <XCircle className={`${defaultClasses} text-destructive`} />;
      case 'exchange_accepted': 
        return <CheckCircle2 className={`${defaultClasses} text-secondary`} />;
      case 'exchange_completed': 
        return <Trophy className={`${defaultClasses} text-primary`} />;
      case 'message': 
        return <MessageSquare className={`${defaultClasses} text-secondary`} />;
      case 'review_received': 
        return <Star className={`${defaultClasses} text-primary fill-primary/10`} />;
      case 'account_deactivated': 
        return <MinusCircle className={`${defaultClasses} text-muted-foreground`} />;
      case 'account_activated': 
        return <CheckCircle2 className={`${defaultClasses} text-secondary`} />;
      case 'account_deleted': 
        return <AlertOctagon className={`${defaultClasses} text-destructive`} />;
      case 'session_scheduled': 
        return <Calendar className={`${defaultClasses} text-primary`} />;
      default: 
        return <Bell className={`${defaultClasses} text-muted-foreground`} />;
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

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (
      notification.type === 'exchange_request' || 
      notification.type === 'exchange_rejected' || 
      notification.type === 'exchange_accepted' ||
      notification.type === 'exchange_completed' ||
      notification.type === 'session_scheduled'
    ) {
      navigate('/exchanges');
    } else if (notification.type === 'message') {
      navigate('/chat');
    } else if (notification.type === 'review_received') {
      navigate('/me');
    } else if (
      notification.type === 'account_deactivated' ||
      notification.type === 'account_activated' ||
      notification.type === 'account_deleted'
    ) {
      navigate('/settings');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 10);
      setLoadingMore(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <BrandLoader/>
          </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="text-center max-w-sm space-y-6">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-medium tracking-tight">Sync Failure</h3>
            <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">
              There was an error compiling your active notifications feed. Please re-verify network states.
            </p>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full text-xs uppercase tracking-widest font-medium py-5 rounded-lg bg-foreground text-background">
            Retry Connection Pipeline
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        
        {/* INTERFACE ACTION UTILITY HEADER BLOCK */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
        >
          <div className="space-y-2">
            <Button variant="ghost" size="sm" asChild className="text-xs uppercase tracking-widest font-medium h-9 px-3 -ml-3 hover:bg-muted/60">
              <Link to="/">
                <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Return
              </Link>
            </Button>
            <div className="pt-2">
              <h1 className="text-4xl font-light tracking-tighter leading-none">Notifications.</h1>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 mt-3">
                {unreadCount > 0 ? `${unreadCount} unread system entries` : 'All matrices synchronized'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              className="text-xs uppercase tracking-widest font-medium h-11 px-4 border border-border/40 hover:bg-muted/60 rounded-lg gap-2 self-start sm:self-auto transition-all"
            >
              <CheckCheck className="h-3.5 w-3.5 text-secondary" />
              Acknowledge All
            </Button>
          )}
        </motion.div>

        {/* NOTIFICATIONS CONTAINER ROW ARRAY LIST */}
        <div className="pt-4">
          {displayedNotifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.99 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="border border-border/30 bg-card rounded-2xl py-20 text-center max-w-md mx-auto space-y-4"
            >
              <div className="p-3 w-fit rounded-xl bg-muted border border-border/10 mx-auto text-muted-foreground/40">
                <Bell className="h-5 w-5 stroke-[1.25]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium tracking-tight">Activity Log Empty</h3>
                <p className="text-xs text-muted-foreground/70 font-light max-w-xs mx-auto leading-relaxed">
                  When direct request alignments, system events, or handshakes process, logs compile here.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {displayedNotifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.2), ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className={`relative flex items-start gap-4 p-5 rounded-xl border bg-card transition-all duration-300 group cursor-pointer ${
                        !notification.read 
                          ? 'border-primary/40 shadow-sm shadow-primary/5 bg-gradient-to-r from-primary/[0.02] to-transparent' 
                          : 'border-border/30 hover:border-border'
                      }`}
                    >
                      {/* Left Micro Type Graphic Identifier Node */}
                      <div className="mt-0.5 p-2 rounded-lg bg-background border border-border/20 shadow-sm group-hover:scale-105 transition-transform duration-200">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content Structure Wrapper Layout */}
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className={`text-sm tracking-tight truncate pr-2 transition-colors ${
                            !notification.read ? 'font-medium text-foreground' : 'font-light text-muted-foreground'
                          }`}>
                            {notification.title}
                          </h4>
                          
                          {/* Top corner active unread dot indicator layer */}
                          {!notification.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />
                          )}
                        </div>

                        <p className={`text-xs leading-relaxed font-light ${
                          !notification.read ? 'text-muted-foreground' : 'text-muted-foreground/60'
                        }`}>
                          {notification.message}
                        </p>

                        {/* Card metadata tracking subrow footprint */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[10px] font-mono tracking-wide text-muted-foreground/40 font-light">
                            {formatTime(notification.createdAt)}
                          </span>
                          
                          {/* Segment dynamic tracking badge categories mapping */}
                          {['exchange_request', 'review_received', 'message'].includes(notification.type) && (
                            <span className="text-[9px] uppercase tracking-widest font-mono font-medium text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                              {notification.type === 'exchange_request' && 'Request'}
                              {notification.type === 'review_received' && 'Evaluation'}
                              {notification.type === 'message' && 'Conversation'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* PAGINATION LOADER INTERFACE ACTION ROW */}
              {displayedNotifications.length < notifications.length && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-6">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    variant="ghost"
                    className="text-xs uppercase tracking-widest font-medium py-5 px-6 border border-border/40 hover:bg-muted/60 rounded-lg gap-2.5 transition-colors"
                  >
                    {loadingMore ? (
                      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                            <BrandLoader/>
                          </div>
                    ) : (
                      <>
                        See More Notifications
                        <span className="text-[10px] font-mono text-muted-foreground/50">
                          ({notifications.length - displayedNotifications.length} entries remaining)
                        </span>
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* COMPREHENSIVE ARRAY LOAD COMPLETE FOOTPRINT METRIC */}
              {displayedNotifications.length >= notifications.length && notifications.length > 10 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-8">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40 font-light">
                    Directory End — Displaying full array of {notifications.length} logs
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}