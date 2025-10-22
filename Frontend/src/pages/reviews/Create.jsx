import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { createReview } from '@/api/ReviewApi';
import { getExchange } from '@/api/ExchangeApi';
import { useMe } from '@/hooks/useMe';
import { toast } from 'sonner';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Icons
import {
  ArrowLeft,
  Star,
  MessageSquare,
  User,
  Award,
  Target,
  CheckCircle2,
  AlertCircle,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';

export default function CreateReviewPage() {
  const { exchangeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: meData } = useMe();
  const currentUserId = meData?._id;

  const [formData, setFormData] = useState({
    rating: 0,
    feedback: '',
    skillTaught: '',
    aspectRatings: {
      communication: 5,
      knowledge: 5,
      punctuality: 5,
      patience: 5
    },
    isPublic: true
  });

  const [hoveredRating, setHoveredRating] = useState(0);

  // Get exchange details
  const { data: exchangeData, isLoading: exchangeLoading } = useQuery({
    queryKey: ['exchange', exchangeId],
    queryFn: () => getExchange(exchangeId),
    enabled: !!exchangeId,
  });

  const exchange = exchangeData?.data?.exchange;
  const isSender = exchange?.sender?._id === currentUserId;
  const otherUser = isSender ? exchange?.receiver : exchange?.sender;

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries(['my-given-reviews']);
      queryClient.invalidateQueries(['my-received-reviews']);
      navigate('/reviews');
    },
    onError: (error) => {
      toast.error('Failed to submit review', {
        description: error?.message || 'Please try again.'
      });
    }
  });

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleAspectRatingChange = (aspect, rating) => {
    setFormData(prev => ({
      ...prev,
      aspectRatings: {
        ...prev.aspectRatings,
        [aspect]: rating
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    const payload = {
      revieweeId: otherUser?._id,
      exchangeId,
      rating: formData.rating,
      feedback: formData.feedback,
      skillTaught: formData.skillTaught,
      aspectRatings: formData.aspectRatings,
      isPublic: formData.isPublic
    };

    createReviewMutation.mutate(payload);
  };

  if (exchangeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!exchange) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Exchange Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The exchange you're trying to review doesn't exist.
            </p>
            <Button asChild>
              <Link to="/exchanges">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Exchanges
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <Button variant="outline" size="sm" asChild>
              <Link to="/exchanges">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Exchanges
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Write a Review</h1>
              <p className="text-muted-foreground">
                Share your experience with {otherUser?.name}
              </p>
            </div>
          </motion.div>

          {/* Exchange Summary */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Exchange Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser?.profilePic?.url || `https://ui-avatars.com/api/?name=${OtherUser?.name || 'U'}&background=random`} alt={otherUser?.name} loading="lazy" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{otherUser?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {isSender 
                        ? `You learned ${exchange?.skillRequested} from ${otherUser?.name}`
                        : `${otherUser?.name} learned ${exchange?.skillRequested} from you`
                      }
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Skill Requested</div>
                    <div className="font-medium">{exchange?.skillRequested}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Skill Offered</div>
                    <div className="font-medium">{exchange?.skillOffered}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Review Form */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Review</CardTitle>
                <CardDescription>
                  Help others by sharing your experience with this skill exchange
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Overall Rating */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Overall Rating *</Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onMouseEnter={() => setHoveredRating(rating)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => handleRatingClick(rating)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              rating <= (hoveredRating || formData.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-3 text-sm text-muted-foreground">
                        {formData.rating > 0 ? `${formData.rating} out of 5 stars` : 'Select a rating'}
                      </span>
                    </div>
                  </div>

                  {/* Aspect Ratings */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Detailed Ratings</Label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { key: 'communication', label: 'Communication' },
                        { key: 'knowledge', label: 'Knowledge & Expertise' },
                        { key: 'punctuality', label: 'Punctuality' },
                        { key: 'patience', label: 'Patience & Teaching Style' }
                      ].map(({ key, label }) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-sm">{label}</Label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => handleAspectRatingChange(key, rating)}
                                className={`p-1 rounded ${
                                  rating <= formData.aspectRatings[key]
                                    ? 'bg-yellow-400 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                              >
                                <span className="text-xs font-medium">{rating}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skill Taught */}
                  <div className="space-y-2">
                    <Label htmlFor="skillTaught">What skill did you learn? (Optional)</Label>
                    <input
                      id="skillTaught"
                      type="text"
                      value={formData.skillTaught}
                      onChange={(e) => setFormData(prev => ({ ...prev, skillTaught: e.target.value }))}
                      placeholder="e.g., React Hooks, Advanced JavaScript, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Your Experience (Optional)</Label>
                    <Textarea
                      id="feedback"
                      value={formData.feedback}
                      onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                      placeholder="Share your experience, what went well, what could be improved..."
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.feedback.length}/500 characters
                    </p>
                  </div>

                  {/* Privacy Setting */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Privacy Setting</Label>
                    <RadioGroup
                      value={formData.isPublic ? 'public' : 'private'}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, isPublic: value === 'public' }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public" className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Public - Visible to all users
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private" className="flex items-center gap-2">
                          <EyeOff className="h-4 w-4" />
                          Private - Only visible to you
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/exchanges')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createReviewMutation.isPending || formData.rating === 0}
                      className="flex-1 gap-2"
                    >
                      {createReviewMutation.isPending ? (
                        'Submitting...'
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Review
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
