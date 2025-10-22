import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getMyGivenReviews, getUserReviews } from '@/api/ReviewApi';
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

// Icons
import {
  Star,
  MessageSquare,
  Calendar,
  User,
  Award,
  TrendingUp,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

// Move formatDate outside the component so it can be shared
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function ReviewsListPage() {
  const { data: meData } = useMe();
  const currentUserId = meData?._id;
  
  const [activeTab, setActiveTab] = useState('given');
  const [sortBy, setSortBy] = useState('recent');

  // Get reviews given by current user
  const { data: givenReviewsData, isLoading: givenLoading } = useQuery({
    queryKey: ['my-given-reviews'],
    queryFn: getMyGivenReviews,
  });

  // Get reviews received (public reviews)
  const { data: receivedReviewsData, isLoading: receivedLoading } = useQuery({
    queryKey: ['my-received-reviews'],
    queryFn: () => getUserReviews(currentUserId),
    enabled: !!currentUserId,
  });

  const givenReviews = givenReviewsData?.data?.reviews || [];
  const receivedReviews = receivedReviewsData?.data?.reviews || [];

  // Calculate stats
  const stats = {
    given: givenReviews.length,
    received: receivedReviews.length,
    averageRating: receivedReviews.length > 0 
      ? (receivedReviews.reduce((sum, review) => sum + review.rating, 0) / receivedReviews.length).toFixed(1)
      : 0
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

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
                <Star className="h-8 w-8 text-primary" />
                My Reviews
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your skill exchange reviews and feedback
              </p>
            </div>

            <Button asChild className="gap-2">
              <Link to={`/exchanges`}>
                <Plus className="h-4 w-4" />
                View Exchanges
              </Link>
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{stats.given}</div>
                <div className="text-sm text-muted-foreground">Reviews Given</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.received}</div>
                <div className="text-sm text-muted-foreground">Reviews Received</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className={`text-2xl font-bold ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4"
          >
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="rating">By Rating</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Reviews Tabs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="given">Reviews Given ({stats.given})</TabsTrigger>
                <TabsTrigger value="received">Reviews Received ({stats.received})</TabsTrigger>
              </TabsList>

              <TabsContent value="given" className="mt-6">
                <ReviewsSection 
                  reviews={givenReviews} 
                  isLoading={givenLoading}
                  type="given"
                  currentUserId={currentUserId}
                  formatDate={formatDate}
                />
              </TabsContent>

              <TabsContent value="received" className="mt-6">
                <ReviewsSection 
                  reviews={receivedReviews} 
                  isLoading={receivedLoading}
                  type="received"
                  currentUserId={currentUserId}
                  formatDate={formatDate}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Reviews Section Component
function ReviewsSection({ reviews, isLoading, type, currentUserId, formatDate }) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-16 space-y-4"
      >
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto">
          <Star className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">
            {type === 'given' ? 'No reviews given yet' : 'No reviews received yet'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {type === 'given' 
              ? 'Complete skill exchanges to start giving reviews and help others improve!'
              : 'Complete skill exchanges to start receiving reviews from other users.'
            }
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/exchanges">
            View Exchanges
          </Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {reviews.map((review, index) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage 
                      src={type === 'given' 
                        ? review.reviewee?.profilePic?.url || `https://ui-avatars.com/api/?name=${review.reviewee?.name || 'U'}&background=random` 
                        : review.reviewer?.profilePic?.url || `https://ui-avatars.com/api/?name=${review.reviewer?.name || 'U'}&background=random`
                      } 
                      loading="lazy"
                    />
                    <AvatarFallback>
                      {type === 'given' 
                        ? review.reviewee?.name?.[0]?.toUpperCase() || 'U'
                        : review.reviewer?.name?.[0]?.toUpperCase() || 'U'
                      }
                    </AvatarFallback>
                  </Avatar>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">
                          {type === 'given' 
                            ? `Review for ${review.reviewee?.name}`
                            : `Review from ${review.reviewer?.name}`
                          }
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{review.rating}/5</span>
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>

                      {type === 'given' && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/reviews/${review._id}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Exchange Context */}
                    {review.exchange && (
                      <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium">Exchange:</span> {review.exchange.skillOffered} ↔ {review.exchange.skillRequested}
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {review.feedback && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        "{review.feedback}"
                      </p>
                    )}

                    {/* Aspect Ratings */}
                    {review.aspectRatings && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {Object.entries(review.aspectRatings).map(([aspect, rating]) => (
                          <div key={aspect} className="text-xs">
                            <span className="capitalize">{aspect}:</span>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < rating ? 'bg-yellow-400' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
