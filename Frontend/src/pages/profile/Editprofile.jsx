import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { uploadProfilePic } from '@/api/UserApi';
import SkillsSelection from '@/components/SkillSelection';
import { toast } from 'sonner';
import { useMe } from '@/hooks/useMe';
import AvailabilityManager from '@/components/AvailabilityManager';
import { updateUser } from '@/api/UserApi';
import {
  User,
  MapPin,
  Camera,
  Save,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useMe();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedSkills, setSelectedSkills] = useState({
    teach: [],
    learn: []
  });

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: {
      city: '',
      country: ''
    },
    phone: '',
    skillsToTeach: [],
    skillsToLearn: []
  });

  const [errors, setErrors] = useState({});
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: {
          city: user.location?.city || '',
          country: user.location?.country || ''
        },
        phone: user.phone || '',
        skillsToTeach: user.skillsToTeach || [],
        skillsToLearn: user.skillsToLearn || []
      });

      setSelectedSkills({
        teach: (user.skillsToTeach || []).map(skill => ({
          skill: skill.skill,
          level: skill.level
        })),
        learn: (user.skillsToLearn || []).map(skill => ({
          skill: skill.skill,
          level: skill.level
        }))
      });

      setAvailability(user.availability || []);
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        name: data.name,
        bio: data.bio,
        location: data.location,
        phone: data.phone,
        skillsToTeach: selectedSkills.teach,
        skillsToLearn: selectedSkills.learn,
        availability: availability
      };
      return updateUser(user._id, payload);
    },
    onSuccess: () => {
      toast.success('Profile Updated Successfully!!', {
        description: `Profile has been Updated with new data.`,
        duration: 3000,
      });
      queryClient.invalidateQueries(['me']);
      navigate('/me');
    },
    onError: (error) => {
      toast.error('Error while updating Profile!', {
        description: `${error.message || 'Failed to update profile'}`,
        duration: 4000,
      });
      setErrors(error?.message || { general: 'Failed to update profile' });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }) => uploadProfilePic(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries(['me']);
      toast.success('Profile Image Updated Successfully!!', {
        description: `New Profile Image Updated.`,
        duration: 3000,
      });
      setSelectedFile(null);
      setImagePreview(null);
    },
    onError: (error) => {
      toast.error('Error while uploading Profile Image!', {
        description: `${error.message || 'Failed to Upload profile image.'}`,
        duration: 4000,
      });
      console.error('Upload failed:', error);
    }
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'File size must be less than 2MB',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type', {
          description: 'Please select an image file',
        });
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile && user) {
      uploadMutation.mutate({ id: user._id, file: selectedFile });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleAvailabilityChange = (newAvailability) => {
    setAvailability(newAvailability);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      updateProfileMutation.mutate(formData);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.bio && formData.bio.length > 500) newErrors.bio = 'Bio must be less than 500 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <BrandLoader/>
          </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/40 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        
        {/* INTERFACE CONTROL HEADER BAR */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <Button variant="ghost" size="sm" onClick={() => navigate('/me')} className="text-xs uppercase tracking-widest font-medium h-9 px-3 -ml-3 hover:bg-muted/60">
            <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Back to Profile
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
            <div className="relative shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover ring-1 ring-border/40" />
              ) : user?.profilePic?.url ? (
                <img src={user.profilePic.url} alt={user.name} loading="lazy" className="w-16 h-16 rounded-full object-cover ring-1 ring-border/40" />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-foreground text-xl font-light font-mono">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-light tracking-tighter leading-none">Edit Profile.</h1>
              <p className="text-sm text-muted-foreground font-light mt-3">Update your personal data vectors and capability metrics.</p>
            </div>
          </div>
        </motion.div>

        {/* MAIN FORM FLOW GRID MAPPING */}
        <form onSubmit={handleSubmit} >
          <div className="grid gap-12 lg:grid-cols-3">
          {/* LEFT CONTAINER: PRIMARY FIELDS STACK */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* BASIC DIRECTORY DATA */}
            <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-6">
              <div className="space-y-1 pb-4 border-b border-border/40">
                <h3 className="text-sm font-mono uppercase tracking-widest text-primary font-medium flex items-center gap-2">
                  <User className="h-4 w-4 stroke-[1.5]" /> Basic Identity
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">Full Name *</Label>
                  <div className={`relative transition-colors duration-200 py-1 ${errors.name ? 'border-destructive' : 'border-border/60 focus-within:border-foreground'}`}>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="border-0 bg-transparent px-0 h-9 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-destructive flex items-center gap-1 font-mono pt-1">
                      <AlertCircle className="h-3 w-3" /> {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">Descriptive Overview</Label>
                  <div className={`border rounded-xl p-3 bg-background/50 transition-colors ${errors.bio ? 'border-destructive' : 'border-border/40 focus-within:border-foreground/40'}`}>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell others about yourself..."
                      rows={4}
                      maxLength={500}
                      className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light text-sm shadow-none"
                    />
                    <div className="text-right text-[10px] font-mono text-muted-foreground/40 pt-2">
                      {formData.bio.length} / 500 characters
                    </div>
                  </div>
                  {errors.bio && (
                    <p className="text-xs text-destructive flex items-center gap-1 font-mono pt-1">
                      <AlertCircle className="h-3 w-3" /> {errors.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* LOCATION & GEOGRAPHIC COORDINATES */}
            <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-6">
              <div className="space-y-1 pb-4 border-b border-border/40">
                <h3 className="text-sm font-mono uppercase tracking-widest text-primary font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 stroke-[1.5]" /> Regional Placement
                </h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">City</Label>
                    <div className="relative focus-within:border-foreground transition-colors duration-200 py-1">
                      <Input
                        id="city"
                        value={formData.location.city}
                        onChange={(e) => handleLocationChange('city', e.target.value)}
                        placeholder="Enter your city"
                        className="border-0 bg-transparent px-0 h-9 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">Country</Label>
                    <div className="relative focus-within:border-foreground transition-colors duration-200 py-1">
                      <Input
                        id="country"
                        value={formData.location.country}
                        onChange={(e) => handleLocationChange('country', e.target.value)}
                        placeholder="Enter your country"
                        className="border-0 bg-transparent px-0 h-9 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">Communication Line</Label>
                  <div className="relative focus-within:border-foreground transition-colors duration-200 py-1">
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className="border-0 bg-transparent px-0 h-9 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER: SIDE ACTIONS PANEL BAR */}
          <div className="space-y-6">
            
            {/* AVATAR FILE MEDIA UPLOADS PANEL */}
            <div className="border border-border/30 bg-card rounded-2xl p-6 space-y-6 text-center">
              <div className="space-y-1 text-left pb-4 border-b border-border/40">
                <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/80 font-medium flex items-center gap-2">
                  <Camera className="h-3.5 w-3.5" /> Media Layer
                </h4>
              </div>

              <div className="relative w-20 h-20 mx-auto group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border border-border/40" />
                ) : user?.profilePic?.url ? (
                  <img src={user.profilePic.url} alt={user.name} className="w-20 h-20 rounded-full object-cover border border-border/40" />
                ) : (
                  <div className="w-20 h-20 bg-muted border border-border/40 rounded-full flex items-center justify-center text-foreground font-mono text-xl font-light">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}

                {imagePreview && (
                  <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      size="sm"
                      type="button"
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="text-[10px] font-mono uppercase tracking-wider h-7 px-2.5 bg-foreground text-background"
                    >
                      {uploadMutation.isPending ? 'Sync...' : 'Upload'}
                    </Button>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={triggerFileInput}
                  disabled={uploadMutation.isPending}
                  className="w-full text-xs uppercase tracking-widest font-medium h-10 border border-border/40 hover:bg-muted/60 rounded-lg gap-2"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {imagePreview ? 'Change Frame' : 'Select Frame'}
                </Button>

                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[11px] font-mono text-destructive hover:bg-destructive/10 h-8 rounded-md w-full"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                    }}
                  >
                    Reset Frame Selection
                  </Button>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground/50 font-mono tracking-wide leading-relaxed">
                JPG, PNG OR GIF parameters.<br />Max volume threshold 2MB.
              </p>
            </div>

            {/* SYSTEM CONFIGURATION CONTROL ACTIONS PANELS */}
            <div className="border border-border/30 bg-card rounded-2xl p-6 space-y-4 shadow-sm">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full text-xs uppercase tracking-widest font-medium py-6 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity gap-2"
              >
                <Save className="h-3.5 w-3.5" />
                {updateProfileMutation.isPending ? 'Syncing Parameters...' : 'Save Configuration'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-xs uppercase tracking-widest font-medium py-6 border border-border/40 hover:bg-muted/60 rounded-xl transition-all"
                onClick={() => navigate('/me')}
              >
                Discard Changes
              </Button>

              {errors.general && (
                <p className="text-xs text-destructive flex items-center justify-center gap-1 font-mono pt-2 border-t border-border/40">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.general}
                </p>
              )}
            </div>

          </div>
          </div>
          
          {/* INTEGRATED REUSABLE SUBCOMPONENTS LIST PRESETS */}
            <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-4 mt-12">
              <SkillsSelection
                selectedSkills={selectedSkills}
                onSkillsChange={setSelectedSkills}
                mode="profile"
              />
            </div>

            <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-4 mt-12">
              <AvailabilityManager
                initialAvailability={user?.availability || []}
                onAvailabilityChange={handleAvailabilityChange}
              />
            </div>
            
        </form>
        
      </div>
    </div>
  );
}
