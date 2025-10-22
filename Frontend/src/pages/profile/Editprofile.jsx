import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    Phone,
    Camera,
    Plus,
    X,
    Save,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Calendar
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
            // Convert SkillsSelection format back to backend format
            const payload = {
                name: data.name,
                bio: data.bio,
                location: data.location,
                phone: data.phone,
                skillsToTeach: selectedSkills.teach, // Use SkillsSelection format
                skillsToLearn: selectedSkills.learn,  // Use SkillsSelection format
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
        onSuccess: (data) => {
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
            // You could add error state here
        }
    });

    // Add these functions after handleSubmit
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
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

            // Create preview
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6" animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/me')}
                        className="mb-4 gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Profile
                    </Button>

                    <div className="flex items-center gap-4">
                        {user?.profilePic?.url ? (
                            <img
                                src={user.profilePic.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`}
                                alt={user.name}
                                loading="lazy"
                                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Profile</h1>
                            <p className="text-gray-600 dark:text-gray-400">Update your personal information and skills</p>
                        </div>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update your personal details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter your full name"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={formData.bio}
                                            onChange={(e) => handleInputChange('bio', e.target.value)}
                                            placeholder="Tell others about yourself..."
                                            rows={4}
                                            className={errors.bio ? 'border-red-500' : ''}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {formData.bio.length}/500 characters
                                        </p>
                                        {errors.bio && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.bio}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location & Contact */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Location & Contact
                                    </CardTitle>
                                    <CardDescription>
                                        Update your location and contact information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={formData.location.city}
                                                onChange={(e) => handleLocationChange('city', e.target.value)}
                                                placeholder="Enter your city"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                value={formData.location.country}
                                                onChange={(e) => handleLocationChange('country', e.target.value)}
                                                placeholder="Enter your country"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Skills Management */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Skills Management
                                    </CardTitle>
                                    <CardDescription>
                                        Manage the skills you teach and want to learn
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SkillsSelection
                                        selectedSkills={selectedSkills}
                                        onSkillsChange={setSelectedSkills}
                                        mode="profile"
                                    />
                                </CardContent>
                            </Card>

                            {/* Availability Management */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Availability Schedule
                                    </CardTitle>
                                    <CardDescription>
                                        Set your availability for skill exchanges
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AvailabilityManager
                                        initialAvailability={user?.availability || []}
                                        onAvailabilityChange={handleAvailabilityChange}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Profile Picture */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Profile Picture
                                    </CardTitle>
                                    <CardDescription>
                                        Update your profile photo
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                loading="lazy"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                            />
                                        ) : user?.profilePic?.url ? (
                                            <img
                                                src={user.profilePic.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`}
                                                alt={user.name}
                                                loading="lazy"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}

                                        {/* Upload overlay */}
                                        {imagePreview && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="sm"
                                                    onClick={handleUpload}
                                                    disabled={uploadMutation.isPending}
                                                    className="bg-white text-black hover:bg-gray-100"
                                                >
                                                    {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
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

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={triggerFileInput}
                                        disabled={uploadMutation.isPending}
                                    >
                                        <Camera className="h-4 w-4 mr-2" />
                                        {imagePreview ? 'Change Photo' : 'Select Photo'}
                                    </Button>

                                    {imagePreview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2 text-red-600 hover:text-red-700"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setImagePreview(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}

                                    <p className="text-xs text-muted-foreground mt-2">
                                        JPG, PNG or GIF. Max size 2MB.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Save Actions */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <Button
                                            type="submit"
                                            className="w-full gap-2"
                                            disabled={updateProfileMutation.isPending}
                                        >
                                            <Save className="h-4 w-4" />
                                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => navigate('/me')}
                                        >
                                            Cancel
                                        </Button>
                                    </div>

                                    {errors.general && (
                                        <p className="text-sm text-red-500 mt-3 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.general}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}