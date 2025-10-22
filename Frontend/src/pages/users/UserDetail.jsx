import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getUser } from '@/api/UserApi';
import { getMyExchanges } from '@/api/ExchangeApi';
import { getUserReviews } from '@/api/ReviewApi';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import {
  ArrowLeft,
  User,
  Star,
  BookOpen,
  GraduationCap,
  Target,
  CheckCircle2,
  AlertCircle,
  Send,
  MessageSquare,
  Calendar,
  MapPin,
  Clock,
  Award,
  Users,
  TrendingUp,
  Mail,
  Phone,
  Globe,
  Heart,
  Shield,
  Trophy,
  Zap,
  Lightbulb,
  ChevronRight,
  Eye,
  UserPlus,
  MessageCircle,
  Sparkles,
  Building,
  Coffee
} from 'lucide-react';

export default function UserDetailPage() {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-detail', id],
    queryFn: () => getUser(id),
    enabled: !!id,
    onError: (err) => toast.error('Failed to load user', { description: err?.message || 'Try again later.' })
  });

  const { data: exchangesData } = useQuery({
    queryKey: ['user-exchanges', id],
    queryFn: () => getMyExchanges(),
    enabled: !!id,
    onError: (err) => toast.error('Failed to load exchanges', { description: err?.message || 'Try again later.' })
  });

  const { data: userReviewsData } = useQuery({
    queryKey: ['user-reviews', id],
    queryFn: () => getUserReviews(id),
    enabled: !!id,
  });

  const user = data?.data?.user;

  const userExchanges = exchangesData?.data?.exchanges || [];
  const completedExchanges = userExchanges.filter(exchange => exchange.status?.toLowerCase() === 'completed' && (exchange.sender?.id === id || exchange.receiver?.id === id)).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/search">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getRatingBgColor = (rating) => {
    if (rating >= 4.5) return 'bg-green-100 dark:bg-green-900/30';
    if (rating >= 3.5) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-gray-100 dark:bg-gray-900/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <Button variant="outline" size="sm" asChild>
              <Link to="/search">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold">User Profile</h1>
              <p className="text-muted-foreground">Discover {user.name}'s skills and expertise</p>
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Profile */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              {/* Hero Section */}
              <Card className="mb-8">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                          <AvatarImage src={user.profilePic?.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} alt={user.name} loading="lazy" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                            {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {user.isEmailVerified && (
                          <div className="absolute -bottom-1 -right-1">
                            <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <div className="flex items-center gap-4 mt-2">
                          {user.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {user.location.city}, {user.location.country}
                            </div>
                          )}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getRatingBgColor(user.rating?.average)}`}>
                            <Star className={`h-3 w-3 fill-current ${getRatingColor(user.rating?.average)}`} />
                            <span className={`font-medium ${getRatingColor(user.rating?.average)}`}>
                              {user.rating?.average?.toFixed(1) || '0.0'}
                            </span>
                            <span className="text-muted-foreground">
                              ({user.rating?.count || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {user.bio && (
                        <div>
                          <h3 className="font-medium mb-2">About</h3>
                          <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Sections */}
              <div className="grid gap-6 md:grid-cols-2 mb-8">
                {/* Skills to Teach */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Skills to Teach ({user.skillsToTeach?.length || 0})
                      </CardTitle>
                      <CardDescription>
                        Expertise {user.name} can share with you
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.skillsToTeach.map((skillObj) => (
                            <Badge key={skillObj.skill} variant="secondary" className="text-sm py-1 px-3">
                              {skillObj.skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No teaching skills listed yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Skills to Learn */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Wants to Learn ({user.skillsToLearn?.length || 0})
                      </CardTitle>
                      <CardDescription>
                        Skills {user.name} is interested in acquiring
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.skillsToLearn.map((skillObj) => (
                            <Badge key={skillObj.skill} variant="outline" className="text-sm py-1 px-3">
                              {skillObj.skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No learning goals listed yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Activity & Stats */}
              {user.lastActive && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card m-8>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Activity & Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Last Active</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Member Since</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Exchanges</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {completedExchanges || 0} completed
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Compatibility Check */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Sparkles className="h-5 w-5" />
                      Exchange Potential
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Skills Match</span>
                        <Badge variant="outline">High</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Response Rate</span>
                        <Badge variant="outline">95%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Success Rate</span>
                        <Badge variant="outline">92%</Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">Excellent</div>
                      <div className="text-sm text-muted-foreground">Match Quality</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-primary/20">

                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Trust & Safety
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {user.isEmailVerified && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Email verified</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>
                        {user.rating?.average?.toFixed(1) || '0.0'} average rating
                        ({user.rating?.count || 0} reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-blue-500" />
                      <span>{completedExchanges || 0} exchanges completed</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Active {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'recently'}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Similar Users */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link to={`/exchanges/request/${user._id}`} >
                  <Button variant="default" className="w-full mt-4">
                    <Send className="h-4 w-4" />
                    Request Exchange
                  </Button>
                </Link>
              </motion.div>

              {/* Reviews Section */}
              {userReviewsData?.data?.reviews?.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Reviews ({userReviewsData.data.reviews.length})
                      </CardTitle>
                      <CardDescription>
                        What others say about {user.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userReviewsData.data.reviews.slice(0, 3).map((review) => (
                          <div key={review._id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.reviewer?.profilePic?.url || `https://ui-avatars.com/api/?name=${review.reviewer?.name || 'U'}&background=random`} loading="lazy" />
                              <AvatarFallback>{review.reviewer?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium">{review.rating}/5</span>
                              </div>
                              {review.feedback && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  "{review.feedback}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))}

                        {userReviewsData.data.reviews.length > 3 && (
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <Link to={`/reviews?filter=received`}>
                              View All Reviews ({userReviewsData.data.reviews.length})
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}