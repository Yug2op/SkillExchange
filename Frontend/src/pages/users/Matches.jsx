import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getMatches } from '@/api/UserApi';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  Users,
  TrendingUp,
  Sparkles,
  Target,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  UserPlus,
  MessageCircle,
  Award,
  Calendar,
  Eye,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

function MatchScoreTooltip({ match }) {
  return (
    <div className="absolute z-50 w-72 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 -top-2 left-full ml-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
          <span className="font-semibold text-sm">Match Breakdown</span>
          <Badge className={getMatchScoreColor(match.matchScore)}>
            {Math.round(match.matchScore)}%
          </Badge>
        </div>

        <div className="space-y-2">
          {/* Skill Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Skill Match</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${(match.user.skillScore / 60) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right">
                {Math.round(match.user.skillScore || 0)}
              </span>
            </div>
          </div>

          {/* Recency Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(match.user.recencyScore / 20) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right">
                {Math.round(match.user.recencyScore || 0)}
              </span>
            </div>
          </div>

          {/* Location Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="text-sm">Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(match.user.locationScore / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right">
                {Math.round(match.user.locationScore || 0)}
              </span>
            </div>
          </div>

          {/* Rating Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{ width: `${(match.user.ratingScore / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right">
                {Math.round(match.user.ratingScore || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Skills they can teach you */}
        {match.user.canTeachYou && match.user.canTeachYou.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Can teach you:
            </div>
            <div className="flex flex-wrap gap-1">
              {match.user.canTeachYou.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {skill.skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills they want to learn from you */}
        {match.user.wantsToLearn && match.user.wantsToLearn.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Wants to learn from you:
            </div>
            <div className="flex flex-wrap gap-1">
              {match.user.wantsToLearn.map((skill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {skill.skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tooltip Arrow */}
      <div className="absolute top-4 -left-2 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45" />
    </div>
  );
}


function getMatchScoreColor(score) {
  if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
  if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
  return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
}

export default function MatchesPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('matchScore');
  const [filterBy, setFilterBy] = useState('all');
  const limit = 12;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users-matches', { page, limit, sortBy }], // Remove filterBy from query key
    queryFn: () => getMatches({ page, limit, sortBy }), // Remove filterBy from API call
    keepPreviousData: true,
    onError: (err) => toast.error('Failed to load matches', { description: err?.message || 'Try again later.' })
  });

  // Extract all matches from API
  const allMatches = data?.data?.matches || [];
  // console.log(allMatches);
  

  // Apply client-side filtering
  const filteredMatches = useMemo(() => {
    if (filterBy === 'all') return allMatches;
    if (filterBy === 'high') return allMatches.filter(m => m.matchScore >= 80);
    if (filterBy === 'medium') return allMatches.filter(m => m.matchScore >= 50 && m.matchScore < 80);
    if (filterBy === 'fair') return allMatches.filter(m => m.matchScore < 50);
    return allMatches;
  }, [allMatches, filterBy]);

  // Apply client-side sorting
  const sortedMatches = useMemo(() => {
    const matches = [...filteredMatches];

    switch (sortBy) {
      case 'matchScore':
        return matches.sort((a, b) => b.matchScore - a.matchScore);
      case 'rating':
        return matches.sort((a, b) =>
          (b.user.rating?.average || 0) - (a.user.rating?.average || 0)
        );
      case 'recent':
        return matches.sort((a, b) => {
          const dateA = new Date(a.user.lastActiveAt || 0);
          const dateB = new Date(b.user.lastActiveAt || 0);
          return dateB - dateA;
        });
      default:
        return matches;
    }
  }, [filteredMatches, sortBy]);

  const pagination = data?.pagination || {};
  const totalPages = pagination.pages || 1;

  // Calculate stats from ALL matches (not filtered)
  const allStats = useMemo(() => {
    const highMatches = allMatches.filter(m => m.matchScore >= 80).length;
    const mediumMatches = allMatches.filter(m => m.matchScore >= 50 && m.matchScore < 80).length;
    const fairMatches = allMatches.filter(m => m.matchScore < 50).length;

    return {
      total: allMatches.length,
      high: highMatches,
      medium: mediumMatches,
      fair: fairMatches
    };
  }, [allMatches]);

  // Calculate stats from filtered matches for display
  const filteredStats = useMemo(() => {
    const highMatches = sortedMatches.filter(m => m.matchScore >= 80).length;
    const mediumMatches = sortedMatches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length;
    const fairMatches = sortedMatches.filter(m => m.matchScore < 60).length;

    return {
      total: sortedMatches.length,
      high: highMatches,
      medium: mediumMatches,
      fair: fairMatches
    };
  }, [sortedMatches]);

  // Reset page when filter changes
  const handleFilterChange = (value) => {
    setFilterBy(value);
    setPage(1);
  };

  // Reset page when sort changes
  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
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
            <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <div className="h-12 w-12 text-red-600">⚠️</div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Failed to Load Matches</h2>
            <p className="text-muted-foreground mb-6">
              {error?.message || 'Something went wrong loading your matches. Please try again.'}
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
                Perfect Matches
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover learning partners who complement your skills perfectly
              </p>
            </div>

            <Button asChild className="gap-2">
              <Link to="/search">
                <Search className="h-4 w-4" />
                Find More Matches
              </Link>
            </Button>
          </motion.div>

          {/* Stats Cards - Show all stats with visual indication of filter */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <Card className={`text-center ${filterBy === 'all' ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {filterBy === 'all' ? filteredStats.total : allStats.total}
                </div>
                <div className="text-sm text-muted-foreground">Total Matches</div>
                {filterBy === 'all' && (
                  <Badge variant="secondary" className="mt-2 text-xs">Active</Badge>
                )}
              </CardContent>
            </Card>
            <Card className={`text-center ${filterBy === 'high' ? 'ring-2 ring-green-500' : ''}`}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {filterBy === 'high' ? filteredStats.total : allStats.high}
                </div>
                <div className="text-sm text-muted-foreground">Excellent (80%+)</div>
                {filterBy === 'high' && (
                  <Badge variant="secondary" className="mt-2 text-xs bg-green-100 text-green-700">Active</Badge>
                )}
              </CardContent>
            </Card>
            <Card className={`text-center ${filterBy === 'medium' ? 'ring-2 ring-yellow-500' : ''}`}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">
                  {filterBy === 'medium' ? filteredStats.total : allStats.medium}
                </div>
                <div className="text-sm text-muted-foreground">Good (60-79%)</div>
                {filterBy === 'medium' && (
                  <Badge variant="secondary" className="mt-2 text-xs bg-yellow-100 text-yellow-700">Active</Badge>
                )}
              </CardContent>
            </Card>
            <Card className={`text-center ${filterBy === 'fair' ? 'ring-2 ring-gray-500' : ''}`}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-600">
                  {filterBy === 'fair' ? filteredStats.total : allStats.fair}
                </div>
                <div className="text-sm text-muted-foreground">Fair (&lt;50%)</div>
                {filterBy === 'fair' && (
                  <Badge variant="secondary" className="mt-2 text-xs bg-gray-100 text-gray-700">Active</Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Controls */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={filterBy} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Matches</SelectItem>
                <SelectItem value="high">Excellent (80%+)</SelectItem>
                <SelectItem value="medium">Good (50-79%)</SelectItem>
                <SelectItem value="fair">Fair (0-49%)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matchScore">Match Score</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="recent">Recently Active</SelectItem>
              </SelectContent>
            </Select>

            {filterBy !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('all')}
                className="gap-2"
              >
                Clear Filter
              </Button>
            )}
          </motion.div>

          {/* Exchange Tabs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="all">
                  All Matches ({filteredStats.total})
                  {filterBy !== 'all' && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Filtered
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
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
    </div>
  );
}

// Exchange List Component
function ExchangeList({ matches, totalPages, currentPage, setPage, filterBy }) {
  if (matches.length === 0) {
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
          <h3 className="text-2xl font-semibold">No matches found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {filterBy !== 'all'
              ? 'No matches meet the selected filter criteria. Try adjusting your filters.'
              : 'Complete your profile with more skills to get better matches, or try adjusting your filters.'
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
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <p className="text-muted-foreground">
          {filterBy !== 'all' ? 'Showing' : 'Found'}{' '}
          <span className="font-semibold text-foreground">{matches.length}</span>{' '}
          {filterBy !== 'all' ? 'filtered ' : ''}matches for you
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {matches.map((match, index) => {
            const user = match.user;
            return (
              <motion.div
                key={user._id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer group ${match.matchScore >= 80
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : match.matchScore >= 60
                              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}
                        >
                          <Target className="h-5 w-5" />

                          {/* Tooltip - Shows on hover */}
                          <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <MatchScoreTooltip match={match} />
                          </div>
                        </div>
                        <div>
                          <Badge className={`${getMatchScoreColor(match.matchScore)} gap-1 mb-2 cursor-pointer group-hover:scale-105 transition-transform`}>
                            <Star className="h-3 w-3" />
                            {Math.round(match.matchScore)}%
                          </Badge>
                          <div className="font-semibold text-sm">
                            {match.matchScore >= 80 ? 'Excellent Match' : match.matchScore >= 50 ? 'Good Match' : 'Fair Match'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-xs text-muted-foreground">
                        <div>Match #{index + 1}</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.bio || 'No bio available'}
                      </p>
                    </div>

                    {/* Location - Always show to maintain consistent card height */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" aria-hidden="true" />

                      {user?.location.city ? (
                        <span>
                          {/* This handles all cases: city only, country only, or both */}
                          {[user.location.city, user.location.country].filter(Boolean).join(', ')}
                        </span>
                      ) : (
                        <span className="italic text-muted-foreground/60">
                          Location not specified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{user.rating?.average?.toFixed(1) || '0.0'}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({user.rating?.count || 0} reviews)
                      </span>
                    </div>

                    {/* Skills to Teach */}
                    {user.skillsToTeach && user.skillsToTeach.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Can Teach You
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {user.skillsToTeach.slice(0, 3).map((skillObj) => (
                            <Badge key={skillObj.skill} variant="secondary" className="text-xs">
                              {skillObj.skill}
                            </Badge>
                          ))}
                          {user.skillsToTeach.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.skillsToTeach.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skills to Learn */}
                    {user.skillsToLearn && user.skillsToLearn.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Target className="h-4 w-4 text-primary" />
                          Wants to Learn
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {user.skillsToLearn.slice(0, 3).map((skillObj) => (
                            <Badge key={skillObj.skill} variant="outline" className="text-xs">
                              {skillObj.skill}
                            </Badge>
                          ))}
                          {user.skillsToLearn.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.skillsToLearn.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground border-t">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Active {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 'recently'}
                      </div>
                      {user.isEmailVerified && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="gap-2 pt-4">
                    <Button
                      asChild
                      className="flex-1 gap-2"
                      variant="default"
                    >
                      <Link to={`/users/${user._id}`}>
                        <UserPlus className="h-4 w-4" />
                        View Profile
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                    >
                      <Link to={`/chat/${user._id}`}>
                        <MessageCircle className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center gap-2 mt-12"
        >
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                onClick={() => setPage(i + 1)}
                size="icon"
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </motion.div>
      )}
    </div>
  );
}