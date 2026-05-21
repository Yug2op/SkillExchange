import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  MapPin,
  Star,
  X,
  TrendingUp,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { searchUsers } from '@/api/UserApi';
import { useMe } from '@/hooks/useMe';
import { usePopularSkills } from '@/hooks/usePopularSkills';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillToLearn, setSkillToLearn] = useState('');
  const [skillToTeach, setSkillToTeach] = useState('');
  const [location, setLocation] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { data: currentUser } = useMe();
  const { data: popularSkillsData } = usePopularSkills();
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minRating: 0,
    sortBy: 'rating',
    availability: 'all'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const popularSkills = popularSkillsData?.data?.popularSkills || [
    'JavaScript', 'Python', 'React', 'Design', 'Marketing',
    'Photography', 'Music', 'Cooking', 'Yoga', 'Spanish',
    'Guitar', 'Drawing', 'Writing', 'Data Science', 'Public Speaking'
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchUsers({
        q: searchQuery,
        teach: skillToTeach,
        learn: skillToLearn,
        location: location,
        page: page,
        limit: 12
      });

      if (response.success) {
        let filteredUsers = response.data.users || [];

        if (currentUser?.id) {
          filteredUsers = filteredUsers.filter(user => user._id !== currentUser.id);
        }

        if (filters.minRating > 0) {
          filteredUsers = filteredUsers.filter(user => user.rating?.average >= filters.minRating);
        }

        if (filters.sortBy === 'rating') {
          filteredUsers.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        } else if (filters.sortBy === 'recent') {
          filteredUsers.sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));
        } else if (filters.sortBy === 'reviews') {
          filteredUsers.sort((a, b) => (b.rating?.count || 0) - (a.rating?.count || 0));
        }

        setUsers(filteredUsers);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setError(response.message || 'Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, skillToTeach, skillToLearn, location, page, filters, currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1);
    setSearchQuery(e?.target?.search?.value || searchQuery);
    fetchUsers();
  };

  const handleSkillClick = (skill, type) => {
    if (type === 'teach') {
      setSkillToTeach(skill);
    } else {
      setSkillToLearn(skill);
    }
    setPage(1);
    fetchUsers();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSkillToTeach('');
    setSkillToLearn('');
    setLocation('');
    setFilters({
      minRating: 0,
      sortBy: 'rating',
      availability: 'all'
    });
    setPage(1);
  };

  const hasActiveFilters = searchQuery || skillToTeach || skillToLearn || location || filters.minRating > 0;

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm space-y-6"
        >
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-medium tracking-tight">Search Disrupted</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">{error}</p>
          </div>
          <Button onClick={fetchUsers} variant="outline" className="text-xs uppercase tracking-wider font-medium w-full py-5 rounded-lg">
            Re-initiate Request
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      
      {/* HEADER SECTION & FLOATING SEARCH ROW */}
      <section className="bg-background border-b border-border/30 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-light tracking-tighter leading-none">Discover.</h1>
                <p className="text-sm text-muted-foreground font-light tracking-wide mt-2">Connect with localized knowledge-swapping peers globally.</p>
              </div>

              {/* Advanced Filter Sheet Drawer Component */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="text-xs uppercase tracking-widest font-medium gap-2.5 h-11 px-4 hover:bg-muted/60 self-start sm:self-auto transition-all">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-1 h-2 w-2 rounded-full bg-secondary" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md bg-card text-foreground border-l border-border/40 flex flex-col justify-between">
                  <div className="space-y-8">
                    <SheetHeader className="text-left">
                      <SheetTitle className="text-xl font-light tracking-tight">Directory Configuration</SheetTitle>
                      <SheetDescription className="text-xs text-muted-foreground/80 font-light">
                        Refine matching boundaries to map custom proficiency structures.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6">
                      {/* Sort Rules Selection */}
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-medium">Sort Hierarchy</Label>
                        <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                          <SelectTrigger className="w-full h-11 rounded-lg bg-background border-border/40 focus:ring-0 focus:border-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card text-foreground border-border/40">
                            <SelectItem value="rating">Highest Performance Rating</SelectItem>
                            <SelectItem value="recent">Recent Active Operations</SelectItem>
                            <SelectItem value="reviews">Deepest Metric Reviews</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Trust Index Slider Mapping */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-medium">Trust Index Threshold</Label>
                          <span className="text-xs font-medium tracking-tight text-primary">{filters.minRating.toFixed(1)} ★ +</span>
                        </div>
                        <Slider
                          value={[filters.minRating]}
                          onValueChange={(value) => setFilters({ ...filters, minRating: value[0] })}
                          max={5}
                          step={0.5}
                          className="w-full py-2"
                        />
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      className="w-full text-xs uppercase tracking-wider font-medium py-6 text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-lg transition-colors"
                      onClick={clearFilters}
                    >
                      Reset Directory Overrides
                    </Button>
                  )}
                </SheetContent>
              </Sheet>
            </div>

            {/* Seamless Grid Form Row Input Structure */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                <div className="relative focus-within:border-foreground transition-colors duration-200 py-1.5 group">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-foreground transition-colors" />
                  <Input
                    name="search"
                    placeholder="Search name, credentials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent pl-7 pr-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/80 font-light"
                  />
                </div>
                <div className="relative focus-within:border-foreground transition-colors duration-200 py-1.5 group">
                  <Input
                    placeholder="Skills desired to learn..."
                    value={skillToLearn}
                    onChange={(e) => setSkillToLearn(e.target.value)}
                    className="border-0 bg-transparent px-6 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/80 font-light"
                  />
                </div>
                <div className="relative focus-within:border-foreground transition-colors duration-200 py-1.5 group">
                  <Input
                    placeholder="Skills offered to teach..."
                    value={skillToTeach}
                    onChange={(e) => setSkillToTeach(e.target.value)}
                    className="border-0 bg-transparent px-6 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/80 font-light"
                  />
                </div>
                <div className="relative focus-within:border-foreground transition-colors duration-200 py-1.5 group">
                  <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-foreground transition-colors" />
                  <Input
                    placeholder="Global parameters / location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-0 bg-transparent pl-6 pr-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/80 font-light"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">

                {/* Tracking active badges layer */}
                {hasActiveFilters && (
                  <div className="hidden md:flex items-center flex-wrap gap-2 animate-fade-in-up">
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-tight bg-muted rounded text-muted-foreground">
                        Q: {searchQuery}
                        <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setSearchQuery('')} />
                      </span>
                    )}
                    {skillToLearn && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-tight bg-muted rounded text-muted-foreground">
                        Wants: {skillToLearn}
                        <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setSkillToLearn('')} />
                      </span>
                    )}
                    {skillToTeach && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-tight bg-muted rounded text-muted-foreground">
                        Offers: {skillToTeach}
                        <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setSkillToTeach('')} />
                      </span>
                    )}
                    {location && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-tight bg-muted rounded text-muted-foreground">
                        Loc: {location}
                        <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setLocation('')} />
                      </span>
                    )}
                    {filters.minRating > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-tight bg-muted rounded text-muted-foreground">
                        Index: {filters.minRating}★+
                        <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setFilters({ ...filters, minRating: 0 })} />
                      </span>
                    )}
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* SECURE SUGGESTION MARGIN POPULAR CHIPS FEED */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-border/20 pb-6"
        >
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground/70 shrink-0">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>Trending Filters:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none text-[11px] tracking-wide font-medium">
            {popularSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillClick(skill, 'learn')}
                className="px-3 py-1.5 border border-border/40 hover:border-foreground rounded-full bg-card/20 hover:bg-muted text-foreground/80 hover:text-foreground shrink-0 transition-all duration-200"
              >
                {skill}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CORE ACTIVE NODE DIRECTORY RESULTS GRID */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 pt-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4 opacity-40 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 space-y-4 max-w-md mx-auto"
          >
            <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">
              No parameters matched your specific sequence rules inside this quadrant. Modify directory inputs to broader thresholds.
            </p>
            <Button onClick={clearFilters} variant="link" className="text-xs uppercase tracking-wider font-medium text-primary">
              Purge Active Restrictions
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 flex items-center justify-between text-xs font-light text-muted-foreground"
            >
              <p>
                Parsed Matrix mapped <span className="font-medium text-foreground">{users.length}</span> corresponding nodes
              </p>
              
              <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                <SelectTrigger className="w-[180px] h-8 bg-transparent border-0 border-b border-border/40 rounded-none text-right focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/40 text-foreground">
                  <SelectItem value="rating">Top Rated Index</SelectItem>
                  <SelectItem value="recent">Activity Indexes</SelectItem>
                  <SelectItem value="reviews">Deep Metrics Feed</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Premium Minimal Grid Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 pt-4">
              <AnimatePresence mode="popLayout">
                {users.map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                    className="group relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Anchor Profile Quick Action Layer */}
                      <Link to={`/users/${user._id}`} className="absolute top-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="h-8 w-8 rounded-full bg-muted/60 hover:bg-foreground hover:text-background flex items-center justify-center transition-colors">
                          <Eye className="h-4 w-4" />
                        </div>
                      </Link>

                      {/* Heading User Row Structure */}
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-11 w-11 group-hover:grayscale-0 transition-all duration-500 rounded-full ring-1 ring-border/40">
                          <AvatarImage src={user.profilePic?.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} alt={user.name} />
                          <AvatarFallback className="text-xs font-medium bg-muted">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-0.5">
                          <Link to={`/users/${user._id}`} className="hover:underline block">
                            <h2 className="text-base font-medium tracking-tight text-foreground group-hover:text-primary transition-colors">{user.name}</h2>
                          </Link>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground/70 font-light">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {user.location?.city ? [user.location.city, user.location.country].filter(Boolean).join(', ') : "NOT PROVIDED"}
                            </span>
                            {user.isEmailVerified && (
                              <span className="text-green-500 flex items-center gap-0.5 font-medium text-[10px] uppercase tracking-widest">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Extended Descriptive Content Blocks */}
                      {user.bio && (
                        <p className="text-sm text-muted-foreground/80 font-light leading-relaxed mb-4 line-clamp-2 pr-4">
                          {user.bio}
                        </p>
                      )}

                      {/* Grid Skill Token Parameter Pipelines */}
                      <div className="space-y-1 text-xs mb-6 pt-1">
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

                    {/* Lower Structural Meta Action Block */}
                    <div className="flex items-center gap-6 pt-3 border-t border-border/30 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                      <Link to={`/exchanges/request/${user._id}`} className="text-xs font-medium uppercase tracking-widest text-foreground hover:text-primary flex items-center gap-1.5 group/link">
                        Exchange
                        <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                      <Link to={`/chat/${user._id}`} className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                        Message
                      </Link>
                      
                      <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground font-light">
                        <Star className="h-3 w-3 fill-foreground/5 text-muted-foreground/60" />
                        <span className="font-medium text-foreground/80">{user.rating?.average?.toFixed(1) || '0.0'}</span>
                        <span className="text-[12px] text-muted-foreground/60">({user.rating?.count || 0})</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* STRUCTURAL PAGINATION FOOTER BLOCK */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between border-t border-border/30 mt-20 pt-6 text-xs text-muted-foreground"
              >
                <Button
                  variant="ghost"
                  className="text-xs uppercase tracking-wider font-medium hover:bg-muted/60 disabled:opacity-30"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                
                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant="ghost"
                      onClick={() => setPage(i + 1)}
                      className={`h-8 w-8 text-xs font-mono rounded-md ${page === i + 1 ? 'bg-foreground text-background font-medium hover:bg-foreground hover:text-background' : 'hover:bg-muted/60'}`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  className="text-xs uppercase tracking-wider font-medium hover:bg-muted/60 disabled:opacity-30"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </motion.div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// Global scope date parsing utility remains fully isolated and optimized
function getTimeAgo(date) {
  if (!date) return 'Never';

  const now = new Date();
  const past = new Date(date);
  const diffInMs = now - past;
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 1) return 'just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return past.toLocaleDateString();
}