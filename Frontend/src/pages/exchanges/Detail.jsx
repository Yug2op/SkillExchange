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
import { getUserReviews, checkReviewExists } from '@/api/ReviewApi';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
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
  Phone,
  Globe,
  ChevronRight,
  Calendar as CalendarIcon,
  Timer,
  Link as LinkIcon,
  Building,
  Coffee,
  BookOpen,
  GraduationCap,
  Edit
} from 'lucide-react';

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: Clock,
    label: 'Pending Approval'
  },
  accepted: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle2,
    label: 'Accepted'
  },
  rejected: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: XCircle,
    label: 'Rejected'
  },
  completed: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Award,
    label: 'Completed'
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    icon: AlertCircle,
    label: 'Cancelled'
  }
};

const statusActions = {
  sender: {
    pending: [
      { action: 'Cancel', variant: 'destructive', icon: XCircle }
    ],
    accepted: [
      { action: 'Mark as Completed', variant: 'default', icon: CheckCircle2 }
    ],
    completed: [],
    rejected: [],
    cancelled: []
  },
  receiver: {
    pending: [
      { action: 'Accept', variant: 'default', icon: CheckCircle2 },
      { action: 'Reject', variant: 'destructive', icon: XCircle }
    ],
    accepted: [
      { action: 'Mark as Completed', variant: 'default', icon: CheckCircle2 }
    ],
    completed: [],
    rejected: [],
    cancelled: []
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

  // Check if review exists for this exchange
  const { data: reviewCheck } = useQuery({
    queryKey: ['review-check', id, currentUserId],
    queryFn: () => checkReviewExists(id),
    enabled: !!currentUserId && currentStatus === 'completed',
  });

  const handleAction = async (action) => {
    try {
      let response;
      switch (action) {
        case 'Accept':
          response = await acceptExchange(id);
          break;
        case 'Reject':
          response = await rejectExchange(id, { reason: 'Exchange rejected' });
          break;
        case 'Mark as Completed':
          response = await completeExchange(id);
          break;
        case 'Cancel':
          response = await cancelExchange(id);
          break;
        default:
          return;
      }
      
      // ✅ ADD: Wait a moment for state synchronization
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
        ...(scheduleData.type === 'online'
          ? { meetingLink: scheduleData.meetingLink }
          : { location: scheduleData.location })
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
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
              The exchange you're looking for doesn't exist or has been removed.
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

  if (!exchange) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Exchange Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The exchange you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/exchanges">Back to Exchanges</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[currentStatus] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;
  const availableActions = isSender
    ? statusActions.sender[currentStatus] || []
    : statusActions.receiver[currentStatus] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/exchanges">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Exchanges
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-bold">
                  Skill Exchange {isSender ? 'with' : 'from'} {otherUser?.name}
                </h1>
                <p className="text-muted-foreground">
                  Created on {format(new Date(exchange.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            <Badge className={`${statusInfo.color} gap-2`}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Exchange Overview */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Exchange Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <GraduationCap className="h-4 w-4" />
                          You will learn
                        </div>
                        <div className="text-lg font-semibold text-primary">
                          {exchange.skillRequested}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          In exchange for
                        </div>
                        <div className="text-lg font-semibold text-primary">
                          {exchange.skillOffered}
                        </div>
                      </div>
                    </div>

                    {exchange.message && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm italic">"{exchange.message}"</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Scheduled Sessions */}
              {exchange.scheduledSessions && exchange.scheduledSessions.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Scheduled Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {exchange.scheduledSessions.map((session, index) => (
                          <motion.div
                            key={index}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${session.type === 'online'
                                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                {session.type === 'online' ? <Video className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {format(new Date(session.date), 'EEEE, MMMM d, yyyy')}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {session.startTime} - {session.endTime}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <Badge variant={session.completed ? 'default' : 'secondary'}>
                                {session.completed ? 'Completed' : 'Upcoming'}
                              </Badge>
                              {session.type === 'online' && session.meetingLink && (
                                <div className="mt-2">
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                                      <LinkIcon className="h-3 w-3 mr-1" />
                                      Join Meeting
                                    </a>
                                  </Button>
                                </div>
                              )}
                              {session.type === 'offline' && session.location && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  📍 {session.location}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Action Buttons */}
              {availableActions.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-3"
                >
                  {availableActions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <Button
                        key={action.action}
                        variant={action.variant}
                        onClick={() => handleAction(action.action)}
                        className="gap-2"
                      >
                        <ActionIcon className="h-4 w-4" />
                        {action.action}
                      </Button>
                    );
                  })}
                  {currentStatus === 'accepted' && (
                    <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Calendar className="h-4 w-4" />
                          {exchange.scheduledSessions?.length > 0 ? 'Reschedule' : 'Schedule Session'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {exchange.scheduledSessions?.length > 0 ? 'Reschedule Session' : 'Schedule a Session'}
                          </DialogTitle>
                          <DialogDescription>
                            Set up a time to connect and exchange skills with {otherUser?.name}.
                          </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleScheduleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="date">Date</Label>
                              <Input
                                id="date"
                                type="date"
                                value={scheduleData.date}
                                onChange={(e) => handleScheduleChange('date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="startTime">Start Time</Label>
                              <Input
                                id="startTime"
                                type="time"
                                value={scheduleData.startTime}
                                onChange={(e) => handleScheduleChange('startTime', e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                              id="endTime"
                              type="time"
                              value={scheduleData.endTime}
                              onChange={(e) => handleScheduleChange('endTime', e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>Session Type</Label>
                            <RadioGroup
                              value={scheduleData.type}
                              onValueChange={(value) => handleScheduleChange('type', value)}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="online" id="online" />
                                <Label htmlFor="online" className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  Online Meeting
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="offline" id="offline" />
                                <Label htmlFor="offline" className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  In-Person Meeting
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {scheduleData.type === 'online' ? (
                            <div className="space-y-2">
                              <Label htmlFor="meetingLink">Meeting Link</Label>
                              <Input
                                id="meetingLink"
                                type="url"
                                placeholder="https://meet.example.com/abc"
                                value={scheduleData.meetingLink}
                                onChange={(e) => handleScheduleChange('meetingLink', e.target.value)}
                                required
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                placeholder="Coffee shop, library, etc."
                                value={scheduleData.location}
                                onChange={(e) => handleScheduleChange('location', e.target.value)}
                                required
                              />
                            </div>
                          )}

                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsScheduling(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">
                              {exchange.scheduledSessions?.length > 0 ? 'Reschedule' : 'Schedule'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </motion.div>
              )}
              
              {currentStatus === 'completed' && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg"
                    >
                      <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Exchange Completed!</h3>
                      <p className="text-muted-foreground mb-4">
                        Great job! Don't forget to leave a review for {otherUser?.name}.
                      </p>
                      {reviewCheck?.data?.hasReview ? (
                        <Button asChild className="gap-2">
                          <Link to={`/reviews/${reviewCheck.data.reviewId}`}>
                            <Edit className="h-4 w-4" />
                            Edit Review
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild className="gap-2">
                          <Link to={`/reviews/create/${exchange._id}`}>
                            <Star className="h-4 w-4" />
                            Write Review
                          </Link>
                        </Button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Information */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {isSender ? 'Learning Partner' : 'Exchange Sender'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherUser?.profilePic?.url || `https://ui-avatars.com/api/?name=${OtherUser?.name || 'U'}&background=random`} alt={otherUser?.name} loading="lazy"/>
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {otherUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{otherUser?.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {otherUser?.rating?.average?.toFixed(1) || '0.0'} ({otherUser?.rating?.count || 0} reviews)
                        </div>
                      </div>
                    </div>

                    {otherUser?.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${otherUser.email}`}
                          className="text-primary hover:underline truncate"
                        >
                          {otherUser.email}
                        </a>
                      </div>
                    )}

                    {otherUser?.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{otherUser.location.city}, {otherUser.location.country}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                        <Link to={`/users/${otherUser?._id}`}>
                          <User className="h-4 w-4" />
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
                      <Link to={`/chat/${otherUser?._id}`}>
                        <MessageSquare className="h-4 w-4" />
                        Send Message
                      </Link>
                    </Button>

                    {currentStatus === 'accepted' && (
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        <Calendar className="h-4 w-4" />
                        View Calendar
                      </Button>
                    )}

                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
                      <Link to="/exchanges">
                        <ArrowLeft className="h-4 w-4" />
                        All Exchanges
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Exchange Progress */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Exchange Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { status: 'pending', label: 'Request Sent', completed: true },
                        { status: 'accepted', label: 'Request Accepted', completed: ['accepted', 'completed'].includes(currentStatus) },
                        { status: 'completed', label: 'Session Completed', completed: currentStatus === 'completed' }
                      ].map((step, index) => (
                        <div key={step.status} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step.completed
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {step.completed ? '✓' : index + 1}
                          </div>
                          <span className={`text-sm ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}