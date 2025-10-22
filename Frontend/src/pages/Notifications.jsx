import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import { toast } from 'sonner';
import { useMe } from '@/hooks/useMe';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Icons
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  X,
  Loader2
} from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch all notifications
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

  // Update displayed notifications when data changes
  useEffect(() => {
    if (notifications.length > 0) {
      setDisplayedNotifications(notifications.slice(0, visibleCount));
    }
  }, [notifications, visibleCount]);

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

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      markAsRead(notification._id);
    }

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
      navigate('/me');
    } else if (notification.type === 'account_deactivated' ||
               notification.type === 'account_activated' ||
               notification.type === 'account_deleted') {
      navigate('/settings');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 10);
      setLoadingMore(false);
    }, 500); // Simulate loading delay
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <AlertTitle>Failed to Load Notifications</AlertTitle>
              <AlertDescription>
                There was an error loading your notifications. Please try again later.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4 mb-8"
          >
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-3xl font-bold">All Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-between items-center mb-6"
          >
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all as read
                </Button>
              )}
            </div>
          </motion.div>

          {/* Notifications List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {displayedNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                  <p className="text-muted-foreground">
                    When you receive notifications, they'll appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {displayedNotifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !notification.read ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium ${
                                !notification.read
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className={`text-sm mb-2 ${
                              !notification.read
                                ? 'text-muted-foreground'
                                : 'text-muted-foreground/70'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </p>
                              <div className="flex items-center gap-2">
                                {notification.type === 'exchange_request' && (
                                  <Badge variant="secondary" className="text-xs">
                                    Exchange Request
                                  </Badge>
                                )}
                                {notification.type === 'review_received' && (
                                  <Badge variant="secondary" className="text-xs">
                                    Review
                                  </Badge>
                                )}
                                {notification.type === 'message' && (
                                  <Badge variant="secondary" className="text-xs">
                                    Message
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* Load More Button */}
                {displayedNotifications.length < notifications.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center pt-4"
                  >
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          See More Notifications
                          <span className="text-xs text-muted-foreground">
                            ({notifications.length - displayedNotifications.length} more)
                          </span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                {/* All Notifications Loaded */}
                {displayedNotifications.length >= notifications.length && notifications.length > 10 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4"
                  >
                    <p className="text-sm text-muted-foreground">
                      Showing all {notifications.length} notifications
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
