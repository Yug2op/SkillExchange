import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getUser } from '@/api/UserApi';
import { getMyExchanges } from '@/api/ExchangeApi';
import { getUserReviews } from '@/api/ReviewApi';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// Icons
import {
  ArrowLeft,
  Star,
  BookOpen,
  Target,
  CheckCircle2,
  AlertCircle,
  Send,
  MapPin,
  Clock,
  Award,
  Users,
  TrendingUp,
  Shield,
  Trophy,
  Sparkles
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
  const completedExchanges = userExchanges.filter(
    exchange => exchange.status?.toLowerCase() === 'completed' && (exchange.sender?.id === id || exchange.receiver?.id === id)
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground max-w-7xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-12">
          <div className="h-8 bg-muted rounded-lg w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-44 bg-muted rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="h-40 bg-muted rounded-xl" />
                <div className="h-40 bg-muted rounded-xl" />
              </div>
            </div>
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm space-y-6">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-medium tracking-tight">User Node Absent</h3>
            <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">The requested directory profile does not correspond to an active network entry.</p>
          </div>
          <Button asChild className="w-full text-xs uppercase tracking-widest font-medium py-5 rounded-lg bg-foreground text-background">
            <Link to="/search"><ArrowLeft className="mr-2 h-3.5 w-3.5" /> Return to Directory</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-primary';
    if (rating >= 3.5) return 'text-secondary';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">

        {/* TOP INTERFACE UTILITY HEADER BAR */}
        <div className="flex items-center justify-between">
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-xs uppercase tracking-widest font-medium h-10 px-3 hover:bg-muted/60">
              <Link to="/search">
                <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Back
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-5 border-border/30" />
            <div>
              <h1 className="text-sm font-mono uppercase tracking-widest text-muted-foreground/60">Profile</h1>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Link to={`/exchanges/request/${user._id}`}>
              <Button className="w-full text-xs uppercase tracking-widest font-medium py-6 rounded-xl bg-foreground text-background hover:bg-foreground/80 gap-2 transition-all group">
                Request Exchange <Send className="h-1 w-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>



        {/* TWO COLUMN PLATFORM LAYOUT */}
        <div className="grid gap-12 lg:grid-cols-3">

          {/* LEFT INNER COMPONENT: MAIN BIOGRAPHICAL CORE */}
          <div className="lg:col-span-2 space-y-12">

            {/* HERO BIOGRAPHY PANEL */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="border-b border-border/20 pb-10">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative shrink-0">
                  <Avatar className="h-20 w-20 rounded-full ring-1 ring-border/40">
                    <AvatarImage src={user.profilePic?.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} alt={user.name} />
                    <AvatarFallback className="text-sm font-medium bg-muted">{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user.isEmailVerified && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-background border border-border/40 text-secondary rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 flex-1">
                  <div className="space-y-1.5">
                    <h2 className="text-3xl font-light tracking-tight">{user.name}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-light">
                      {user.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {user.location.city}, {user.location.country}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-foreground/5" />
                        <span className={`font-medium ${getRatingColor(user.rating?.average)}`}>
                          {user.rating?.average?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-muted-foreground/60">({user.rating?.count || 0} index reviews)</span>
                      </span>
                    </div>
                  </div>

                  {user.bio && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground/90 leading-relaxed font-light pr-4">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* SYMMETRIC DUAL INDEX SKILLS DATA MATRIX */}
            <div className="grid gap-12 sm:grid-cols-2">
              {/* Skills to Teach Panel */}
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium tracking-wide flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary stroke-[1.5]" />
                     User Skills ({user.skillsToTeach?.length || 0})
                  </h3>
                  <p className="text-xs text-muted-foreground font-light"> The skills user is able to teach.</p>
                </div>

                {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {user.skillsToTeach.map((skillObj) => (
                      <span key={skillObj.skill} className="text-xs font-light px-3 py-1 bg-card border border-border/40 text-foreground/90 rounded-md">
                        {skillObj.skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground/50 font-light pt-2">No user skills listed.</p>
                )}
              </motion.div>

              {/* Skills to Learn Panel */}
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium tracking-wide flex items-center gap-2">
                    <Target className="h-4 w-4 text-secondary stroke-[1.5]" />
                     Targeted Skills ({user.skillsToLearn?.length || 0})
                  </h3>
                  <p className="text-xs text-muted-foreground font-light"> The skills user is interested in learning.</p>
                </div>

                {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {user.skillsToLearn.map((skillObj) => (
                      <span key={skillObj.skill} className="text-xs font-light px-3 py-1 bg-background border border-border/40 text-muted-foreground rounded-md">
                        {skillObj.skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground/50 font-light pt-2">No target acquisition arrays listed.</p>
                )}
              </motion.div>
            </div>

            {/* PLATFORM STATISTICS INDICES */}
            {user.lastActive && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-6 border-t border-border/20 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5" /> Node Activity Audit
                </h3>
                <div className="grid gap-4 grid-cols-3">
                  <div className="p-4 border border-border/30 bg-muted rounded-xl text-center space-y-0.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50 flex items-center justify-center gap-1"><Clock className="h-3 w-3" /> Last Active</div>
                    <div className="text-xs font-medium text-foreground">{new Date(user.lastActive).toLocaleDateString()}</div>
                  </div>
                  <div className="p-4 border border-border/30 bg-muted rounded-xl text-center space-y-0.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50 flex items-center justify-center gap-1"><Users className="h-3 w-3" /> Initialization</div>
                    <div className="text-xs font-medium text-foreground">{new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="p-4 border border-border/30 bg-muted rounded-xl text-center space-y-0.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50 flex items-center justify-center gap-1"><Award className="h-3 w-3" /> Completions</div>
                    <div className="text-xs font-medium text-primary">{completedExchanges || 0} logs</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT INNER COMPONENT: INTERFACE CONNECT CONTROLS & TESTIMONIAL AUDITS */}
          <div className="space-y-8">

            {/* CORE ENGAGEMENT MATCH RADIAL WRAPPER */}
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="p-6 border border-border/40 bg-muted rounded-2xl space-y-6">
              <div className="space-y-1">
                <h4 className="text-xs font-mono uppercase tracking-widest text-primary font-medium flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Exchange Potential
                </h4>
                <p className="text-[11px] text-muted-foreground font-light">Autonomous synchronization parameters derived across system profiles.</p>
              </div>

              <div className="space-y-2.5 text-xs font-light text-muted-foreground border-y border-border/20 py-4">
                <div className="flex items-center justify-between"><span>Skill Congruence</span><span className="font-mono text-foreground">High Density</span></div>
                <div className="flex items-center justify-between"><span>Response Interval</span><span className="font-mono text-foreground">95% Latency</span></div>
                <div className="flex items-center justify-between"><span>Handshake Success</span><span className="font-mono text-foreground">92% Matrix</span></div>
              </div>

              <div className="text-center pt-2">
                <div className="text-2xl font-light text-primary">Excellent Vector</div>
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-mono mt-0.5">Correlation Quality</div>
              </div>
            </motion.div>

            {/* TRUST CRITERIA ATTRIBUTE SYNC */}
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="p-6 border border-border/30 bg-muted rounded-2xl space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/80 font-medium flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" /> Integrity Validation
              </h4>
              <div className="space-y-2 text-xs font-light text-muted-foreground">
                {user.isEmailVerified && <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Verified communication nodes</div>}
                <div className="flex items-center gap-2"><Star className="h-3.5 w-3.5 text-secondary" /> {user.rating?.average?.toFixed(1) || '0.0'} composite evaluation index</div>
                <div className="flex items-center gap-2"><Trophy className="h-3.5 w-3.5 text-primary" /> {completedExchanges || 0} validated transaction handshakes</div>
              </div>
            </motion.div>

            {/* REVIEWS SEGMENT PANEL BLOCK */}
            {userReviewsData?.data?.reviews?.length > 0 && (
              <motion.div initial={{ y: 15, opacity: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-4">

                <div className="space-y-4">

                  {userReviewsData.data.reviews.slice(0, 3).map((review) => (
                    <div key={review._id} className="p-4 border border-border/40 bg-muted rounded-xl space-y-3">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 font-medium flex items-center gap-2">
                          <Star className="h-3.5 w-3.5" /> Evaluation Logs ({userReviewsData.data.reviews.length})
                        </h4>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 rounded-full ring-1 ring-border/20">
                            <AvatarImage src={review.reviewer?.profilePic?.url} />
                            <AvatarFallback className="text-[10px] font-mono">{review.reviewer?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground/90">{review.reviewer?.name || "Peer User"}</span>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-2.5 w-2.5 ${i < review.rating ? 'fill-secondary text-secondary' : 'text-border'}`} />
                          ))}
                        </div>
                      </div>

                      {review.feedback && (
                        <p className="text-xs text-muted-foreground font-light leading-relaxed italic line-clamp-2 pl-1">
                          "{review.feedback}"
                        </p>
                      )}
                    </div>
                  ))}

                  {userReviewsData.data.reviews.length > 3 && (
                    <Button variant="ghost" size="sm" asChild className="w-full text-xs uppercase tracking-wider font-medium text-primary hover:bg-primary/5">
                      <Link to="/reviews?filter=received">
                        Access All Reviews Matrix ({userReviewsData.data.reviews.length})
                      </Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}