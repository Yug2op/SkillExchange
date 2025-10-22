import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  MapPin,
  Star,
  Users,
  Filter,
  X,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  Eye
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
  const { data: currentUser } = useMe()
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

  // Popular skills for suggestions
  const popularSkills = popularSkillsData?.data?.popularSkills || [
    'JavaScript', 'Python', 'React', 'Design', 'Marketing',
    'Photography', 'Music', 'Cooking', 'Yoga', 'Spanish',
    'Guitar', 'Drawing', 'Writing', 'Data Science', 'Public Speaking'
  ];

  // Fetch users using the API client
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

        // Apply client-side filters
        if (filters.minRating > 0) {
          filteredUsers = filteredUsers.filter(user => user.rating?.average >= filters.minRating);
        }

        // Sort users
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
  }, [searchQuery, skillToTeach, skillToLearn, location, page, filters, searchUsers]);

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

  // Show error state
  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
              <X className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-semibold">Search Error</h3>
            <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
            <Button onClick={fetchUsers} variant="outline">
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <section className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Discover Skills</h1>
                  <p className="text-muted-foreground">Find the perfect learning partner</p>
                </div>

                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                      {hasActiveFilters && (
                        <Badge variant="default" className="ml-1">
                          {[searchQuery, skillToTeach, skillToLearn, location, filters.minRating > 0].filter(Boolean).length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Results</SheetTitle>
                      <SheetDescription>
                        Refine your search to find the perfect match
                      </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6 py-6">
                      {/* Sort By */}
                      <div className="space-y-2">
                        <Label>Sort By</Label>
                        <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rating">Highest Rating</SelectItem>
                            <SelectItem value="recent">Recently Active</SelectItem>
                            <SelectItem value="reviews">Most Reviews</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Minimum Rating */}
                      <div className="space-y-2">
                        <Label>Minimum Rating: {filters.minRating.toFixed(1)}★</Label>
                        <Slider
                          value={[filters.minRating]}
                          onValueChange={(value) => setFilters({ ...filters, minRating: value[0] })}
                          max={5}
                          step={0.5}
                          className="w-full"
                        />
                      </div>

                      {/* Clear Filters */}
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={clearFilters}
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="search"
                      placeholder="Search by name, skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Skill to learn..."
                      value={skillToLearn}
                      onChange={(e) => setSkillToLearn(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Skill to teach..."
                      value={skillToTeach}
                      onChange={(e) => setSkillToTeach(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Location..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full md:w-auto gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </form>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchQuery}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                    </Badge>
                  )}
                  {skillToLearn && (
                    <Badge variant="secondary" className="gap-1">
                      Learn: {skillToLearn}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSkillToLearn('')} />
                    </Badge>
                  )}
                  {skillToTeach && (
                    <Badge variant="secondary" className="gap-1">
                      Teach: {skillToTeach}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSkillToTeach('')} />
                    </Badge>
                  )}
                  {location && (
                    <Badge variant="secondary" className="gap-1">
                      Location: {location}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setLocation('')} />
                    </Badge>
                  )}
                  {filters.minRating > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      Rating: {filters.minRating}★+
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, minRating: 0 })} />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Skills */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Popular Skills</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleSkillClick(skill, 'learn')}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16 space-y-4"
          >
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">No results found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your search criteria or explore our popular skills to find learning partners.
              </p>
            </div>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-6 flex items-center justify-between"
            >
              <p className="text-muted-foreground">
                Found <span className="font-semibold text-foreground">{users.length}</span> learning partners
              </p>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="recent">Recently Active</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {users.map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 group relative">
                      {/* Exchange Request Button - Top Right Corner */}
                      <Link to={`/users/${user._id}`} >
                        <Button variant="outline"
                          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 bg-primary/90 hover:bg-primary text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                            <AvatarImage src={user.profilePic?.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} alt={user.name} loading="lazy" />
                            <AvatarFallback className="text-lg">
                              {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {user.name}
                            </CardTitle>
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
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {user.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {user.bio}
                          </p>
                        )}

                        {user.skillsToTeach && user.skillsToTeach.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Sparkles className="h-4 w-4 text-primary" />
                              Can Teach
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

                        {user.skillsToLearn && user.skillsToLearn.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <GraduationCap className="h-4 w-4 text-primary" />
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

                        <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Active {getTimeAgo(user.lastActive)}
                          </div>
                          {user.isEmailVerified && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="gap-2">

                        <Link to={`/exchanges/request/${user._id}`} >
                          <Button variant="default" className="flex-1 gap-2">
                            Request Exchange
                            <Send className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/chat/${user._id}`} >
                          <Button variant="outline" size='icon'>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </Link>
                        // todo
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
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
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={page === i + 1 ? 'default' : 'outline'}
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

// Helper function to format time ago
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