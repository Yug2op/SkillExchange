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
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Users,
  Eye,
  Star,
  ArrowRight,
  Loader2
} from 'lucide-react';

const statusConfig = {
  pending: {
    color: 'bg-secondary text-foreground border-border/40',
    icon: Clock,
    label: 'Pending',
    description: 'Waiting for response'
  },
  accepted: {
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: CheckCircle2,
    label: 'Accepted',
    description: 'Ready to schedule'
  },
  rejected: {
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: XCircle,
    label: 'Rejected',
    description: 'Exchange declined'
  },
  completed: {
    color: 'bg-secondary text-primary border-primary/20',
    icon: Award,
    label: 'Completed',
    description: 'Successfully finished'
  },
  cancelled: {
    color: 'bg-muted text-muted-foreground border-border/10',
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

  // Filter and sort exchanges matrix safely
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

    // Sort loops
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

  // Calculate stats parameters
  const stats = useMemo(() => {
    return {
      total: exchanges.length,
      pending: exchanges.filter(e => e.status?.toLowerCase() === 'pending').length,
      accepted: exchanges.filter(e => e.status?.toLowerCase() === 'accepted').length,
      completed: exchanges.filter(e => e.status?.toLowerCase() === 'completed').length,
      rejected: exchanges.filter(e => e.status?.toLowerCase() === 'rejected').length,
    };
  }, [exchanges]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground max-w-7xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-12">
          <div className="h-10 bg-muted rounded-xl w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 bg-muted rounded w-1/2" />
                <div className="h-24 bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="text-center max-w-sm space-y-6">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-medium tracking-tight">Sync Failure</h3>
            <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">Something went wrong loading your exchanges. Please try again.</p>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full text-xs uppercase tracking-widest font-medium py-5 rounded-lg bg-foreground text-background">
            Re-index Transaction Array
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        
        {/* TOP LEVEL ROUTING COMPONENT HEADER BLOCK */}
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-light tracking-tighter leading-none flex items-center gap-3">
              <Users className="h-7 w-7 text-primary stroke-[1.25]" /> My Exchanges.
            </h1>
            <p className="text-sm text-muted-foreground font-light">
              Manage your skill exchange requests and active session logs natively.
            </p>
          </div>

          <Button asChild variant="outline" className="text-xs uppercase tracking-widest font-medium h-11 px-5 border border-border/40 hover:bg-muted/60 bg-card text-foreground rounded-lg gap-2 self-start sm:self-auto transition-all">
            <Link to="/search">
              <Plus className="h-3.5 w-3.5" /> Find New Exchange
            </Link>
          </Button>
        </motion.div>

        {/* CORE ANALYTICS METRIC BAR PANELS */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <div className="p-5 border border-border/30 bg-card rounded-xl">
            <div className="text-2xl font-light text-foreground">{stats.total}</div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Total Tracks</div>
          </div>
          <div className="p-5 border border-border/30 bg-card rounded-xl">
            <div className="text-2xl font-light text-secondary">{stats.pending}</div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Pending Sync</div>
          </div>
          <div className="p-5 border border-border/30 bg-card rounded-xl">
            <div className="text-2xl font-light text-primary">{stats.accepted}</div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Accepted Hubs</div>
          </div>
          <div className="p-5 border border-border/30 bg-card rounded-xl">
            <div className="text-2xl font-light text-foreground">{stats.completed}</div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Completed Logs</div>
          </div>
          <div className="p-5 border border-border/30 bg-card rounded-xl col-span-2 sm:col-span-1">
            <div className="text-2xl font-light text-muted-foreground/60">{stats.rejected}</div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Declined Matrices</div>
          </div>
        </motion.div>

        {/* CONTROLS STRIATION FILTER FORM INPUTS BAR */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-4 pt-2">
          <div className="relative flex-1 border-b border-border/60 focus-within:border-foreground transition-colors duration-200 py-1.5 group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Query logs by name, skillsets, or message arrays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent pl-7 pr-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-10 rounded-lg bg-card border-border/40 focus:ring-0">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-border/40">
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-10 rounded-lg bg-card border-border/40 focus:ring-0">
                <SelectValue placeholder="Sort Array" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-border/40">
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="status">By State Alpha</SelectItem>
                <SelectItem value="name">By Peer Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* TAB MATRIX CHANNELS DISPLAY MANAGEMENT */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <Tabs defaultValue="all" className="w-full space-y-8">
            <TabsList className="w-full h-auto p-0 bg-transparent border-b border-border/30 rounded-none justify-start gap-4">
              <TabsTrigger value="all" className="h-10 px-4 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs font-medium uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all">
                All Transactions ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="active" className="h-10 px-4 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs font-medium uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all">
                Active Vectors ({stats.pending + stats.accepted})
              </TabsTrigger>
              <TabsTrigger value="completed" className="h-10 px-4 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs font-medium uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all">
                Resolved Logs ({stats.completed})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8 outline-none">
              <ExchangeList exchanges={filteredExchanges} currentUserId={currentUserId} />
            </TabsContent>

            <TabsContent value="active" className="mt-8 outline-none">
              <ExchangeList
                exchanges={filteredExchanges.filter(e => ['pending', 'accepted'].includes(e.status?.toLowerCase()))}
                currentUserId={currentUserId}
              />
            </TabsContent>

            <TabsContent value="completed" className="mt-8 outline-none">
              <ExchangeList
                exchanges={filteredExchanges.filter(e => e.status?.toLowerCase() === 'completed')}
                currentUserId={currentUserId}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
        
      </div>
    </div>
  );
}

function ExchangeList({ exchanges, currentUserId }) {
  // Parallel asynchronous lookup array resolved cleanly outside component layout map loops
  const { data: reviewChecks } = useQuery({
    queryKey: ['review-checks', currentUserId, exchanges.map(e => e._id).join(',')],
    queryFn: async () => {
      if (!currentUserId || exchanges.length === 0) return {};
      const completedExchanges = exchanges.filter(e => e.status === 'completed');
      if (completedExchanges.length === 0) return {};
      
      const results = await Promise.all(completedExchanges.map(exchange => checkReviewExists(exchange._id)));
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
      <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 max-w-sm mx-auto space-y-4">
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          No transactional exchange trajectories mapped within the active parameters configuration.
        </p>
        <Button asChild variant="link" className="text-xs uppercase tracking-wider font-medium text-primary">
          <Link to="/search">Scan Network Nodes</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
      <AnimatePresence mode="popLayout">
        {exchanges.map((exchange, index) => {
          const isSender = exchange.sender._id === currentUserId;
          const otherUser = isSender ? exchange.receiver : exchange.sender;
          const direction = isSender ? 'sent' : 'received';
          
          const title = isSender
            ? `You want to learn ${exchange.skillRequested} from ${exchange.receiver.name}`
            : `${exchange.sender.name} wants to learn ${exchange.skillRequested} from you`;
          const subtitle = `In exchange for ${exchange.skillOffered}`;

          const statusInfo = statusConfig[exchange.status?.toLowerCase()] || statusConfig.pending;
          const StatusIcon = statusInfo.icon;
          const hasReview = reviewChecks?.[exchange._id] || false;

          return (
            <motion.div
              key={exchange._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col justify-between"
            >
              <div>
                {/* HEAD LINE COMPONENT META STRIP */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl border border-border/30 flex items-center justify-center text-muted-foreground ${
                      direction === 'sent' ? 'bg-background' : 'bg-card'
                    }`}>
                      <Plus className={`h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45 ${direction === 'sent' ? 'text-primary' : 'text-secondary'}`} />
                    </div>

                    <div className="space-y-0.5">
                      <Badge variant="outline" className={`text-[9px] uppercase font-mono tracking-widest py-0.5 px-2 rounded ${statusInfo.color}`}>
                        <StatusIcon className="h-2.5 w-2.5" /> {statusInfo.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right text-[10px] font-mono font-light text-muted-foreground/40 uppercase tracking-wider">
                    {format(new Date(exchange.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>

                {/* PROFILE IDENTIFIER MATRIX SUBROW */}
                <div className="flex items-center gap-3 my-4">
                  <Avatar className="h-7 w-7 filter grayscale group-hover:grayscale-0 transition-all duration-500 rounded-full ring-1 ring-border/20">
                    <AvatarImage src={otherUser.profilePic?.url} />
                    <AvatarFallback className="text-[10px] font-mono">{otherUser.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-foreground">{otherUser.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-light">
                      <Star className="h-2.5 w-2.5 fill-secondary text-secondary" />
                      <span>{otherUser.rating?.average?.toFixed(1) || '0.0'} ({otherUser.rating?.count || 0})</span>
                    </div>
                  </div>
                </div>

                {/* EXCHANGE CORE STATEMENT TEXT */}
                <div className="space-y-1.5 mt-2 mb-4">
                  <h3 className="text-sm font-medium tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug pr-2">{title}</h3>
                  <p className="text-xs text-muted-foreground/80 font-light truncate">{subtitle}</p>
                </div>

                {/* OPTIONAL CONTEXT LOG MESSAGE EMBEDS */}
                {exchange.message && (
                  <p className="text-xs text-muted-foreground/60 font-light leading-relaxed italic bg-card border border-border/20 p-3 rounded-xl line-clamp-2 mb-4">
                    "{exchange.message}"
                  </p>
                )}

                {/* CALENDAR ACTIVE SCHEDULE METRIC LABELS */}
                {exchange.scheduledSessions && exchange.scheduledSessions.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-primary font-medium bg-primary/[0.03] border border-primary/10 rounded-lg p-2 mb-4 w-fit">
                    <Calendar className="h-3 w-3 stroke-[2]" />
                    <span>{exchange.scheduledSessions.length} Session Sequence Scheduled</span>
                  </div>
                )}
              </div>

              {/* CORE BACKPLANE CTAS NAVIGATION ASSIGNMENTS FOOTPRINT */}
              <div className="flex items-center gap-6 pt-3 border-t border-border/30 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <Link to={`/exchanges/${exchange._id}`} className="text-xs font-medium uppercase tracking-widest text-foreground hover:text-primary flex items-center gap-1.5 group/link">
                  View Details <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                </Link>
                
                {exchange.status === 'completed' && !hasReview && (
                  <Link to={`/reviews/create/${exchange._id}`} className="text-xs font-medium uppercase tracking-widest text-secondary hover:text-foreground flex items-center gap-1.5 ml-auto transition-colors">
                    <Star className="h-3.5 w-3.5 stroke-[1.5]" /> Write Review
                  </Link>
                )}
              </div>

            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}