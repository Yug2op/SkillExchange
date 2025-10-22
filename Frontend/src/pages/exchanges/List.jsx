import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { getMyExchanges } from '@/api/ExchangeApi';
import { checkReviewExists } from '@/api/ReviewApi';
import { useMe } from '@/hooks/useMe';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Icons
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Users,
  TrendingUp,
  MessageSquare,
  Eye,
  Star,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Target,
  User,
  Mail,
  MapPin,
  Video,
  Building,
  Coffee
} from 'lucide-react';

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: Clock,
    label: 'Pending',
    description: 'Waiting for response'
  },
  accepted: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle2,
    label: 'Accepted',
    description: 'Ready to schedule'
  },
  rejected: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: XCircle,
    label: 'Rejected',
    description: 'Exchange declined'
  },
  completed: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Award,
    label: 'Completed',
    description: 'Successfully finished'
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    icon: AlertCircle,
    label: 'Cancelled',
    description: 'Exchange cancelled'
  }
};

export default function ExchangesPage() {
  const { data: meData } = useMe();
  const currentUserId = meData?._id;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['exchanges'],
    queryFn: () => getMyExchanges(),
    onError: (err) => toast.error('Failed to load exchanges', { description: err?.message || 'Try again later.' })
  });
  
  const exchanges = data?.data?.exchanges || [];

  // Filter and sort exchanges
  const filteredExchanges = useMemo(() => {
    let filtered = exchanges.filter(exchange => {
      if (!exchange?._id || !exchange?.sender || !exchange?.receiver) return false;

      // Status filter
      if (statusFilter !== 'all' && exchange.status?.toLowerCase() !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const otherUser = exchange.sender._id === currentUserId ? exchange.receiver : exchange.sender;
        const searchLower = searchQuery.toLowerCase();
        return (
          otherUser.name?.toLowerCase().includes(searchLower) ||
          exchange.skillRequested?.toLowerCase().includes(searchLower) ||
          exchange.skillOffered?.toLowerCase().includes(searchLower) ||
          exchange.message?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Sort exchanges
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'name':
          const aName = a.sender._id === currentUserId ? a.receiver.name : a.sender.name;
          const bName = b.sender._id === currentUserId ? b.receiver.name : b.sender.name;
          return aName.localeCompare(bName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [exchanges, searchQuery, statusFilter, sortBy, currentUserId]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: exchanges.length,
      pending: exchanges.filter(e => e.status?.toLowerCase() === 'pending').length,
      accepted: exchanges.filter(e => e.status?.toLowerCase() === 'accepted').length,
      completed: exchanges.filter(e => e.status?.toLowerCase() === 'completed').length,
      rejected: exchanges.filter(e => e.status?.toLowerCase() === 'rejected').length,
    };
  }, [exchanges]);

  const getExchangeInfo = (exchange) => {
    const isSender = exchange.sender._id === currentUserId;
    const otherUser = isSender ? exchange.receiver : exchange.sender;

    return {
      isSender,
      otherUser,
      direction: isSender ? 'sent' : 'received',
      title: isSender
        ? `You want to learn ${exchange.skillRequested} from ${otherUser.name}`
        : `${otherUser.name} wants to learn ${exchange.skillRequested} from you`,
      subtitle: `In exchange for ${exchange.skillOffered}`
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Failed to Load Exchanges</h2>
            <p className="text-muted-foreground mb-6">
              Something went wrong loading your exchanges. Please try again.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                My Exchanges
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your skill exchange requests and sessions
              </p>
            </div>

            <Button asChild className="gap-2">
              <Link to="/search">
                <Plus className="h-4 w-4" />
                Find New Exchange
              </Link>
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exchanges by name, skills, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
                <SelectItem value="name">By Name</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Exchange Tabs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Exchanges ({stats.total})</TabsTrigger>
                <TabsTrigger value="active">Active ({stats.pending + stats.accepted})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <ExchangeList exchanges={filteredExchanges} currentUserId={currentUserId} />
              </TabsContent>

              <TabsContent value="active" className="mt-6">
                <ExchangeList
                  exchanges={filteredExchanges.filter(e => ['pending', 'accepted'].includes(e.status?.toLowerCase()))}
                  currentUserId={currentUserId}
                />
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <ExchangeList
                  exchanges={filteredExchanges.filter(e => e.status?.toLowerCase() === 'completed')}
                  currentUserId={currentUserId}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Exchange List Component
function ExchangeList({ exchanges, currentUserId }) {

  // ✅ ADD: Move review checks outside the map function
  const { data: reviewChecks } = useQuery({
    queryKey: ['review-checks', currentUserId, exchanges.map(e => e._id).join(',')],
    queryFn: async () => {
      if (!currentUserId || exchanges.length === 0) return {};
      
      const completedExchanges = exchanges.filter(e => e.status === 'completed');
      if (completedExchanges.length === 0) return {};
      
      const reviewPromises = completedExchanges.map(exchange => 
        checkReviewExists(exchange._id)
      );
      
      const results = await Promise.all(reviewPromises);
      const reviewMap = {};
      
      completedExchanges.forEach((exchange, index) => {
        reviewMap[exchange._id] = results[index]?.data?.hasReview || false;
      });
      
      return reviewMap;
    },
    enabled: !!currentUserId && exchanges.length > 0,
  });
  if (exchanges.length === 0) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-16 space-y-4"
      >
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">No exchanges found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {exchanges.length === 0
              ? 'Start by finding someone to exchange skills with!'
              : 'Try adjusting your filters to see more exchanges.'
            }
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/search">
            <Search className="mr-2 h-4 w-4" />
            Find Exchange Partners
          </Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {exchanges.map((exchange, index) => {
          const exchangeInfo = {
            isSender: exchange.sender._id === currentUserId,
            otherUser: exchange.sender._id === currentUserId ? exchange.receiver : exchange.sender,
            direction: exchange.sender._id === currentUserId ? 'sent' : 'received',
            title: exchange.sender._id === currentUserId
              ? `You want to learn ${exchange.skillRequested} from ${exchange.receiver.name}`
              : `${exchange.sender.name} wants to learn ${exchange.skillRequested} from you`,
            subtitle: `In exchange for ${exchange.skillOffered}`
          };

          const statusInfo = statusConfig[exchange.status?.toLowerCase()] || statusConfig.pending;
          const StatusIcon = statusInfo.icon;

          // ✅ FIX: Use the review data instead of calling useQuery
          const hasReview = reviewChecks?.[exchange._id] || false;

          return (
            <motion.div
              key={exchange._id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Direction Indicator */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${exchangeInfo.direction === 'sent'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                        {exchangeInfo.direction === 'sent' ? <ArrowRight className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      </div>

                      <div>
                        {/* Status Badge */}
                        <Badge className={`${statusInfo.color} gap-1 mb-2`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                        <div className="font-semibold text-sm">
                          {exchangeInfo.direction === 'sent' ? 'Sent Request' : 'Received Request'}
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{format(new Date(exchange.createdAt), 'MMM d')}</div>
                      <div>{format(new Date(exchange.createdAt), 'yyyy')}</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* User Information */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={exchangeInfo.otherUser.profilePic?.url || `https://ui-avatars.com/api/?name=${exchangeInfo?.otherUser?.name || 'U'}&background=random`} alt={exchangeInfo.otherUser.name} loading="lazy"/>
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                        {exchangeInfo.otherUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{exchangeInfo.otherUser.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {exchangeInfo.otherUser.rating?.average?.toFixed(1) || '0.0'}
                        ({exchangeInfo.otherUser.rating?.count || 0} reviews)
                      </div>
                    </div>
                  </div>

                  {/* Exchange Details */}
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {exchangeInfo.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {exchangeInfo.subtitle}
                    </p>
                  </div>

                  {/* Message (if exists) */}
                  {exchange.message && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm italic">"{exchange.message}"</p>
                    </div>
                  )}

                  {/* Scheduled Sessions Indicator */}
                  {exchange.scheduledSessions && exchange.scheduledSessions.length > 0 && (
                    <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700 dark:text-blue-300">
                        {exchange.scheduledSessions.length} session{exchange.scheduledSessions.length > 1 ? 's' : ''} scheduled
                      </span>
                    </div>
                  )}
                </CardContent>

                <div className="p-6 pt-0">
                  <Button asChild className="w-full gap-2" variant="outline">
                    <Link to={`/exchanges/${exchange._id}`}>
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </div>
                {exchange.status === 'completed' && !hasReview && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/reviews/create/${exchange._id}`}>
                      <Star className="h-3 w-3 mr-1" />
                      Review
                    </Link>
                  </Button>
                )}
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
