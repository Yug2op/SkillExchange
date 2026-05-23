import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getMyGivenReviews, updateReview, deleteReview } from '@/api/ReviewApi';
import { useMe } from '@/hooks/useMe';
import { toast } from 'sonner';

// shadcn/ui components
import { Button } from '@/components/ui/button';
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
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Award,
  AlertCircle,
  Loader2
} from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';

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

  // Query configuration mirroring old dependencies exactly
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['my-given-reviews'],
    queryFn: getMyGivenReviews,
  });

  const reviews = reviewsData?.data?.reviews || [];
  const review = reviews.find(r => r._id === id);

  // Edit review mutation with parallel cache cleaning routes
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
    if (rating >= 4) return 'text-primary';
    if (rating >= 3) return 'text-secondary';
    return 'text-destructive';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <BrandLoader/>
          </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm space-y-6">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-medium tracking-tight">Review Node Absent</h3>
            <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">
              The targeted index entry cannot be found or your active workspace identity lacks necessary parameters to view it.
            </p>
          </div>
          <Button asChild className="w-full text-xs uppercase tracking-widest font-medium py-5 rounded-lg bg-foreground text-background">
            <Link to="/reviews"><ArrowLeft className="mr-2 h-3.5 w-3.5" /> Return to Evaluations</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const isMyReview = review.reviewer?._id === currentUserId;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-12">
        
        {/* INTERFACE BREADCRUMB HEADER MODULE */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-4">
            <Button variant="ghost" size="sm" asChild className="text-xs uppercase tracking-widest font-medium h-9 px-3 -ml-3 hover:bg-muted/60">
              <Link to="/reviews">
                <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Back to Reviews
              </Link>
            </Button>
            <div className="pt-1">
              <h1 className="text-4xl font-light tracking-tighter leading-none">Evaluation Logs.</h1>
              <p className="text-sm text-muted-foreground font-light mt-3">
                Review context linked with <span className="font-medium text-foreground">{review.reviewee?.name}</span>
              </p>
            </div>
          </div>

          {/* EDIT/DELETE OWNER CONTROL ACTION CONTAINER */}
          {isMyReview && (
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <Button variant="ghost" size="sm" onClick={handleEdit} className="text-xs uppercase tracking-widest font-medium h-10 px-4 border border-border/40 hover:bg-muted/60 rounded-lg gap-2">
                <Edit className="h-3.5 w-3.5" /> Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest font-medium h-10 px-4 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg gap-2">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border border-border/40 max-w-md rounded-xl">
                  <AlertDialogHeader className="text-left">
                    <AlertDialogTitle className="text-lg font-medium tracking-tight">Delete Review</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-muted-foreground font-light leading-relaxed">
                      Are you sure you want to purge this record form the central indices? This action cannot be reverted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="pt-2">
                    <AlertDialogCancel className="text-xs uppercase tracking-wider font-medium h-10 rounded-lg">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="text-xs uppercase tracking-wider font-medium h-10 bg-destructive text-destructive-foreground hover:opacity-90 rounded-lg">
                      Purge Evaluation Node
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </motion.div>

        {/* COMPREHENSIVE VIEW DETAILED CARD EMBED */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-10">
          <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
            
            {/* SUB-HEADER USER INTERACTION FOOTPRINT */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center pb-6 border-b border-border/20">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 filter grayscale contrast-125 rounded-full ring-1 ring-border/40">
                  <AvatarImage src={review.reviewee?.profilePic?.url || `https://ui-avatars.com/api/?name=${review.reviewee?.name || 'U'}&background=random`} alt={review.reviewee?.name} />
                  <AvatarFallback className="text-sm font-medium bg-muted">{review.reviewee?.name?.[0]}</AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-medium tracking-tight text-foreground">Review for {review.reviewee?.name}</h3>
                    <Badge variant="outline" className="text-[9px] uppercase font-mono tracking-widest border-border/60 text-muted-foreground gap-1.5 py-0.5 px-2">
                      {review.isPublic ? <><Eye className="h-2.5 w-2.5" /> Public</> : <><EyeOff className="h-2.5 w-2.5" /> Private</>}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground/60 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> {formatDate(review.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* WEIGHTED STAR OVERALL RATING FEED */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium block">Overall Performance</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star key={rating} className={`h-5 w-5 ${rating <= review.rating ? 'fill-secondary text-secondary' : 'text-border/60'}`} />
                  ))}
                </div>
                <span className={`text-base font-medium font-mono ${getRatingColor(review.rating)}`}>
                  {review.rating}.0 / 5.0
                </span>
              </div>
            </div>

            {/* TRANSACTION EXCHANGES REFERENCE ROW */}
            {review.exchange && (
              <div className="space-y-3 pt-6 border-t border-border/20">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" /> Exchange Context Mappings
                </Label>
                <div className="p-4 bg-background border border-border/30 rounded-xl grid grid-cols-2 gap-6 text-xs font-light">
                  <div className="space-y-0.5">
                    <div className="text-muted-foreground/60 font-mono uppercase tracking-wider text-[10px]">Skill Requested</div>
                    <div className="font-medium text-foreground">{review.exchange.skillRequested}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-muted-foreground/60 font-mono uppercase tracking-wider text-[10px]">Skill Offered</div>
                    <div className="font-medium text-foreground">{review.exchange.skillOffered}</div>
                  </div>
                </div>
              </div>
            )}

            {/* SEGMENTED DETAILED CRITERIA MATRIX CHIPS */}
            {review.aspectRatings && (
              <div className="space-y-4 pt-6 border-t border-border/20">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium block">Detailed Vectors</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { key: 'communication', label: 'Communication' },
                    { key: 'knowledge', label: 'Knowledge & Expertise' },
                    { key: 'punctuality', label: 'Punctuality' },
                    { key: 'patience', label: 'Patience & Teaching Style' }
                  ].map(({ key, label }) => (
                    <div key={key} className="p-4 border border-border/30 bg-card/40 rounded-xl flex items-center justify-between gap-4">
                      <span className="text-xs font-light text-foreground/80">{label}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div
                            key={rating}
                            className={`h-5 w-5 font-mono text-[9px] font-medium rounded flex items-center justify-center border ${
                              rating <= review.aspectRatings[key]
                                ? 'bg-foreground text-background border-foreground'
                                : 'text-muted-foreground/40 border-border/40'
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

            {/* TEXT INLINE SPECIFIC FIELD BLOCKS */}
            {review.skillTaught && (
              <div className="space-y-2 pt-6 border-t border-border/20">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium block">Skill Matrix Component Learned</Label>
                <div className="text-sm font-light text-foreground/90 pl-1">{review.skillTaught}</div>
              </div>
            )}

            {review.feedback && (
              <div className="space-y-2 pt-6 border-t border-border/20">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium block">Log Summary Feedback</Label>
                <p className="text-sm text-muted-foreground/90 font-light leading-relaxed bg-background border border-border/30 rounded-xl p-4 italic">
                  "{review.feedback}"
                </p>
              </div>
            )}

            {/* LOWER BOUND ATTRIBUTION METADATA CARD FOOTPRINT */}
            <div className="pt-6 border-t border-border/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-light text-muted-foreground">
                <Avatar className="h-6 w-6 filter grayscale rounded-full ring-1 ring-border/20">
                  <AvatarImage src={review.reviewer?.profilePic?.url} />
                  <AvatarFallback className="text-[10px] font-mono">{review.reviewer?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Logged by <span className="font-medium text-foreground">{review.reviewer?.name}</span> ({isMyReview ? 'Self Workspace' : 'External Core'})</span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* FLOW EDITOR DIALOG INTERFACE BLOCK MODAL */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full sm:max-w-lg bg-card text-foreground border-border/40 rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-medium tracking-tight">Edit Review</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-light leading-relaxed">
              Modify custom parameter scores and transaction logs linked with this profile entry.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-8 pt-2">
            
            {/* INTERACTIVE EDIT STAR ROW LAYER */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium">Overall Performance *</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, rating }))}
                    className="p-1 hover:scale-110 transition-transform outline-none"
                  >
                    <Star className={`h-6 w-6 transition-colors ${rating <= editFormData.rating ? 'fill-secondary text-secondary' : 'text-border/60'}`} />
                  </button>
                ))}
                <span className="ml-3 text-xs font-mono text-muted-foreground font-light">{editFormData.rating} / 5</span>
              </div>
            </div>

            {/* MULTI ASPECT FORM UPDATES SLOTS */}
            <div className="space-y-4 pt-2 border-t border-border/20">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium block">Detailed Ratings</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: 'communication', label: 'Communication' },
                  { key: 'knowledge', label: 'Knowledge & Expertise' },
                  { key: 'punctuality', label: 'Punctuality' },
                  { key: 'patience', label: 'Patience & Teaching Style' }
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2 p-3 border border-border/30 bg-background/50 rounded-xl flex items-center justify-between gap-4">
                    <Label className="text-xs font-light text-foreground/80">{label}</Label>
                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setEditFormData(prev => ({
                            ...prev,
                            aspectRatings: { ...prev.aspectRatings, [key]: rating }
                          }))}
                          className={`h-6 w-6 font-mono text-[10px] font-medium rounded border transition-all ${
                            rating <= editFormData.aspectRatings[key]
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-transparent text-muted-foreground border-border/40 hover:border-foreground/20'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TEXT CONTEXT TEXTAREA EDIT AREA */}
            <div className="space-y-2 pt-2 border-t border-border/20">
              <Label htmlFor="edit-feedback" className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium">Feedback Text</Label>
              <div className="border border-border/40 focus-within:border-foreground/60 rounded-xl p-3 bg-background">
                <Textarea
                  id="edit-feedback"
                  value={editFormData.feedback}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Update your descriptive feedback logs..."
                  rows={3}
                  maxLength={500}
                  className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light text-sm shadow-none"
                />
              </div>
            </div>

            {/* MODAL CONTROL PRIVACY RADIOS */}
            <div className="space-y-3 pt-2 border-t border-border/20">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium block">Privacy Settings</Label>
              <RadioGroup
                value={editFormData.isPublic ? 'public' : 'private'}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, isPublic: value === 'public' }))}
                className="gap-2.5"
              >
                <div className="flex items-center space-x-2.5 cursor-pointer group">
                  <RadioGroupItem value="public" id="edit-public" className="data-[state=checked]:bg-primary" />
                  <Label htmlFor="edit-public" className="flex items-center gap-1.5 text-xs font-light text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors">
                    <Eye className="h-3.5 w-3.5 text-primary stroke-[1.5]" /> Public Group Listing
                  </Label>
                </div>
                <div className="flex items-center space-x-2.5 cursor-pointer group">
                  <RadioGroupItem value="private" id="edit-private" className="data-[state=checked]:bg-primary" />
                  <Label htmlFor="edit-private" className="flex items-center gap-1.5 text-xs font-light text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors">
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground stroke-[1.5]" /> Private Isolated View
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* ACTION FOOTER SUBMITS LAYERS */}
            <DialogFooter className="gap-2 pt-4 border-t border-border/20">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-xs uppercase tracking-widest font-medium h-10 px-4 border border-border/40 hover:bg-muted/60 rounded-lg">
                Cancel
              </Button>
              <Button type="submit" disabled={editReviewMutation.isPending} className="text-xs uppercase tracking-widest font-medium h-10 px-5 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity">
                {editReviewMutation.isPending ? 'Saving Vector Changes...' : 'Save Configuration Changes'}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}