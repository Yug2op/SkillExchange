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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Icons
import {
  ArrowLeft,
  Star,
  Award,
  AlertCircle,
  Send,
  Eye,
  EyeOff,
  Sparkles,
  Loader2
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

  // Get exchange details safely
  const { data: exchangeData, isLoading: exchangeLoading } = useQuery({
    queryKey: ['exchange', exchangeId],
    queryFn: () => getExchange(exchangeId),
    enabled: !!exchangeId,
  });

  const exchange = exchangeData?.data?.exchange;
  const isSender = exchange?.sender?._id === currentUserId;
  const otherUser = isSender ? exchange?.receiver : exchange?.sender;

  // Create review mutation keeping your query invalidate paths intact
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <BrandLoader/>
          </div>
    );
  }

  if (!exchange) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm space-y-6">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-medium tracking-tight">Exchange Log Absent</h3>
            <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">The target tracking transaction context you are attempting to review does not exist.</p>
          </div>
          <Button asChild className="w-full text-xs uppercase tracking-widest font-medium py-5 rounded-lg bg-foreground text-background">
            <Link to="/exchanges"><ArrowLeft className="mr-2 h-3.5 w-3.5" /> Return to Transactions</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-12">
        
        {/* INTERFACE BREADCRUMB HEADER */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Button variant="ghost" size="sm" asChild className="text-xs uppercase tracking-widest font-medium h-9 px-3 -ml-3 hover:bg-muted/60">
            <Link to="/exchanges">
              <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Back to Exchanges
            </Link>
          </Button>
          <div className="pt-2">
            <h1 className="text-4xl font-light tracking-tighter leading-none">Write a Review.</h1>
            <p className="text-sm text-muted-foreground font-light mt-3">
              Share your experience with <span className="font-medium text-foreground">{otherUser?.name}</span>
            </p>
          </div>
        </motion.div>

        {/* COMPACT TRANSACTION MATRIX FEEDBACK */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="border border-border/30 bg-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-medium">
            <Award className="h-4 w-4" /> <span>Exchange Summary</span>
          </div>
          
          <div className="text-sm font-light text-muted-foreground leading-relaxed">
            {isSender 
              ? `You learned ${exchange?.skillRequested} from ${otherUser?.name}`
              : `${otherUser?.name} learned ${exchange?.skillRequested} from you`
            }
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/20 text-xs font-light">
            <div className="space-y-0.5">
              <div className="text-muted-foreground/60 uppercase font-mono tracking-wider text-[10px]">Skill Requested</div>
              <div className="font-medium text-foreground">{exchange?.skillRequested}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-muted-foreground/60 uppercase font-mono tracking-wider text-[10px]">Skill Offered</div>
              <div className="font-medium text-foreground">{exchange?.skillOffered}</div>
            </div>
          </div>
        </motion.div>

        {/* INPUT FORM BLOCK MATRIX */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* OVERALL STAR RATING NODE */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium">Overall Rating *</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onMouseEnter={() => setHoveredRating(rating)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => handleRatingClick(rating)}
                    className="p-1 hover:scale-110 transition-all duration-150 outline-none"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        rating <= (hoveredRating || formData.rating)
                          ? 'fill-secondary text-secondary'
                          : 'text-border/80 hover:text-secondary/50'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-4 text-xs font-light text-muted-foreground font-mono uppercase tracking-wider">
                  {formData.rating > 0 ? `${formData.rating} / 5 selected` : 'Awaiting input'}
                </span>
              </div>
            </div>

            {/* SEGMENTED ASPECT SUB-RATINGS */}
            <div className="space-y-4 pt-2 border-t border-border/20">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium block">Detailed Ratings</Label>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  { key: 'communication', label: 'Communication' },
                  { key: 'knowledge', label: 'Knowledge & Expertise' },
                  { key: 'punctuality', label: 'Punctuality' },
                  { key: 'patience', label: 'Patience & Teaching Style' }
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2.5 p-4 border border-border/30 bg-card/40 rounded-xl flex items-center justify-between gap-4">
                    <Label className="text-xs font-light text-foreground/80">{label}</Label>
                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleAspectRatingChange(key, rating)}
                          className={`h-6 w-6 font-mono text-[10px] font-medium rounded border transition-all ${
                            rating <= formData.aspectRatings[key]
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-transparent text-muted-foreground border-border/60 hover:border-foreground/30'
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

            {/* INPUT CHIP ELEMENT - SKILL MATRIX INLINE TYPE */}
            <div className="space-y-2 pt-2 border-t border-border/20">
              <Label htmlFor="skillTaught" className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium">What skill did you learn? (Optional)</Label>
              <div className="relative border-b border-border/60 focus-within:border-foreground transition-colors duration-200 py-1">
                <input
                  id="skillTaught"
                  type="text"
                  value={formData.skillTaught}
                  onChange={(e) => setFormData(prev => ({ ...prev, skillTaught: e.target.value }))}
                  placeholder="e.g., React Hooks, Advanced JavaScript, etc."
                  className="w-full bg-transparent px-0 h-9 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/30 font-light"
                />
              </div>
            </div>

            {/* LARGE TEXTAREA DESCRIPTION INPUT CONTAINER */}
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium">Your Experience (Optional)</Label>
              <div className="border border-border/40 focus-within:border-foreground/60 rounded-xl p-3 bg-card transition-colors">
                <Textarea
                  id="feedback"
                  value={formData.feedback}
                  onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Share your experience, what went well, what could be improved..."
                  rows={4}
                  maxLength={500}
                  className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light text-sm shadow-none"
                />
                <div className="text-right text-[10px] font-mono text-muted-foreground/40 pt-2">
                  {formData.feedback.length} / 500 characters
                </div>
              </div>
            </div>

            {/* RADIO BUTTON PRIVACY SELECTION GROUPS */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium block">Privacy Setting</Label>
              <RadioGroup
                value={formData.isPublic ? 'public' : 'private'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isPublic: value === 'public' }))}
                className="gap-3"
              >
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <RadioGroupItem value="public" id="public" className="data-[state=checked]:bg-primary" />
                  <Label htmlFor="public" className="flex items-center gap-2 text-xs font-light text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer">
                    <Eye className="h-3.5 w-3.5 text-primary stroke-[1.5]" />
                    Public - Visible to all users
                  </Label>
                </div>
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <RadioGroupItem value="private" id="private" className="data-[state=checked]:bg-primary" />
                  <Label htmlFor="private" className="flex items-center gap-2 text-xs font-light text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer">
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground stroke-[1.5]" />
                    Private - Only visible to you
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* SUBMIT BUTTON CONTROL ACTIONS LOOP */}
            <div className="flex gap-4 pt-4 border-t border-border/20">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/exchanges')}
                className="flex-1 text-xs uppercase tracking-widest font-medium py-6 border border-border/40 hover:bg-muted/60 rounded-xl transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createReviewMutation.isPending || formData.rating === 0}
                className="flex-1 text-xs uppercase tracking-widest font-medium py-6 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity gap-2"
              >
                {createReviewMutation.isPending ? (
                  'Submitting Sequence...'
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Submit Review
                  </>
                )}
              </Button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}