import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getMyGivenReviews, getUserReviews } from '@/api/ReviewApi';
import { useMe } from '@/hooks/useMe';

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
  Star,
  Calendar,
  Plus,
  ArrowRight,
  Eye,
  Loader2
} from 'lucide-react';

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

  const stats = {
    given: givenReviews.length,
    received: receivedReviews.length,
    averageRating: receivedReviews.length > 0 
      ? (receivedReviews.reduce((sum, review) => sum + review.rating, 0) / receivedReviews.length).toFixed(1)
      : 0
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-primary';
    if (rating >= 3) return 'text-secondary';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        
        {/* TOP LEVEL NAVIGATION HEADER ARCHITECTURE */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-light tracking-tighter leading-none flex items-center gap-3">
              <Star className="h-7 w-7 text-primary stroke-[1.25]" /> My Reviews.
            </h1>
            <p className="text-sm text-muted-foreground font-light">
              Manage your skill exchange reviews and feedback logs natively.
            </p>
          </div>

          <Button asChild variant="outline" className="text-xs uppercase tracking-widest font-medium h-11 px-5 border border-border/40 hover:bg-muted/60 bg-card text-foreground rounded-lg gap-2 self-start sm:self-auto transition-all">
            <Link to={`/exchanges`}>
              <Plus className="h-3.5 w-3.5" /> View Exchanges
            </Link>
          </Button>
        </motion.div>

        {/* COMPACT METRICS SYSTEM OVERLAYS */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="grid gap-6 grid-cols-2 sm:grid-cols-3"
        >
          <div className="p-6 border border-border/30 bg-card rounded-xl">
            <div className="text-3xl font-light text-foreground">{stats.given}</div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Reviews Given</div>
          </div>
          <div className="p-6 border border-border/30 bg-card rounded-xl">
            <div className="text-3xl font-light text-primary">{stats.received}</div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Reviews Received</div>
          </div>
          <div className="p-6 border border-border/30 bg-card rounded-xl col-span-2 sm:col-span-1">
            <div className={`text-3xl font-light ${getRatingColor(stats.averageRating)}`}>
              {stats.averageRating}
            </div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">Average Rating</div>
          </div>
        </motion.div>

        {/* SORT CONTROLS OPTIONS STRIP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex pt-2"
        >
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-10 rounded-lg bg-card border-border/40 focus:ring-0">
              <SelectValue placeholder="Sort Parameters" />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border-border/40">
              <SelectItem value="recent">Most Recent First</SelectItem>
              <SelectItem value="oldest">Oldest Array First</SelectItem>
              <SelectItem value="rating">By Rating Indices</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* TABS DIRECTORY MANAGER WRAPPER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
            <TabsList className="w-full h-auto p-0 bg-transparent border-b border-border/30 rounded-none justify-start gap-4">
              <TabsTrigger value="given" className="h-10 px-4 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs font-medium uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all">
                Reviews Given ({stats.given})
              </TabsTrigger>
              <TabsTrigger value="received" className="h-10 px-4 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs font-medium uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all">
                Reviews Received ({stats.received})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="given" className="mt-8 outline-none">
              <ReviewsSection 
                reviews={givenReviews} 
                isLoading={givenLoading}
                type="given"
                currentUserId={currentUserId}
                formatDate={formatDate}
              />
            </TabsContent>

            <TabsContent value="received" className="mt-8 outline-none">
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
  );
}

function ReviewsSection({ reviews, isLoading, type, formatDate }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4 opacity-40 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-12 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 max-w-sm mx-auto space-y-4"
      >
        <div className="p-3 w-fit rounded-xl bg-muted border border-border/10 mx-auto text-muted-foreground/40">
          <Star className="h-5 w-5 stroke-[1.25]" />
        </div>
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          {type === 'given' 
            ? 'Complete skill exchanges to start logging constructive performance evaluation arrays.'
            : 'Your global profile record has not received transaction evaluation metrics yet.'
          }
        </p>
        <Button asChild variant="link" className="text-xs uppercase tracking-wider font-medium text-primary">
          <Link to="/exchanges">Verify Open Exchanges</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16 pt-4">
      <AnimatePresence mode="popLayout">
        {reviews.map((review, index) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex flex-col justify-between"
          >
            <div>
              {/* HEADING AVATAR AND USER IDENTITY STRUCT */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 filter grayscale group-hover:grayscale-0 transition-all duration-500 rounded-full ring-1 ring-border/40">
                    <AvatarImage 
                      src={type === 'given' 
                        ? review.reviewee?.profilePic?.url 
                        : review.reviewer?.profilePic?.url
                      } 
                    />
                    <AvatarFallback className="text-xs font-medium bg-muted">U</AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium tracking-tight text-foreground">
                      {type === 'given' ? `Review for ${review.reviewee?.name}` : `Review from ${review.reviewer?.name}`}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-light text-muted-foreground/70">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-2.5 w-2.5 ${i < review.rating ? 'fill-secondary text-secondary' : 'text-border/60'}`} />
                        ))}
                      </div>
                      <span className="font-mono text-[11px] text-foreground/80">{review.rating}.0 / 5.0</span>
                    </div>
                  </div>
                </div>

                {/* VIEW SPECIFIC DETAILS NAVIGATION FOR HANDLER PATHS */}
                {type === 'given' && (
                  <Link to={`/reviews/${review._id}`} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-7 w-7 rounded-full bg-muted/60 hover:bg-foreground hover:text-background flex items-center justify-center transition-colors">
                      <Eye className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                )}
              </div>

              {/* DYNAMIC CONTEXT MAPPING REFERENCE BLOCK */}
              {review.exchange && (
                <div className="mb-3 text-[11px] font-light text-muted-foreground/60 font-mono uppercase tracking-wide truncate">
                  <span className="text-foreground/40 font-medium">Array Trace:</span> {review.exchange.skillOffered} ⇄ {review.exchange.skillRequested}
                </div>
              )}

              {/* LOG FEEDBACK CONTENT BLOCKS */}
              {review.feedback && (
                <p className="text-sm text-muted-foreground/90 font-light leading-relaxed mb-4 italic line-clamp-3 pr-4">
                  "{review.feedback}"
                </p>
              )}
            </div>

            {/* LOWER ASPECT DETAILED MATRICES ELEMENT INDICATOR */}
            {review.aspectRatings && (
              <div className="mt-2 pt-3 border-t border-border/30 grid grid-cols-2 gap-x-4 gap-y-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                {Object.entries(review.aspectRatings).map(([aspect, rating]) => (
                  <div key={aspect} className="flex items-center justify-between gap-2 text-[11px] font-light text-muted-foreground/80">
                    <span className="capitalize text-foreground/60">{aspect}:</span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${i < rating ? 'bg-secondary' : 'bg-border/60'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LOWER CORNER DATE TIMESTAMP FOOTPRINT */}
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/30 font-light mt-4">
              <Calendar className="h-3 w-3" /> <span>Logged {formatDate(review.createdAt)}</span>
            </div>

          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}