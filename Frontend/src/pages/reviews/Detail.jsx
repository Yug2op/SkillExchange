import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getMyGivenReviews, updateReview, deleteReview } from '@/api/ReviewApi';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Icons
import {
  ArrowLeft,
  Star,
  MessageSquare,
  User,
  Award,
  Target,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';

export default function ReviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: meData } = useMe();
  const currentUserId = meData?._id;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    rating: 0,
    feedback: '',
    aspectRatings: {
      communication: 5,
      knowledge: 5,
      punctuality: 5,
      patience: 5
    },
    isPublic: true
  });

  // Get all given reviews to find the specific one
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['my-given-reviews'],
    queryFn: getMyGivenReviews,
  });

  const reviews = reviewsData?.data?.reviews || [];
  const review = reviews.find(r => r._id === id);
  

  // Edit review mutation
  const editReviewMutation = useMutation({
    mutationFn: ({ id, data }) => updateReview(id, data),
    onSuccess: () => {
      toast.success('Review updated successfully!');
      queryClient.invalidateQueries(['my-given-reviews']);
      queryClient.invalidateQueries(['my-received-reviews']);
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update review', {
        description: error?.message || 'Please try again.'
      });
    }
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success('Review deleted successfully!');
      queryClient.invalidateQueries(['my-given-reviews']);
      queryClient.invalidateQueries(['my-received-reviews']);
      navigate('/reviews');
    },
    onError: (error) => {
      toast.error('Failed to delete review', {
        description: error?.message || 'Please try again.'
      });
    }
  });

  const handleEdit = () => {
    setEditFormData({
      rating: review.rating,
      feedback: review.feedback || '',
      aspectRatings: review.aspectRatings || {
        communication: 5,
        knowledge: 5,
        punctuality: 5,
        patience: 5
      },
      isPublic: review.isPublic
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    if (editFormData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    editReviewMutation.mutate({ id, data: editFormData });
  };

  const handleDelete = () => {
    deleteReviewMutation.mutate(id);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
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

  if (!review) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="h-16 w-16 text-red-500 mx-auto mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Review Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The review you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link to="/reviews">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reviews
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const isMyReview = review.reviewer?._id === currentUserId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/reviews">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Reviews
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Review Details</h1>
                <p className="text-muted-foreground">
                  Review for {review.reviewee?.name}
                </p>
              </div>
            </div>

            {isMyReview && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Review</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this review? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Review
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </motion.div>

          {/* Review Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={review.reviewee?.profilePic?.url || `https://ui-avatars.com/api/?name=${review.reviewee?.name || 'U'}&background=random`} alt={review.reviewee?.name} loading="lazy" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {review.reviewee?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      Review for {review.reviewee?.name}
                      <Badge variant={review.isPublic ? 'default' : 'secondary'}>
                        {review.isPublic ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Public
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Private
                          </>
                        )}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(review.createdAt)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Overall Rating */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Overall Rating</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`h-6 w-6 ${
                            rating <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-lg font-semibold ${getRatingColor(review.rating)}`}>
                      {review.rating}/5
                    </span>
                  </div>
                </div>

                {/* Exchange Context */}
                {review.exchange && (
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Exchange Details</Label>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Skill Requested</div>
                          <div className="font-medium">{review.exchange.skillRequested}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Skill Offered</div>
                          <div className="font-medium">{review.exchange.skillOffered}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aspect Ratings */}
                {review.aspectRatings && (
                  <div className="space-y-3">
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
                              <div
                                key={rating}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                  rating <= review.aspectRatings[key]
                                    ? 'bg-yellow-400 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {rating}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill Taught */}
                {review.skillTaught && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Skill Learned</Label>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm">{review.skillTaught}</p>
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {review.feedback && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Feedback</Label>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm leading-relaxed">{review.feedback}</p>
                    </div>
                  </div>
                )}

                {/* Reviewer Info */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.reviewer?.profilePic?.url || `https://ui-avatars.com/api/?name=${review.reviewee?.name || 'U'}&background=random`} alt={review.reviewer?.name} loading="lazy"/>
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs">
                        {review.reviewer?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">Reviewed by {review.reviewer?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {isMyReview ? 'You' : 'Other user'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Update your review for {review.reviewee?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Overall Rating */}
            <div className="space-y-2">
              <Label>Overall Rating *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, rating }))}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating <= editFormData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {editFormData.rating > 0 ? `${editFormData.rating} stars` : 'Select rating'}
                </span>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <Label htmlFor="edit-feedback">Feedback</Label>
              <Textarea
                id="edit-feedback"
                value={editFormData.feedback}
                onChange={(e) => setEditFormData(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Update your feedback..."
                rows={3}
              />
            </div>

            {/* Aspect Ratings - ADD THIS SECTION */}
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
                          onClick={() => setEditFormData(prev => ({
                            ...prev,
                            aspectRatings: {
                              ...prev.aspectRatings,
                              [key]: rating
                            }
                          }))}
                          className={`p-1 rounded ${
                            rating <= editFormData.aspectRatings[key]
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

            {/* Privacy Setting */}
            <div className="space-y-2">
              <Label>Privacy Setting</Label>
              <RadioGroup
                value={editFormData.isPublic ? 'public' : 'private'}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, isPublic: value === 'public' }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="edit-public" />
                  <Label htmlFor="edit-public" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Public
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="edit-private" />
                  <Label htmlFor="edit-private" className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Private
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editReviewMutation.isPending}
              >
                {editReviewMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
