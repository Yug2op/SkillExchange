import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { getSkillsForPublic, getSkillCategories, suggestNewSkill } from '@/api/SkillsApi';
import {
    Search,
    Filter,
    Plus,
    Users,
    BookOpen,
    Target,
    Lightbulb,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import SkillCard from './SkillCard';

function SkillsSelection({
    selectedSkills = { teach: [], learn: [] },
    onSkillsChange,
    mode = 'registration' // 'registration' or 'profile'
}) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
    const [newSkillSuggestion, setNewSkillSuggestion] = useState({
        name: '',
        category: '',
        description: ''
    });

    // Fetch skills and categories
    const { data: skillsData, isLoading: skillsLoading } = useQuery({
        queryKey: ['public-skills', { category, search }],
        queryFn: () => getSkillsForPublic({ category: category !== 'all' ? category : undefined, search }),
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['skill-categories'],
        queryFn: getSkillCategories,
    });

    const skills = skillsData?.data?.skills || [];
    const categories = categoriesData?.data?.categories || [];

    // Filter skills based on current selections
    const filteredSkills = skills.filter(skill => {
        const isInTeach = selectedSkills.teach.some(s => s.skill === skill.name);
        const isInLearn = selectedSkills.learn.some(s => s.skill === skill.name);
        return !isInTeach && !isInLearn;
    });

    const handleSkillToggle = (skillName, type, level = 'beginner') => {
        const skillObj = { skill: skillName, level };

        if (type === 'teach') {
            const isSelected = selectedSkills.teach.some(s => s.skill === skillName);
            const newTeach = isSelected
                ? selectedSkills.teach.filter(s => s.skill !== skillName)
                : [...selectedSkills.teach, skillObj];

            onSkillsChange({
                ...selectedSkills,
                teach: newTeach
            });
        } else if (type === 'learn') {
            const isSelected = selectedSkills.learn.some(s => s.skill === skillName);
            const newLearn = isSelected
                ? selectedSkills.learn.filter(s => s.skill !== skillName)
                : [...selectedSkills.learn, skillObj];

            onSkillsChange({
                ...selectedSkills,
                learn: newLearn
            });
        }
    };

    const handleSuggestSkill = async () => {
        if (newSkillSuggestion.name && newSkillSuggestion.category) {
            try {
                await suggestNewSkill(newSkillSuggestion);
                setIsSuggestModalOpen(false);
                setNewSkillSuggestion({ name: '', category: '', description: '' });

                toast.success('Skill suggestion submitted!', {
                    description: `"${newSkillSuggestion.name}" has been submitted for admin review.`,
                    duration: 4000,
                });
            } catch (error) {
                console.error('Error suggesting skill:', error);
                toast.error('Failed to submit suggestion', {
                    description: error?.message || 'Please try again later.',
                    duration: 4000,
                });
            }
        } else {
            toast.error('Missing information', {
                description: 'Please provide both skill name and category.',
                duration: 3000,
            });
        }
    };

    const getSkillLevelColor = (level) => {
        const colors = {
            Beginner: 'bg-black-100 text-black-800',
            Intermediate: 'bg-green-100 text-green-800',
            Advanced: 'bg-yellow-100 text-yellow-800',
            Expert: 'bg-red-100 text-red-800'
        };
        return colors[level] || colors.Beginner;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {mode === 'registration' ? 'Choose Your Skills' : 'Manage Your Skills'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    {mode === 'registration'
                        ? 'Select skills you can teach and want to learn'
                        : 'Browse and manage your skills'
                    }
                </p>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search skills..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Dialog open={isSuggestModalOpen} onOpenChange={setIsSuggestModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    Suggest Skill
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Suggest New Skill</DialogTitle>
                                    <DialogDescription>
                                        Can't find a skill? Suggest it and our admins will review it.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skill Name</label>
                                        <Input
                                            value={newSkillSuggestion.name}
                                            onChange={(e) => setNewSkillSuggestion(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g., Machine Learning"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                            <div className="space-y-2">
                                                {/* Existing Categories Option */}
                                                <Select
                                                    value={newSkillSuggestion.category}
                                                    onValueChange={(value) => setNewSkillSuggestion(prev => ({ ...prev, category: value, customCategory: '' }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select existing category (optional)" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map(cat => (
                                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                {/* Custom Category Input */}
                                                <div className="relative">
                                                    <Input
                                                        value={newSkillSuggestion.customCategory || ''}
                                                        onChange={(e) => setNewSkillSuggestion(prev => ({
                                                            ...prev,
                                                            customCategory: e.target.value,
                                                            category: e.target.value || prev.category // Use custom if provided, fallback to selected
                                                        }))}
                                                        placeholder="Or enter new category name"
                                                        className="pr-8"
                                                    />
                                                    {newSkillSuggestion.customCategory && (
                                                        <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Select an existing category above or enter a new one below for your skill suggestion.
                                            </p>

                                        
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                                        <Input
                                            value={newSkillSuggestion.description}
                                            onChange={(e) => setNewSkillSuggestion(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Brief description of the skill"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsSuggestModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSuggestSkill}>
                                        Submit Suggestion
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            {/* Selected Skills Summary */}
            {(selectedSkills.teach.length > 0 || selectedSkills.learn.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">Selected Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Skills to Teach */}
                            {selectedSkills.teach.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                                        <BookOpen className="h-4 w-4 text-green-600" />
                                        Skills I Teach ({selectedSkills.teach.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSkills.teach.map((skillObj, index) => (
                                            <Badge key={index} variant="secondary" className="gap-1">
                                                {skillObj.skill}
                                                <span className={`text-xs px-1 rounded ${getSkillLevelColor(skillObj.level)}`}>
                                                    {skillObj.level}
                                                </span>
                                                <button
                                                    onClick={() => handleSkillToggle(skillObj.skill, 'teach')}
                                                    className="ml-1 hover:text-red-500 dark:hover:text-red-400"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills to Learn */}
                            {selectedSkills.learn.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                                        <Target className="h-4 w-4 text-blue-600" />
                                        Skills I Want to Learn ({selectedSkills.learn.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSkills.learn.map((skillObj, index) => (
                                            <Badge key={index} variant="outline" className="gap-1">
                                                {skillObj.skill}
                                                <span className={`text-xs px-1 rounded ${getSkillLevelColor(skillObj.level)}`}>
                                                    {skillObj.level}
                                                </span>
                                                <button
                                                    onClick={() => handleSkillToggle(skillObj.skill, 'learn')}
                                                    className="ml-1 hover:text-red-500 dark:hover:text-red-400"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Available Skills */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Users className="h-5 w-5" />
                        Available Skills ({filteredSkills.length})
                    </CardTitle>
                    <CardDescription>
                        Select skills to add to your teach or learn lists
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {skillsLoading ? (
                        <div className="animate-pulse space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                        </div>
                    ) : filteredSkills.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No skills found matching your criteria</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence>
                                {filteredSkills.map((skill) => (
                                    <SkillCard
                                        key={skill._id}
                                        skill={skill}
                                        onAddToTeach={(level) => handleSkillToggle(skill.name, 'teach', level)}
                                        onAddToLearn={(level) => handleSkillToggle(skill.name, 'learn', level)}
                                        isInTeach={selectedSkills.teach.some(s => s.skill === skill.name)}
                                        isInLearn={selectedSkills.learn.some(s => s.skill === skill.name)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
export default React.memo(SkillsSelection)