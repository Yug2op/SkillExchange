import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { createRequest } from '@/api/ExchangeApi';
import { getUser } from '@/api/UserApi';
import { getMe } from '@/api/AuthApi';
import { toast } from 'sonner';
import { useMe } from '@/hooks/useMe';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';

// Icons
import {
    ArrowLeft,
    User,
    Star,
    BookOpen,
    GraduationCap,
    Target,
    CheckCircle2,
    AlertCircle,
    Send,
    MessageSquare,
    Sparkles,
    TrendingUp,
    Calendar,
    MapPin,
    Clock,
    Award,
    Users,
    Lightbulb,
    Heart,
    Zap
} from 'lucide-react';

export default function RequestExchange() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: meData } = useMe();

    const [loading, setLoading] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedTeachingSkill, setSelectedTeachingSkill] = useState('')
    const [message, setMessage] = useState('');

    const { data: userData, isLoading: userLoading, isError: userError } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUser(id),
        enabled: !!id,
    });

    const { data: currentUserData, isLoading: currentUserLoading } = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
    });

    const user = userData?.data?.user;
    const currentUser = currentUserData?.data?.user || meData;

    // Find matching skills (skills user can teach that current user wants to learn)
    const matchingSkills = (user?.skillsToTeach || []).filter(skillObj => {
        const userSkillName = typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName;
        return (currentUser?.skillsToLearn || []).some(learnObj => {
            const learnSkillName = typeof learnObj.skill === 'string' ? learnObj.skill : learnObj.skillName;
            return learnSkillName === userSkillName;
        });
    });

    // Find skills current user can offer (skills current user can teach that user wants to learn)
    const offeringSkills = (currentUser?.skillsToTeach || []).filter(skillObj => {
        const currentUserSkillName = typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName;
        return (user?.skillsToLearn || []).some(teachObj => {
            const teachSkillName = typeof teachObj.skill === 'string' ? teachObj.skill : teachObj.skillName;
            return teachSkillName === currentUserSkillName;
        });
    });

    useEffect(() => {
        // Auto-select the teaching skill if there's only one option
        if (offeringSkills.length === 1 && !selectedTeachingSkill) {
            const skillName = typeof offeringSkills[0].skill === 'string'
                ? offeringSkills[0].skill
                : offeringSkills[0].skillName || 'Unknown Skill';
            setSelectedTeachingSkill(skillName);
        }
    }, [offeringSkills, selectedTeachingSkill]);

    const handleSkillToggle = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const handleTeachingSkillSelect = (skill) => {
        setSelectedTeachingSkill(skill);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedSkills.length === 0) {
            toast.error('Please select at least one skill you want to learn');
            return;
        }

        // ✅ UPDATE: Check if offeringSkills is empty instead of selectedTeachingSkill
        if (offeringSkills.length === 0) {
            toast.error('No compatible skills found. Please update your profile or choose a different user.');
            return;
        }

        try {
            setLoading(true);
            const selectedSkill = selectedSkills[0];

            // ✅ UPDATE: Use the first (and only) offering skill if not manually selected
            const teachingSkillToUse = selectedTeachingSkill ||
                (offeringSkills.length === 1
                    ? (typeof offeringSkills[0].skill === 'string' ? offeringSkills[0].skill : offeringSkills[0].skillName)
                    : null);

            if (!teachingSkillToUse) {
                toast.error('Please select a skill you want to teach');
                return;
            }

            await createRequest({
                receiverId: id,
                skillOffered: teachingSkillToUse,
                skillRequested: selectedSkill,
                message: message || undefined
            });

            toast.success('Exchange request sent successfully!');
            queryClient.invalidateQueries(['exchanges']);
            navigate('/exchanges');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
            setLoading(false);
        }
    };

    if (userLoading || currentUserLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-5xl mx-auto space-y-10">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (userError || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="container mx-auto px-4 py-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-md mx-auto text-center"
                    >
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
                        <p className="text-muted-foreground mb-6">
                            The user you're trying to request an exchange with doesn't exist or has been removed.
                        </p>
                        <Button asChild>
                            <Link to="/search">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Search
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex items-center gap-4"
                    >
                        <Button variant="outline" size="sm" asChild>
                            <Link to={`/users/${id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Profile
                            </Link>
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <div>
                            <h1 className="text-2xl font-bold">Request Skill Exchange</h1>
                            <p className="text-muted-foreground">Start a learning partnership with {user.name}</p>
                        </div>
                    </motion.div>

                    <div className="grid gap-10 lg:grid-cols-2">
                        {/* User Profile Card */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-primary" />
                                        Learning Partner
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={user.profilePic?.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} alt={user.name} loading="lazy"/>
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                                                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-semibold text-lg">{user.name}</div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                {user.rating?.average?.toFixed(1) || '0.0'} ({user.rating?.count || 0} reviews)
                                            </div>
                                            {user.location && (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {user.location.city}, {user.location.country}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {user.bio && (
                                        <div>
                                            <h4 className="font-medium mb-2">About</h4>
                                            <p className="text-sm text-muted-foreground">{user.bio}</p>
                                        </div>
                                    )}

                                    {/* Skills Preview */}
                                    <div className="space-y-4">
                                        {user.skillsToTeach && user.skillsToTeach.length > 0 && (
                                            <div>
                                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-primary" />
                                                    Can Teach ({user.skillsToTeach.length})
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {user.skillsToTeach.slice(0, 3).map((skillObj, index) => (
                                                        <Badge key={`teach-${index}-${skillObj.skill}`} variant="secondary" className="text-xs">
                                                            {typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName || 'Unknown Skill'}
                                                        </Badge>
                                                    ))}
                                                    {user.skillsToTeach.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{user.skillsToTeach.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {user.skillsToLearn && user.skillsToLearn.length > 0 && (
                                            <div>
                                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-primary" />
                                                    Wants to Learn ({user.skillsToLearn.length})
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {user.skillsToLearn.slice(0, 3).map((skillObj, index) => (
                                                        <Badge key={`learn-${index}-${skillObj.skill}`} variant="outline" className="text-xs">
                                                            {typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName || 'Unknown Skill'}
                                                        </Badge>
                                                    ))}
                                                    {user.skillsToLearn.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{user.skillsToLearn.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Compatibility Indicator */}
                                    {matchingSkills.length > 0 && (
                                        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            <AlertTitle className="text-green-800 dark:text-green-200">
                                                Great Match!
                                            </AlertTitle>
                                            <AlertDescription className="text-green-700 dark:text-green-300">
                                                You have {matchingSkills.length} skill{matchingSkills.length > 1 ? 's' : ''} in common that you can exchange.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Exchange Request Form */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                        Create Exchange Request
                                    </CardTitle>
                                    <CardDescription>
                                        Select the skills you want to learn and we'll find matching skills you can offer in exchange.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Skills Selection */}
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4 text-primary" />
                                                    Select Skills You Want to Learn
                                                </h4>

                                                {matchingSkills.length > 0 ? (
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {matchingSkills.map((skillObj, index) => {
                                                            const skillName = typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName || 'Unknown Skill';
                                                            return (
                                                                <motion.button
                                                                    key={`matching-${index}-${skillName}`}
                                                                    type="button"
                                                                    onClick={() => handleSkillToggle(skillName)}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                    className={`p-3 rounded-lg border-2 text-left transition-all ${selectedSkills.includes(skillName)
                                                                        ? 'border-primary bg-primary/10 text-primary'
                                                                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                                                        }`}
                                                                >
                                                                    <div className="font-medium text-sm">{skillName}</div>
                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                        Available for exchange
                                                                    </div>
                                                                </motion.button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                        <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                                                            No Matching Skills
                                                        </AlertTitle>
                                                        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                                                            {user.name} doesn't teach any skills that you've listed in your "Wants to learn" section.
                                                            Update your profile to find better matches.
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>

                                            {/* Exchange Preview */}
                                            {selectedSkills.length > 0 && offeringSkills.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-muted/50 rounded-lg p-4 space-y-4"
                                                >
                                                    <h4 className="font-medium flex items-center gap-2">
                                                        <Sparkles className="h-4 w-4 text-primary" />
                                                        Exchange Preview
                                                    </h4>

                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div className="bg-white dark:bg-gray-800 rounded-md p-3">
                                                            <div className="text-xs text-muted-foreground mb-1">You'll Learn</div>
                                                            <div className="font-medium">{selectedSkills[0]}</div>
                                                        </div>

                                                        <div className="bg-white dark:bg-gray-800 rounded-md p-3">
                                                            <div className="text-xs text-muted-foreground mb-2">You'll Teach</div>
                                                            {offeringSkills.length === 1 ? (
                                                                <div className="font-medium">
                                                                    {typeof offeringSkills[0].skill === 'string' ? offeringSkills[0].skill : offeringSkills[0].skillName || 'Unknown Skill'}
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    <div className="space-y-3">
                                                                        <div className="text-sm font-medium text-muted-foreground">
                                                                            Choose which skill you want to teach:
                                                                        </div>
                                                                        <div className="grid gap-2">
                                                                            {offeringSkills.map((skillObj, index) => {
                                                                                const skillName = typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName || 'Unknown Skill';
                                                                                return (
                                                                                    <motion.button
                                                                                        key={`offering-${index}-${skillName}`}
                                                                                        type="button"
                                                                                        onClick={() => handleTeachingSkillSelect(skillName)}
                                                                                        whileHover={{ scale: 1.02 }}
                                                                                        whileTap={{ scale: 0.98 }}
                                                                                        className={`group relative p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                                                                                            selectedTeachingSkill === skillName
                                                                                                ? 'border-primary bg-primary/10 shadow-md'
                                                                                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                                                                        }`}
                                                                                    >
                                                                                        <div className="flex items-center justify-between">
                                                                                            <div className="flex items-center gap-3">
                                                                                                <div className={`w-9 h-8 rounded-full flex items-center justify-center transition-colors ${
                                                                                                    selectedTeachingSkill === skillName
                                                                                                        ? 'bg-primary text-primary-foreground'
                                                                                                        : 'bg-muted text-muted-foreground group-hover:bg-primary/20'
                                                                                                }`}>
                                                                                                    <BookOpen className="h-4 w-4" />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <div className="font-medium text-sm">{skillName}</div>
                                                                                                    <div className="text-xs text-muted-foreground">
                                                                                                        Skill you can teach
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </motion.button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-xs text-muted-foreground">
                                                        This creates a balanced skill exchange where both parties benefit equally.
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Personal Message (Optional)
                                            </label>
                                            <Textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Add a personal message to introduce yourself and explain why you're interested in this exchange..."
                                                className="min-h-24"
                                            />
                                            <div className="text-xs text-muted-foreground">
                                                A thoughtful message can help build rapport and increase acceptance chances.
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className="flex flex-col sm:flex-row gap-3 pt-4 border-t"
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => navigate(`/users/${id}`)}
                                                className="flex-1"
                                            >
                                                View Full Profile
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    loading ||
                                                    selectedSkills.length === 0 ||
                                                    offeringSkills.length === 0 ||
                                                    (offeringSkills.length > 1 && !selectedTeachingSkill)
                                                }
                                                className="flex-1 gap-2"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4" />
                                                        Send Exchange Request
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Matching Skills Analysis */}
                    {offeringSkills.length > 0 && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Skills You Can Offer
                                    </CardTitle>
                                    <CardDescription>
                                        These are the skills you can teach that {user.name} wants to learn
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {offeringSkills.map((skillObj, index) => {
                                            const skillName = typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName || 'Unknown Skill';
                                            return (
                                                <div key={`offer-${index}-${skillName}`} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                        ✓
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">{skillName}</div>
                                                        <div className="text-xs text-muted-foreground">Available to teach</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Tips Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <Lightbulb className="h-5 w-5" />
                                    Tips for Better Exchanges
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">✨ Be Specific</h4>
                                        <p className="text-xs text-muted-foreground">
                                            Mention your experience level and specific goals in your message.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">🎯 Choose Wisely</h4>
                                        <p className="text-xs text-muted-foreground">
                                            Select skills you're genuinely interested in learning.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">💬 Communicate</h4>
                                        <p className="text-xs text-muted-foreground">
                                            A friendly message increases your chances of acceptance.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">⏰ Be Patient</h4>
                                        <p className="text-xs text-muted-foreground">
                                            Quality exchanges take time to find the right match.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}