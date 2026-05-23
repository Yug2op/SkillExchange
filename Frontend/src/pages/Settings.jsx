import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useMe } from '@/hooks/useMe';
import { api } from '@/api/client';
import ChangePassword from '@/pages/auth/ChangePassword';
import AvailabilityManager from '@/components/AvailabilityManager';
import { updateUser } from '@/api/UserApi';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Icons
import {
  User,
  Mail,
  Shield,
  Bell,
  Moon,
  Sun,
  Trash2,
  Edit3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings as SettingsIcon,
  Monitor,
  Lock,
  Key
} from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useMe();
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('light');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [availability, setAvailability] = useState([]);

  // Email verification mutation
  const verifyEmailMutation = useMutation({
    mutationFn: () => api.post('/api/auth/resend-verification', { email: user?.email }),
    onSuccess: () => toast.success('Verification email sent! Check your inbox.'),
    onError: (err) => toast.error(err?.message || 'Failed to send verification email')
  });

  // Account deletion mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => api.delete(`/api/users/${user?._id}`),
    onSuccess: () => {
      toast.success('Account deletion request submitted. You will be logged out shortly.');
      setTimeout(() => navigate('/login'), 2000);
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete account')
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: (availabilityData) => updateUser(user?._id, { availability: availabilityData }),
    onSuccess: () => {
      toast.success('Availability updated successfully!');
      queryClient.invalidateQueries(['me']);
    },
    onError: (err) => toast.error(err?.message || 'Failed to update availability')
  });

  const handleAvailabilityChange = (newAvailability) => {
    setAvailability(newAvailability);
  };

  const handleSaveAvailability = () => {
    updateAvailabilityMutation.mutate(availability);
  };

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toast.success(`Theme changed to ${newTheme === 'dark' ? 'dark' : 'light'} mode`);
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
    setShowDeleteConfirm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <BrandLoader/>
          </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        
        {/* INTERFACE HEADLINE LAYER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <Button variant="ghost" size="sm" onClick={() => navigate('/me')} className="text-xs uppercase tracking-widest font-medium h-9 px-3 -ml-3 hover:bg-muted/60">
            ← Back to Profile
          </Button>
          <div className="pt-2">
            <h1 className="text-4xl font-light tracking-tighter leading-none">Settings.</h1>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 mt-3">Manage your account preferences and privacy</p>
          </div>
        </motion.div>

        {/* CONTROLS PLAIN NAVIGATION TABS SYSTEM */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* 1. PROFILE INFORMATION LAYERS */}
          <TabsContent value="profile" className="space-y-12 outline-none">
            <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 sm:items-center justify-between pb-6 border-b border-border/20">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 rounded-full ring-1 ring-border/40">
                    <AvatarImage src={user?.profilePic?.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} alt={user?.name} />
                    <AvatarFallback className="text-sm font-medium bg-muted">{user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-base font-medium tracking-tight text-foreground">{user?.name}</h3>
                    <p className="text-xs text-muted-foreground font-light">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {user?.isEmailVerified ? (
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-widest border-primary/20 text-primary bg-primary/5 gap-1 py-1 px-2.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-widest border-destructive/20 text-destructive bg-destructive/5 gap-1 py-1 px-2.5">
                      <AlertCircle className="h-2.5 w-2.5" /> Unverified
                    </Badge>
                  )}
                  <Button variant="ghost" onClick={() => navigate('/profile/edit')} className="text-xs uppercase tracking-widest font-medium h-10 px-4 border border-border/40 hover:bg-muted/60 rounded-lg gap-2">
                    <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium tracking-tight">Email Verification</h4>
                  <p className="text-xs text-muted-foreground font-light">Verify your email address for account security parameters.</p>
                </div>
                {!user?.isEmailVerified && (
                  <Button
                    onClick={() => verifyEmailMutation.mutate()}
                    disabled={verifyEmailMutation.isPending}
                    className="text-xs uppercase tracking-widest font-medium h-10 px-5 rounded-lg bg-foreground text-background hover:opacity-90"
                  >
                    {verifyEmailMutation.isPending ? 'Sending...' : 'Resend Verification'}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 2. SECURITY INTERFACE PARAMETERS */}
          <TabsContent value="security" className="space-y-12 outline-none">
            <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/20">
                <div className="space-y-1">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-primary font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" /> Password Control
                  </h3>
                  <p className="text-xs text-muted-foreground font-light">Update your account password regularly for enhanced security boundaries.</p>
                </div>

                <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="text-xs uppercase tracking-widest font-medium h-11 px-4 border border-border/40 hover:bg-muted/60 rounded-lg gap-2">
                      <Key className="h-3.5 w-3.5" /> Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-card text-foreground border-border/40 rounded-xl">
                    <DialogHeader className="text-left">
                      <DialogTitle className="text-lg font-medium tracking-tight">Change Password</DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground font-light">
                        Enter your current password and choose a new secure password structure.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="pt-2">
                      <ChangePassword />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="text-center py-6 border border-dashed border-border/40 rounded-xl max-w-md mx-auto space-y-3">
                <Shield className="h-5 w-5 mx-auto text-muted-foreground/40 stroke-[1.25]" />
                <div className="space-y-0.5">
                  <p className="text-xs font-medium">Two-Factor Authentication</p>
                  <p className="text-[11px] text-muted-foreground/60 font-light">Extra verification layer coming soon to the platform environment.</p>
                </div>
                <Button variant="ghost" className="text-[10px] uppercase font-mono tracking-wider h-8 opacity-40" disabled>
                  Enable 2FA
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* 3. PRIVACY VISIBILITY MATRICES */}
          <TabsContent value="privacy" className="space-y-12 outline-none">
            <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium tracking-tight text-foreground">Profile Visibility</Label>
                  <p className="text-xs text-muted-foreground font-light">Make your profile visible to other users inside global search indices.</p>
                </div>
                <Switch defaultChecked={user?.isActive} className="data-[state=checked]:bg-primary" />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-border/20 pt-6">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium tracking-tight text-foreground">Show Online Status</Label>
                  <p className="text-xs text-muted-foreground font-light">Let others see when you are online in chat quadrants.</p>
                </div>
                <Switch defaultChecked={user?.isOnline} className="data-[state=checked]:bg-primary" />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-border/20 pt-6">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium tracking-tight text-foreground">Show Last Seen</Label>
                  <p className="text-xs text-muted-foreground font-light">Display timestamps when you were last active inside network logs.</p>
                </div>
                <Switch defaultChecked={true} className="data-[state=checked]:bg-primary" />
              </div>

              <div className="pt-6 border-t border-border/20 flex justify-start">
                <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="text-xs uppercase tracking-widest font-medium h-10 px-4 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg gap-2 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" /> Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card text-foreground border-border/40 rounded-xl max-w-md">
                    <AlertDialogHeader className="text-left">
                      <AlertDialogTitle className="text-lg font-medium tracking-tight">Delete Account</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs text-muted-foreground font-light leading-relaxed">
                        This action cannot be undone. This will permanently delete your account and remove all your data records from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-2">
                      <AlertDialogCancel className="text-xs uppercase tracking-wider font-medium rounded-lg h-10">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="text-xs uppercase tracking-wider font-medium bg-destructive text-destructive-foreground hover:opacity-90 rounded-lg h-10"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>

          {/* 4. NOTIFICATION SYSTEM TOGGLES */}
          <TabsContent value="notifications" className="space-y-12 outline-none">
            <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium tracking-tight text-foreground">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground font-light">Receive notifications via transactional email routing channels.</p>
                </div>
                <Switch defaultChecked={true} className="data-[state=checked]:bg-primary" />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-border/20 pt-6">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium tracking-tight text-foreground">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground font-light">Browser push alerts displayed natively on device viewports.</p>
                </div>
                <Switch defaultChecked={true} className="data-[state=checked]:bg-primary" />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-border/20 pt-6">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium tracking-tight text-foreground">New Messages</Label>
                  <p className="text-xs text-muted-foreground font-light">Notify instantly when you receive a message from handshake loops.</p>
                </div>
                <Switch defaultChecked={true} className="data-[state=checked]:bg-primary" />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-border/20 pt-6">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium tracking-tight text-foreground">Exchange Requests</Label>
                  <p className="text-xs text-muted-foreground font-light">Notify when someone initiates a new exchange query for your skills.</p>
                </div>
                <Switch defaultChecked={true} className="data-[state=checked]:bg-primary" />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-border/20 pt-6">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium tracking-tight text-foreground">Weekly Digest</Label>
                  <p className="text-xs text-muted-foreground font-light">Weekly comprehensive analytical summary of your activity indexes.</p>
                </div>
                <Switch defaultChecked={false} className="data-[state=checked]:bg-primary" />
              </div>
            </div>
          </TabsContent>

          {/* 5. PREFERENCES APPEARANCE & SCHEDULING MANAGEMENT */}
          <TabsContent value="preferences" className="space-y-10 outline-none">
            {/* Visual Look Preference */}
            <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-medium tracking-tight">Appearance</h3>
                <p className="text-xs text-muted-foreground font-light">Customize how the platform UI rendering renders layout sets.</p>
              </div>
              <div className="space-y-3 pt-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">Theme Selection</Label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('light')}
                    className="text-xs font-medium uppercase tracking-wider h-10 rounded-lg gap-2"
                  >
                    <Sun className="h-3.5 w-3.5" /> Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('dark')}
                    className="text-xs font-medium uppercase tracking-wider h-10 rounded-lg gap-2"
                  >
                    <Moon className="h-3.5 w-3.5" /> Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('system')}
                    className="text-xs font-medium uppercase tracking-wider h-10 rounded-lg gap-2"
                  >
                    <Monitor className="h-3.5 w-3.5" /> System
                  </Button>
                </div>
              </div>
            </div>

            {/* Custom Availability Schedule Manager Core Block */}
            <div className="space-y-4">
              <AvailabilityManager
                initialAvailability={user?.availability || []}
                onAvailabilityChange={handleAvailabilityChange}
              />

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSaveAvailability}
                  disabled={updateAvailabilityMutation.isPending}
                  className="text-xs uppercase tracking-widest font-medium px-6 py-5 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  {updateAvailabilityMutation.isPending ? 'Saving Matrix...' : 'Save Availability'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}