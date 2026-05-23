import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useMe } from '@/hooks/useMe';
import {
  getExchange,
  acceptExchange,
  rejectExchange,
  completeExchange,
  cancelExchange,
  scheduleSession
} from '@/api/ExchangeApi';
import { checkReviewExists } from '@/api/ReviewApi';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Icons
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Award,
  Target,
  TrendingUp,
  User,
  Mail,
  Link as LinkIcon,
  BookOpen,
  GraduationCap,
  Edit,
  Loader2
} from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';

const statusConfig = {
  pending: {
    color: 'bg-secondary text-foreground border-border/40',
    icon: Clock,
    label: 'Pending Approval'
  },
  accepted: {
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: CheckCircle2,
    label: 'Accepted'
  },
  rejected: {
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: XCircle,
    label: 'Rejected'
  },
  completed: {
    color: 'bg-secondary text-primary border-primary/20',
    icon: Award,
    label: 'Completed'
  },
  cancelled: {
    color: 'bg-muted text-muted-foreground border-border/10',
    icon: AlertCircle,
    label: 'Cancelled'
  }
};

const statusActions = {
  sender: {
    pending: [{ action: 'Cancel', variant: 'destructive', icon: XCircle }],
    accepted: [{ action: 'Mark as Completed', variant: 'default', icon: CheckCircle2 }],
    completed: [], rejected: [], cancelled: []
  },
  receiver: {
    pending: [
      { action: 'Accept', variant: 'default', icon: CheckCircle2 },
      { action: 'Reject', variant: 'destructive', icon: XCircle }
    ],
    accepted: [{ action: 'Mark as Completed', variant: 'default', icon: CheckCircle2 }],
    completed: [], rejected: [], cancelled: []
  }
};

export default function ExchangeDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: meData } = useMe();
  const currentUserId = meData?._id;

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    type: 'online',
    location: '',
    meetingLink: ''
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['exchange', id],
    queryFn: () => getExchange(id),
    enabled: !!id,
  });

  const exchange = data?.data?.exchange;
  const isSender = exchange?.sender?._id === currentUserId;
  const otherUser = isSender ? exchange?.receiver : exchange?.sender;
  const currentStatus = exchange?.status?.toLowerCase();

  const { data: reviewCheck } = useQuery({
    queryKey: ['review-check', id, currentUserId],
    queryFn: () => checkReviewExists(id),
    enabled: !!currentUserId && currentStatus === 'completed',
  });

  const handleAction = async (action) => {
    try {
      let response;
      switch (action) {
        case 'Accept': response = await acceptExchange(id); break;
        case 'Reject': response = await rejectExchange(id, { reason: 'Exchange rejected' }); break;
        case 'Mark as Completed': response = await completeExchange(id); break;
        case 'Cancel': response = await cancelExchange(id); break;
        default: return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`Exchange ${action.toLowerCase()} successfully`);
      queryClient.invalidateQueries(['exchange', id]);
      queryClient.invalidateQueries(['exchanges']);
    } catch (error) {
      console.error('Action failed:', error);
      toast.error(error.response?.data?.message || `Failed to ${action.toLowerCase()} exchange`);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date: scheduleData.date,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        type: scheduleData.type,
        ...(scheduleData.type === 'online' ? { meetingLink: scheduleData.meetingLink } : { location: scheduleData.location })
      };

      await scheduleSession(id, payload);
      toast.success('Session scheduled successfully');
      setIsScheduling(false);
      queryClient.invalidateQueries(['exchange', id]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule session');
    }
  };

  const handleScheduleChange = (field, value) => {
    setScheduleData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <BrandLoader/>
          </div>
    );
  }

  if (isError || !exchange) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm space-y-6">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-medium tracking-tight">Exchange Record Absent</h3>
            <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">The target knowledge handshake profile index cannot be validated or has expired.</p>
          </div>
          <Button asChild className="w-full text-xs uppercase tracking-widest font-medium py-5 rounded-lg bg-foreground text-background">
            <Link to="/exchanges"><ArrowLeft className="mr-2 h-3.5 w-3.5" /> Return to Directory</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const statusInfo = statusConfig[currentStatus] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;
  const availableActions = isSender ? statusActions.sender[currentStatus] || [] : statusActions.receiver[currentStatus] || [];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        
        {/* INTERFACE ACTION BAR HEADER */}
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-4">
            <Button variant="ghost" size="sm" asChild className="text-xs uppercase tracking-widest font-medium h-9 px-3 -ml-3 hover:bg-muted/60">
              <Link to="/exchanges"><ArrowLeft className="h-3.5 w-3.5 mr-2" /> All Exchanges</Link>
            </Button>
            <div className="pt-1">
              <h1 className="text-3xl font-light tracking-tighter leading-none">
                Skill Exchange {isSender ? 'with' : 'from'} {otherUser?.name}
              </h1>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/50 mt-3">
                Initialized on {format(new Date(exchange.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>

          <Badge variant="outline" className={`text-[10px] uppercase font-mono tracking-widest py-1.5 px-3 rounded-lg gap-2 self-start sm:self-auto ${statusInfo.color}`}>
            <StatusIcon className="h-3 w-3 stroke-[2]" /> {statusInfo.label}
          </Badge>
        </motion.div>

        {/* TWO COLUMN INTERACTION PLATFORM GRID */}
        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* LEFT AXIS COLUMN: TRANSACTION SCHEMA DETAILS */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* CORE DIRECTION OVERVIEW BLOCK */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-8">
              <div className="space-y-1 pb-4 border-b border-border/20">
                <h3 className="text-xs font-mono uppercase tracking-widest text-primary font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 stroke-[1.5]" /> Exchange Metrics
                </h3>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground/60 flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Core Acquisition</span>
                  <div className="text-lg font-medium text-foreground tracking-tight">{exchange.skillRequested}</div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground/60 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Complementary Offloading</span>
                  <div className="text-lg font-medium text-foreground tracking-tight">{exchange.skillOffered}</div>
                </div>
              </div>

              {exchange.message && (
                <div className="space-y-2 pt-4 border-t border-border/20">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground/50 flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Initial Proposal Context</span>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed italic bg-background border border-border/30 rounded-xl p-4">
                    "{exchange.message}"
                  </p>
                </div>
              )}
            </motion.div>

            {/* DYNAMIC TIMELINE SCHEDULED SESSIONS ROW MAP */}
            {exchange.scheduledSessions && exchange.scheduledSessions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" /> Mapped Calendars Array
                </h3>
                
                <div className="space-y-3">
                  {exchange.scheduledSessions.map((session, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/30 bg-card/60 rounded-xl gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-background border border-border/20 flex items-center justify-center text-muted-foreground/70">
                          {session.type === 'online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium tracking-tight text-foreground">{format(new Date(session.date), 'EEEE, MMMM d, yyyy')}</div>
                          <div className="text-xs text-muted-foreground/60 font-mono flex items-center gap-1"><Clock className="h-3 w-3" /> {session.startTime} - {session.endTime}</div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-[9px] font-mono tracking-wider px-2 py-0.5 uppercase ${session.completed ? 'border-primary/20 bg-primary/5 text-primary' : 'border-border bg-muted'}`}>
                          {session.completed ? 'Completed' : 'Upcoming'}
                        </Badge>
                        {session.type === 'online' && session.meetingLink && (
                          <Button size="sm" variant="ghost" className="h-8 text-xs text-primary font-medium uppercase tracking-wider px-2.5 border border-primary/20 hover:bg-primary/5" asChild>
                            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"><LinkIcon className="h-3 w-3 mr-1" /> Join Pipeline</a>
                          </Button>
                        )}
                        {session.type === 'offline' && session.location && (
                          <span className="text-xs font-light text-muted-foreground tracking-tight">📍 {session.location}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TRANSACTION OPERATION STATE HANDLING HOOK ACTIONS CONTROLS */}
            {availableActions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center gap-3 flex-wrap">
                {availableActions.map((action) => {
                  const ActionIcon = action.icon;
                  const isDestructive = action.variant === 'destructive';
                  return (
                    <Button
                      key={action.action}
                      onClick={() => handleAction(action.action)}
                      className={`text-xs uppercase tracking-widest font-medium py-6 px-6 rounded-xl transition-all gap-2 ${
                        isDestructive 
                          ? 'bg-transparent border border-destructive/20 text-destructive hover:bg-destructive/10' 
                          : 'bg-foreground text-background hover:opacity-90'
                      }`}
                    >
                      <ActionIcon className="h-3.5 w-3.5" /> {action.action}
                    </Button>
                  );
                })}

                {/* MODAL DIALOG TIME INTERVAL SCHEDULE GENERATOR */}
                {currentStatus === 'accepted' && (
                  <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-xs uppercase tracking-widest font-medium py-6 px-6 border border-border/40 hover:bg-muted/60 bg-card text-foreground rounded-xl gap-2 transition-all">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {exchange.scheduledSessions?.length > 0 ? 'Reschedule Segment' : 'Schedule Pipeline Session'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full sm:max-w-md bg-card text-foreground border-border/40 rounded-xl">
                      <DialogHeader className="text-left">
                        <DialogTitle className="text-lg font-medium tracking-tight">
                          {exchange.scheduledSessions?.length > 0 ? 'Reschedule Session' : 'Schedule a Session'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground font-light leading-relaxed">
                          Set up a specific timeline segment to trade performance coordinates with {otherUser?.name}.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleScheduleSubmit} className="space-y-6 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="date" className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">Target Date</Label>
                            <Input id="date" type="date" value={scheduleData.date} onChange={(e) => handleScheduleChange('date', e.target.value)} min={new Date().toISOString().split('T')[0]} required className="h-10 rounded-lg bg-background border-border/40 text-sm focus:ring-0" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="startTime" className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">Start Time</Label>
                            <Input id="startTime" type="time" value={scheduleData.startTime} onChange={(e) => handleScheduleChange('startTime', e.target.value)} required className="h-10 rounded-lg bg-background border-border/40 text-sm focus:ring-0" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="endTime" className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">End Time</Label>
                          <Input id="endTime" type="time" value={scheduleData.endTime} onChange={(e) => handleScheduleChange('endTime', e.target.value)} required className="h-10 rounded-lg bg-background border-border/40 text-sm focus:ring-0" />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-mono font-medium">Channel Vector Type</Label>
                          <RadioGroup value={scheduleData.type} onValueChange={(value) => handleScheduleChange('type', value)} className="gap-2.5">
                            <div className="flex items-center space-x-3 cursor-pointer group">
                              <RadioGroupItem value="online" id="online" className="data-[state=checked]:bg-primary" />
                              <Label htmlFor="online" className="flex items-center gap-2 text-xs font-light text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors">
                                <Video className="h-3.5 w-3.5 text-primary stroke-[1.5]" /> Online Virtual Matrix
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 cursor-pointer group">
                              <RadioGroupItem value="offline" id="offline" className="data-[state=checked]:bg-primary" />
                              <Label htmlFor="offline" className="flex items-center gap-2 text-xs font-light text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors">
                                <MapPin className="h-3.5 w-3.5 text-secondary stroke-[1.5]" /> Physical Location Checkpoint
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {scheduleData.type === 'online' ? (
                          <div className="space-y-2">
                            <Label htmlFor="meetingLink" className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">Virtual Coordinate Endpoint (Link)</Label>
                            <div className="relative border-b border-border/60 focus-within:border-foreground transition-colors duration-200 py-1">
                              <Input id="meetingLink" type="url" placeholder="https://meet.example.com/abc" value={scheduleData.meetingLink} onChange={(e) => handleScheduleChange('meetingLink', e.target.value)} required className="border-0 bg-transparent px-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor="location" className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">Checkpoint Address</Label>
                            <div className="relative border-b border-border/60 focus-within:border-foreground transition-colors duration-200 py-1">
                              <Input id="location" placeholder="Coffee shop, operational lab, library..." value={scheduleData.location} onChange={(e) => handleScheduleChange('location', e.target.value)} required className="border-0 bg-transparent px-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light" />
                            </div>
                          </div>
                        )}

                        <DialogFooter className="gap-2 pt-4 border-t border-border/20">
                          <Button type="button" variant="ghost" onClick={() => setIsScheduling(false)} className="text-xs uppercase tracking-widest font-medium h-10 px-4 border border-border/40 hover:bg-muted/60 rounded-lg">Cancel</Button>
                          <Button type="submit" className="text-xs uppercase tracking-widest font-medium h-10 px-5 rounded-lg bg-foreground text-background hover:opacity-90">
                            {exchange.scheduledSessions?.length > 0 ? 'Reschedule Array' : 'Commit Schedule'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </motion.div>
            )}

            {/* TRANSACTION HANDSHAKE COMPLETION SUBMISSION MODULE */}
            {currentStatus === 'completed' && (
              <motion.div initial={{ scale: 0.99, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6 border border-primary/20 bg-card rounded-2xl text-center space-y-4 max-w-md mx-auto">
                <CheckCircle2 className="h-10 w-10 text-primary mx-auto stroke-[1.25]" />
                <div className="space-y-1">
                  <h3 className="text-base font-medium tracking-tight">Exchange Completed!</h3>
                  <p className="text-xs text-muted-foreground/80 font-light leading-relaxed">
                    Transaction logged inside global profiles. Submit an evaluation review to document {otherUser?.name}'s instruction performance.
                  </p>
                </div>
                <div className="pt-2">
                  {reviewCheck?.data?.hasReview ? (
                    <Button asChild variant="ghost" className="text-xs uppercase tracking-widest font-medium h-11 px-6 border border-border/40 hover:bg-muted/60 rounded-lg gap-2 w-full">
                      <Link to={`/reviews/${reviewCheck.data.reviewId}`}><Edit className="h-3.5 w-3.5 text-primary" /> Modify Existing Review</Link>
                    </Button>
                  ) : (
                    <Button asChild className="text-xs uppercase tracking-widest font-medium h-11 px-6 bg-primary text-primary-foreground hover:opacity-90 rounded-lg gap-2 w-full">
                      <Link to={`/reviews/create/${exchange._id}`}><Star className="h-3.5 w-3.5" /> Log Evaluation Review</Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT AXIS COLUMN: SIDEBAR METADATA & PROGRESS ROUTING */}
          <div className="space-y-8">
            
            {/* EXTERNAL CONTRACT NODE PROFILE IDENTIFICATION */}
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="p-6 border border-border/30 bg-card rounded-2xl space-y-6 shadow-sm">
              <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground/60 font-medium block">
                {isSender ? 'Learning Partner' : 'Exchange Sender'}
              </span>
              
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 filter grayscale contrast-125 rounded-full ring-1 ring-border/40">
                  <AvatarImage src={otherUser?.profilePic?.url} />
                  <AvatarFallback className="text-sm font-mono font-medium bg-muted">{otherUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-foreground tracking-tight">{otherUser?.name}</div>
                  <div className="text-[11px] text-muted-foreground/80 font-light flex items-center gap-1">
                    <Star className="h-3 w-3 fill-secondary text-secondary" />
                    <span>{otherUser?.rating?.average?.toFixed(1) || '0.0'} ({otherUser?.rating?.count || 0} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-light text-muted-foreground border-t border-border/20 pt-4">
                {otherUser?.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    <a href={`mailto:${otherUser.email}`} className="text-foreground/80 hover:text-primary transition-colors truncate">{otherUser.email}</a>
                  </div>
                )}
                {otherUser?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    <span className="truncate">{otherUser.location.city}, {otherUser.location.country}</span>
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm" className="w-full text-xs uppercase tracking-widest font-medium h-9 border border-border/40 hover:bg-muted/60 rounded-lg mt-2" asChild>
                <Link to={`/users/${otherUser?._id}`}>Inspect Profile</Link>
              </Button>
            </motion.div>

            {/* QUICK ROUTER MATRIX LINK CONSOLE */}
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="p-6 border border-border/30 bg-card rounded-2xl space-y-4 shadow-sm">
              <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 font-medium">Frictionless Actions</h4>
              <div className="flex flex-col gap-2.5">
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs uppercase tracking-wider font-medium h-10 px-4 border border-border/40 hover:bg-muted/60 rounded-lg gap-2" asChild>
                  <Link to={`/chat/${otherUser?._id}`}><MessageSquare className="h-3.5 w-3.5 text-secondary" /> Initiate Conversation</Link>
                </Button>
                {currentStatus === 'accepted' && (
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs uppercase tracking-wider font-medium h-10 px-4 border border-border/40 hover:bg-muted/60 rounded-lg gap-2 opacity-50" disabled>
                    <Calendar className="h-3.5 w-3.5" /> View Integrated Calendar
                  </Button>
                )}
              </div>
            </motion.div>

            {/* PROGRESS SEQUENCE FOOTPRINT STEP NODES */}
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="p-6 border border-border/30 bg-card rounded-2xl space-y-6 shadow-sm">
              <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 font-medium">Lifecycle Tracking</h4>
              <div className="space-y-4">
                {[
                  { status: 'pending', label: 'Proposal Mapped', completed: true },
                  { status: 'accepted', label: 'Handshake Verified', completed: ['accepted', 'completed'].includes(currentStatus) },
                  { status: 'completed', label: 'Matrix Resolution', completed: currentStatus === 'completed' }
                ].map((step, index) => (
                  <div key={step.status} className="flex items-center gap-3.5">
                    <div className={`w-5 h-5 rounded-md border text-[10px] font-mono font-medium flex items-center justify-center transition-all ${
                      step.completed 
                        ? 'bg-foreground text-background border-foreground font-bold' 
                        : 'border-border/60 text-muted-foreground/40 bg-transparent'
                    }`}>
                      {step.completed ? '✓' : index + 1}
                    </div>
                    <span className={`text-xs tracking-tight ${step.completed ? 'font-medium text-foreground' : 'font-light text-muted-foreground/50'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}