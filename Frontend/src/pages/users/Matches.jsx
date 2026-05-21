import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getMatches } from '@/api/UserApi';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  Search,
  Filter,
  Users,
  Sparkles,
  Target,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  UserPlus,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

function MatchScoreTooltip({ match }) {
  return (
    <div className="absolute z-50 w-72 p-4 bg-card rounded-xl shadow-xl border border-border/60 -top-2 left-full ml-4 animate-fade-in-up backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/30 pb-2">
          <span className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Match Weighting</span>
          <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${getMatchScoreColor(match.matchScore)}`}>
            {Math.round(match.matchScore)}%
          </span>
        </div>

        <div className="space-y-3">
          {/* Skill Score */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-light">
              <span className="text-muted-foreground flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-primary" /> Skill Alignment</span>
              <span className="font-mono text-foreground">{Math.round(match.user.skillScore || 0)}/60</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${(match.user.skillScore / 60) * 100}%` }} />
            </div>
          </div>

          {/* Recency Score */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-light">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3 text-secondary" /> Activity Factor </span>
              <span className="font-mono text-foreground">{Math.round(match.user.recencyScore || 0)}/20</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-secondary transition-all" style={{ width: `${(match.user.recencyScore / 20) * 100}%` }} />
            </div>
          </div>

          {/* Location Score */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-light">
              <span className="text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3 text-primary" /> Location Factor</span>
              <span className="font-mono text-foreground">{Math.round(match.user.locationScore || 0)}/10</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${(match.user.locationScore / 10) * 100}%` }} />
            </div>
          </div>

          {/* Rating Score */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-light">
              <span className="text-muted-foreground flex items-center gap-1.5"><Star className="h-3 w-3 text-secondary" /> Rating Factor</span>
              <span className="font-mono text-foreground">{Math.round(match.user.ratingScore || 0)}/10</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-secondary transition-all" style={{ width: `${(match.user.ratingScore / 10) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Skills arrays rendered matching our plain separator architecture */}
        {match.user.canTeachYou && match.user.canTeachYou.length > 0 && (
          <div className="pt-2 border-t border-border/30 text-[11px] font-light">
            <span className="font-medium text-foreground mr-1.5">Teaches:</span>
            <span className="text-muted-foreground">{match.user.canTeachYou.map(s => s.skill).join(', ')}</span>
          </div>
        )}

        {match.user.wantsToLearn && match.user.wantsToLearn.length > 0 && (
          <div className="pt-1 text-[11px] font-light">
            <span className="font-medium text-foreground mr-1.5">Wants:</span>
            <span className="text-muted-foreground">{match.user.wantsToLearn.map(s => s.skill).join(', ')}</span>
          </div>
        )}
      </div>

      <div className="absolute top-4 -left-1.5 w-3 h-3 bg-card border-l border-t border-border/40 transform rotate-45" />
    </div>
  );
}

function getMatchScoreColor(score) {
  if (score >= 80) return 'text-primary bg-primary/10';
  if (score >= 60) return 'text-secondary bg-secondary/10';
  return 'text-muted-foreground bg-muted';
}

export default function MatchesPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('matchScore');
  const [filterBy, setFilterBy] = useState('all');
  const limit = 12;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users-matches', { page, limit, sortBy }], 
    queryFn: () => getMatches({ page, limit, sortBy }), 
    keepPreviousData: true,
    onError: (err) => toast.error('Failed to load matches', { description: err?.message || 'Try again later.' })
  });

  const allMatches = data?.data?.matches || [];

  const filteredMatches = useMemo(() => {
    if (filterBy === 'all') return allMatches;
    if (filterBy === 'high') return allMatches.filter(m => m.matchScore >= 80);
    if (filterBy === 'medium') return allMatches.filter(m => m.matchScore >= 50 && m.matchScore < 80);
    if (filterBy === 'fair') return allMatches.filter(m => m.matchScore < 50);
    return allMatches;
  }, [allMatches, filterBy]);

  const sortedMatches = useMemo(() => {
    const matches = [...filteredMatches];
    switch (sortBy) {
      case 'matchScore':
        return matches.sort((a, b) => b.matchScore - a.matchScore);
      case 'rating':
        return matches.sort((a, b) => (b.user.rating?.average || 0) - (a.user.rating?.average || 0));
      case 'recent':
        return matches.sort((a, b) => new Date(b.user.lastActiveAt || 0) - new Date(a.user.lastActiveAt || 0));
      default:
        return matches;
    }
  }, [filteredMatches, sortBy]);

  const pagination = data?.pagination || {};
  const totalPages = pagination.pages || 1;

  const allStats = useMemo(() => {
    return {
      total: allMatches.length,
      high: allMatches.filter(m => m.matchScore >= 80).length,
      medium: allMatches.filter(m => m.matchScore >= 50 && m.matchScore < 80).length,
      fair: allMatches.filter(m => m.matchScore < 50).length
    };
  }, [allMatches]);

  const filteredStats = useMemo(() => {
    return {
      total: sortedMatches.length,
      high: sortedMatches.filter(m => m.matchScore >= 80).length,
      medium: sortedMatches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length,
      fair: sortedMatches.filter(m => m.matchScore < 60).length
    };
  }, [sortedMatches]);

  const handleFilterChange = (value) => {
    setFilterBy(value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground max-w-7xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-12">
          <div className="h-10 bg-muted rounded-xl w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-16 bg-muted rounded-lg" />
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
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm space-y-6">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-medium tracking-tight">Data Stream Error</h3>
            <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">{error?.message || 'Failed loading matches array.'}</p>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full text-xs uppercase tracking-widest font-medium py-5 rounded-lg bg-foreground text-background">
            Reload
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        
        {/* TOP COMPONENT HEADER BLOCK */}
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-light tracking-tighter leading-none">Perfect Matches.</h1>
            <p className="text-sm text-muted-foreground font-light">Discover Users mapped with high precision scores.</p>
          </div>
          <Button asChild variant="outline" className="text-xs uppercase tracking-widest font-medium px-5 py-5 border-border/60 hover:bg-muted bg-card text-foreground rounded-lg self-start sm:self-auto transition-colors">
            <Link to="/search" className="flex items-center gap-2"><Search className="h-3.5 w-3.5" /> Discovery Mode</Link>
          </Button>
        </motion.div>

        {/* EMBEDDED SYSTEM METRIC DATA OVERLAYS */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          <div className={`p-6 border rounded-xl bg-card transition-all ${filterBy === 'all' ? 'border-primary' : 'border-border/30'}`}>
            <div className="text-3xl font-light text-foreground">{filterBy === 'all' ? filteredStats.total : allStats.total}</div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Total Coordinates</div>
          </div>
          <div className={`p-6 border rounded-xl bg-card transition-all ${filterBy === 'high' ? 'border-primary' : 'border-border/30'}`}>
            <div className="text-3xl font-light text-primary">{filterBy === 'high' ? filteredStats.total : allStats.high}</div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Excellent (80%+)</div>
          </div>
          <div className={`p-6 border rounded-xl bg-card transition-all ${filterBy === 'medium' ? 'border-secondary' : 'border-border/30'}`}>
            <div className="text-3xl font-light text-secondary">{filterBy === 'medium' ? filteredStats.total : allStats.medium}</div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Good (50-79%)</div>
          </div>
          <div className={`p-6 border rounded-xl bg-card transition-all ${filterBy === 'fair' ? 'border-border' : 'border-border/30'}`}>
            <div className="text-3xl font-light text-muted-foreground">{filterBy === 'fair' ? filteredStats.total : allStats.fair}</div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Fair (&lt;50%)</div>
          </div>
        </motion.div>

        {/* CONTROLS BAR SYSTEM PIPELINE */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground/80">
            <Filter className="h-3.5 w-3.5 text-primary" /> <span>Parameters:</span>
          </div>

          <div className="flex flex-wrap gap-4">
            <Select value={filterBy} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[180px] h-10 rounded-lg bg-card border-border/40 focus:ring-0">
                <SelectValue placeholder="Filter Array" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-border/40">
                <SelectItem value="all">All Matches </SelectItem>
                <SelectItem value="high">Excellent Matches</SelectItem>
                <SelectItem value="medium">Good Matches</SelectItem>
                <SelectItem value="fair">Fair Matches</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] h-10 rounded-lg bg-card border-border/40 focus:ring-0">
                <SelectValue placeholder="Sort Array" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-border/40">
                <SelectItem value="matchScore">Match Score</SelectItem>
                <SelectItem value="rating">User Rating</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>

            {filterBy !== 'all' && (
              <Button variant="ghost" size="sm" onClick={() => handleFilterChange('all')} className="text-xs text-destructive font-medium uppercase tracking-wider hover:bg-destructive/10">
                Clear Filter
              </Button>
            )}
          </div>
        </motion.div>

        {/* DIRECTORY LIST WRAPPER SELECTION LAYER */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full h-auto p-0 bg-transparent border-b border-border/30 rounded-none justify-start">
              <TabsTrigger value="all" className="h-10 px-4 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs font-medium uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all">
                Results ({filteredStats.total})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-10 outline-none focus-visible:ring-0">
              <ExchangeList
                matches={sortedMatches}
                totalPages={totalPages}
                currentPage={page}
                setPage={setPage}
                filterBy={filterBy}
              />
            </TabsContent>
          </Tabs>
        </motion.div>

      </div>
    </div>
  );
}

function ExchangeList({ matches, totalPages, currentPage, setPage, filterBy }) {
  if (matches.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 max-w-sm mx-auto space-y-4">
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          {filterBy !== 'all'
            ? 'Your profile does not meet the designated configuration filter rules.'
            : 'Enhance your profile credentials to initiate high-weighting autonomous peer alignments.'
          }
        </p>
        <Button asChild variant="link" className="text-xs uppercase tracking-wider font-medium text-primary">
          <Link to="/search">Search all</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
        <AnimatePresence mode="popLayout">
          {matches.map((match, index) => {
            const user = match.user;
            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col justify-between"
              >
                <div>
                  {/* Heading Vector & Inline Tooltip Activation Layer */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative group/score">
                        <div className={`w-9 h-9 rounded-xl border border-border/30 flex items-center justify-center cursor-help transition-colors ${getMatchScoreColor(match.matchScore)}`}>
                          <Target className="h-4 w-4 stroke-[1.5]" />
                        </div>
                        {/* Smooth floating overlay tooltip mapping logic */}
                        <div className="invisible group-hover/score:visible opacity-0 group-hover/score:opacity-100 transition-all duration-200">
                          <MatchScoreTooltip match={match} />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className={`inline-flex text-[10px] font-mono font-medium tracking-wider px-2 py-0.5 rounded ${getMatchScoreColor(match.matchScore)}`}>
                          {Math.round(match.matchScore)}% Precision
                        </span>
                        <div className="text-xs font-light text-muted-foreground">
                          {match.matchScore >= 80 ? 'Excellent Match' : match.matchScore >= 50 ? 'Good Match' : 'Satisfactory Match'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground/40 font-light uppercase tracking-wider">Match #{index + 1}</span>
                  </div>

                  {/* Context Meta Identification Frame */}
                  <div className="space-y-2 mt-4 mb-4">
                    <h3 className="text-base font-medium tracking-tight text-foreground group-hover:text-primary transition-colors">{user.name}</h3>
                    <p className="text-sm text-muted-foreground/80 font-light leading-relaxed line-clamp-2 pr-4">{user.bio || 'No descriptive overview recorded.'}</p>
                  </div>

                  {/* Global Location Field Block */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 font-light mb-4">
                    <MapPin className="h-3 w-3" />
                    <span>{user?.location.city ? [user.location.city, user.location.country].filter(Boolean).join(', ') : "Isolated Server Node"}</span>
                  </div>

                  {/* Clean String Separation Lines (Replaces multi-layered badges blocks) */}
                  <div className="space-y-1 text-xs mb-6 pt-1 border-t border-border/20 pt-4">
                    {user.skillsToTeach && user.skillsToTeach.length > 0 && (
                      <p className="text-muted-foreground/60 font-light truncate">
                        <span className="font-medium text-foreground/80 tracking-wide mr-2">Offers:</span>
                        {user.skillsToTeach.map(s => s.skill).join(', ')}
                      </p>
                    )}
                    {user.skillsToLearn && user.skillsToLearn.length > 0 && (
                      <p className="text-muted-foreground/60 font-light truncate">
                        <span className="font-medium text-foreground/80 tracking-wide mr-2">Wants:</span>
                        {user.skillsToLearn.map(s => s.skill).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Micro Action Tracker Bar */}
                <div className="flex items-center gap-6 pt-3 border-t border-border/30 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  <Link to={`/users/${user._id}`} className="text-xs font-medium uppercase tracking-widest text-foreground hover:text-primary flex items-center gap-1.5 group/link">
                    View Profile <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                  <Link to={`/chat/${user._id}`} className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 stroke-[1.5]" /> Connect
                  </Link>
                  
                  <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground font-light">
                    <Star className="h-3 w-3 fill-foreground/5 text-muted-foreground/50" />
                    <span className="font-medium text-foreground/80">{user.rating?.average?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* FOOTER RE-INDEX PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between border-t border-border/30 mt-20 pt-6 text-xs text-muted-foreground">
          <Button variant="ghost" className="text-xs uppercase tracking-wider font-medium hover:bg-muted/60 disabled:opacity-30" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Previous
          </Button>
          
          <div className="hidden sm:flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <Button key={i + 1} variant="ghost" onClick={() => setPage(i + 1)} className={`h-8 w-8 text-xs font-mono rounded-md ${currentPage === i + 1 ? 'bg-foreground text-background font-medium hover:bg-foreground hover:text-background' : 'hover:bg-muted/60'}`}>
                {i + 1}
              </Button>
            ))}
          </div>

          <Button variant="ghost" className="text-xs uppercase tracking-wider font-medium hover:bg-muted/60 disabled:opacity-30" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Next
          </Button>
        </motion.div>
      )}
    </div>
  );
}