import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    getAllSkills,
    createSkill,
    updateSkill,
    deleteSkill,
    approveSkillSuggestion,
    rejectSkillSuggestion,
    getSkillStats
} from '@/api/AdminApi';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    Tag,
    TrendingUp,
    Users,
    BookOpen,
    Target,
    AlertCircle,
    CheckCircle,
    Lightbulb,
    BarChart3
} from 'lucide-react';

export default function SkillsManagement() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newSkill, setNewSkill] = useState({ name: '', category: '', description: '', tags: [] });
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [reviewAction, setReviewAction] = useState(null); // 'approve' | 'reject'
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editSkillDraft, setEditSkillDraft] = useState({ name: '', category: '', description: '' });
    const [skillBeingEdited, setSkillBeingEdited] = useState(null);
    const categoryMapping = {
        'technical': 'Technology',
        'creative': 'Arts & Crafts',
        'language': 'Languages',
        'business': 'Business',
        'sports': 'Sports & Fitness',
        'cooking': 'Cooking',
        'music': 'Music',
        'personal': 'Personal Development',
        'other': 'Other'
    };

    const queryClient = useQueryClient();

    const { data: skillsData, isLoading } = useQuery({
        queryKey: ['admin-skills'],
        queryFn: getAllSkills,
        onError: (err) => toast.error('Failed to fetch skills', { description: err?.message || 'Try again later.' })
    });

    const { data: skillStats, isLoading: skillStatsLoading } = useQuery({
        queryKey: ['admin-skill-stats'],
        queryFn: getSkillStats,
        onError: (err) => toast.error('Failed to load skill stats', { description: err?.message || 'Try again later.' })
    });

    // Create skill mutation
    const createSkillMutation = useMutation({
        mutationFn: createSkill,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-skills']);
            setIsCreateDialogOpen(false);
            setNewSkill({ name: '', category: '', description: '' });
            toast.success('Skill created');
        },
        onError: (error) => {
            toast.error('Failed to create skill', { description: error?.message || 'Try again later.' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateSkill(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-skills']);
            toast.success('Skill updated');
        },
        onError: (error) => {
            toast.error('Failed to update skill', { description: error?.message || 'Try again later.' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSkill,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-skills']);
            toast.success('Skill deleted');
        },
        onError: (error) => {
            toast.error('Failed to delete skill', { description: error?.message || 'Try again later.' });
        }
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, adminNotes }) => approveSkillSuggestion(id, adminNotes),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-skills']);
            toast.success('Suggestion approved');
        },
        onError: (error) => {
            toast.error('Failed to approve suggestion', { description: error?.message || 'Try again later.' });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, adminNotes }) => rejectSkillSuggestion(id, adminNotes),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-skills']);
            toast.success('Suggestion rejected');
        },
        onError: (error) => {
            toast.error('Failed to reject suggestion', { description: error?.message || 'Try again later.' });
        }
    });

    const skills = skillsData?.data?.skills || [];
    const suggestions = skillsData?.data?.suggestions || [];
    const categories = [...new Set(skills.map(skill => skill.category).filter(Boolean))];

    const filteredSkills = skills.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase()) ||
            skill.description?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'all' || skill.category === category;
        return matchesSearch && matchesCategory;
    });

    const handleCreateSkill = () => {
        if (newSkill.name && newSkill.category) {
            const skillData = {
                name: newSkill.name,
                category: categoryMapping[newSkill.category] || newSkill.category,
                description: newSkill.description,
                tags: newSkill.tags || [] // Include tags
            };
            createSkillMutation.mutate(skillData);
        } else {
            toast.error('Missing required fields', { description: 'Name and category are required.' });
        }
    };

    const getCategoryBadge = (category) => {
        const variants = {
            'technical': 'Technology',
            'creative': 'Arts & Crafts',
            'language': 'Languages',
            'business': 'Business',
            'sports': 'Sports & Fitness',
            'cooking': 'Cooking',
            'music': 'Music',
            'personal': 'Personal Development',
            'other': 'Other'
        };
        return <Badge variant={variants[category] || 'secondary'}>{category}</Badge>;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Skills Management
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Manage platform skills and categories
                            </p>
                        </div>

                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New Skill
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Skill</DialogTitle>
                                    <DialogDescription>
                                        Add a new skill to the platform. This will be available for users to select.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="skill-name">Skill Name</Label>
                                        <Input
                                            id="skill-name"
                                            value={newSkill.name}
                                            onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g., JavaScript, Guitar, Spanish"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="skill-category">Category</Label>
                                        <Select
                                            value={newSkill.category}
                                            onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="technical">Technical</SelectItem>
                                                <SelectItem value="creative">Creative</SelectItem>
                                                <SelectItem value="language">Language</SelectItem>
                                                <SelectItem value="business">Business</SelectItem>
                                                <SelectItem value="sports">Sports & Fitness</SelectItem>
                                                <SelectItem value="cooking">Cooking</SelectItem>
                                                <SelectItem value="music">Music</SelectItem>
                                                <SelectItem value="personal">Personal Development</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="skill-description">Description (Optional)</Label>
                                        <Input
                                            id="skill-description"
                                            value={newSkill.description}
                                            onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Brief description of the skill"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="skill-tags">Tags (Optional)</Label>
                                        <Input
                                            id="skill-tags"
                                            value={newSkill.tags?.join(', ') || ''}
                                            onChange={(e) => setNewSkill(prev => ({
                                                ...prev,
                                                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                                            }))}
                                            placeholder="e.g., programming, web development, javascript"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsCreateDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateSkill}
                                        disabled={createSkillMutation.isPending || !newSkill.name || !newSkill.category}
                                    >
                                        {createSkillMutation.isPending ? 'Creating...' : 'Create Skill'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </motion.div>

                {skillStatsLoading ? (
                    <div className="animate-pulse space-y-4 mb-6">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">{skillStats?.data?.totalSkills || 0}</div>
                                        <div className="text-sm text-muted-foreground">Total Skills</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{skillStats?.data?.activeSkills || 0}</div>
                                        <div className="text-sm text-muted-foreground">Active Skills</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">{skillStats?.data?.pendingSuggestions || 0}</div>
                                        <div className="text-sm text-muted-foreground">Pending Suggestions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{skillStats?.data?.skillsByCategory?.length || 0}</div>
                                        <div className="text-sm text-muted-foreground">Categories</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="search">Search Skills</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by name or description..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <Label htmlFor="category">Filter by Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Skills Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Skills ({filteredSkills.length})
                        </CardTitle>
                        <CardDescription>
                            Manage platform skills and their categories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="animate-pulse space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                ))}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Skill</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {filteredSkills.map((skill) => (
                                            <motion.tr
                                                key={skill._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                                            {skill.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="font-medium">{skill.name}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getCategoryBadge(skill.category)}</TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {skill.description || 'No description'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{skill.usageCount || 0}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatDate(skill.createdAt)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSkillBeingEdited(skill);
                                                                setEditSkillDraft({
                                                                    name: skill.name || '',
                                                                    category: skill.category || '',
                                                                    description: skill.description || ''
                                                                });
                                                                setIsEditDialogOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will remove the skill from the platform.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                        onClick={() => deleteMutation.mutate(skill._id)}
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
                {/* Skill Suggestions Section */}
                {suggestions?.length > 0 && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                Skill Suggestions ({suggestions.length})
                            </CardTitle>
                            <CardDescription>
                                User-submitted skill suggestions awaiting review
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {suggestions.map((suggestion) => (
                                    <div key={suggestion._id} className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">                                        <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">{suggestion.name}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            Category: {suggestion.category} | Suggested by: {suggestion.suggestedBy?.name}
                                        </div>
                                        {suggestion.description && (
                                            <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">{suggestion.description}</div>
                                        )}
                                    </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedSuggestion(suggestion);
                                                    setReviewAction('approve');
                                                    setReviewNotes('');
                                                    setIsReviewDialogOpen(true);
                                                }}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedSuggestion(suggestion);
                                                    setReviewAction('reject');
                                                    setReviewNotes('');
                                                    setIsReviewDialogOpen(true);
                                                }}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Review Suggestion Dialog */}
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {reviewAction === 'approve' ? 'Approve Skill Suggestion' : 'Reject Skill Suggestion'}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedSuggestion ? (
                                    <span>
                                        Provide optional notes for <span className="font-semibold">{selectedSuggestion.name}</span>.
                                    </span>
                                ) : null}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3 py-2">
                            <Label htmlFor="admin-notes">Admin Notes (optional)</Label>
                            <Textarea
                                id="admin-notes"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add context for your decision..."
                                rows={5}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsReviewDialogOpen(false);
                                    setSelectedSuggestion(null);
                                    setReviewNotes('');
                                    setReviewAction(null);
                                }}
                            >
                                Cancel
                            </Button>
                            {reviewAction === 'approve' ? (
                                <Button
                                    onClick={() => {
                                        if (!selectedSuggestion) return;
                                        approveMutation.mutate({ id: selectedSuggestion._id, adminNotes: reviewNotes });
                                        setIsReviewDialogOpen(false);
                                        setSelectedSuggestion(null);
                                        setReviewNotes('');
                                        setReviewAction(null);
                                    }}
                                    disabled={approveMutation.isPending}
                                >
                                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                                </Button>
                            ) : (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (!selectedSuggestion) return;
                                        rejectMutation.mutate({ id: selectedSuggestion._id, adminNotes: reviewNotes });
                                        setIsReviewDialogOpen(false);
                                        setSelectedSuggestion(null);
                                        setReviewNotes('');
                                        setReviewAction(null);
                                    }}
                                    disabled={rejectMutation.isPending}
                                >
                                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Skill Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Skill</DialogTitle>
                            <DialogDescription>Update the skill details below.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editSkillDraft.name}
                                    onChange={(e) => setEditSkillDraft(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category">Category</Label>
                                <Input
                                    id="edit-category"
                                    value={editSkillDraft.category}
                                    onChange={(e) => setEditSkillDraft(prev => ({ ...prev, category: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    rows={4}
                                    value={editSkillDraft.description}
                                    onChange={(e) => setEditSkillDraft(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false);
                                    setSkillBeingEdited(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (!skillBeingEdited) return;
                                    updateMutation.mutate({ id: skillBeingEdited._id, data: editSkillDraft });
                                    setIsEditDialogOpen(false);
                                    setSkillBeingEdited(null);
                                }}
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}