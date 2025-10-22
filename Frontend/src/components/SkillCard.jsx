import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Users, BookOpen, Target, ChevronDown, X } from 'lucide-react';

function SkillCard({ skill, onAddToTeach, onAddToLearn, isInTeach, isInLearn }) {
    const [showLevelSelector, setShowLevelSelector] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('Beginner');

    const handleAddSkill = (type) => {
        if (showLevelSelector === type) {
            if (type === 'teach') {
                onAddToTeach(selectedLevel);
            } else {
                onAddToLearn(selectedLevel);
            }
            setShowLevelSelector(null);
            setSelectedLevel('Beginner');
        } else {
            setShowLevelSelector(type);
            setSelectedLevel('Beginner');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            className="group border rounded-xl p-3 hover:border-blue-200 dark:hover:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-800 relative overflow-hidden"
        >
            {/* Header - Compact */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <h4 className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">{skill.name}</h4>
                </div>
                <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
                    {skill.category}
                </Badge>
            </div>

            {/* Description - Only if exists and short */}
            {skill.description && skill.description.length < 60 && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {skill.description}
                </p>
            )}

            {/* User Count and Actions Container */}
            <div className="space-y-2">
                {/* User Count */}
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="h-3 w-3" />
                    <span>{skill.userCount || 0}</span>
                </div>

                {/* Action Buttons - Stack vertically when level selector is shown */}
                <div className="space-y-2">
                    {/* Teach Section */}
                    <div className="relative">
                        {showLevelSelector === 'teach' ? (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                    <SelectTrigger className="h-7 flex-1 text-xs border-0 bg-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="min-w-[100px]">
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                        <SelectItem value="Expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    size="sm"
                                    onClick={() => handleAddSkill('teach')}
                                    className="h-7 px-3 text-xs"
                                >
                                    Add
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowLevelSelector(null)}
                                    className="h-7 w-7 p-0"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant={isInTeach ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleAddSkill('teach')}
                                disabled={isInTeach}
                                className="w-full h-7 text-xs gap-1"
                            >
                                <BookOpen className="h-3 w-3" />
                                {isInTeach ? 'Teaching' : 'Teach'}
                            </Button>
                        )}
                    </div>

                    {/* Learn Section */}
                    <div className="relative">
                        {showLevelSelector === 'learn' ? (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                    <SelectTrigger className="h-7 flex-1 text-xs border-0 bg-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="min-w-[100px]">
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                        <SelectItem value="Expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    size="sm"
                                    onClick={() => handleAddSkill('learn')}
                                    className="h-7 px-3 text-xs"
                                >
                                    Add
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowLevelSelector(null)}
                                    className="h-7 w-7 p-0"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant={isInLearn ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleAddSkill('learn')}
                                disabled={isInLearn}
                                className="w-full h-7 text-xs gap-1"
                            >
                                <Target className="h-3 w-3" />
                                {isInLearn ? 'Learning' : 'Learn'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
export default React.memo(SkillCard);