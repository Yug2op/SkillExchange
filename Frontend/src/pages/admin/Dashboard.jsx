import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getDashboardStats, getSkillStats } from '@/api/AdminApi';
import {
    Users,
    TrendingUp,
    Activity,
    Star,
    Award,
    Clock,
    CheckCircle,
    AlertCircle,
    BarChart3,
    PieChart,
    Settings,
    Tag,
    Lightbulb
} from 'lucide-react';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: getDashboardStats,
        refetchInterval: 30000, // Refresh every 30 seconds
        onError: (err) => {
            toast.error('Failed to load dashboard stats', { description: err?.message || 'Try again later.' });
        }
    });

    const { data: skillStats, isLoading: skillStatsLoading } = useQuery({
        queryKey: ['admin-skill-stats'],
        queryFn: getSkillStats,
        onError: (err) => toast.error('Failed to load skill stats', { description: err?.message || 'Try again later.' })
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
                <div className="max-w-7xl mx-auto text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
                    <p className="text-red-500">{error.message}</p>
                </div>
            </div>
        );
    }

    const statsData = stats?.data;

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
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Monitor and manage your SkillExchange platform
                            </p>
                        </div>
                        {/* Replace the current div around lines 79-96 with this */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={() => navigate('/admin/users')}
                                className="gap-2 justify-start"
                                variant="outline"
                                size="lg"
                            >
                                <Users className="h-4 w-4 text-blue-600" />

                                User Management
                            </Button>
                            <Button
                                onClick={() => navigate('/admin/skills')}
                                className="gap-2 justify-start"
                                variant="outline"
                                size="lg"
                            >
                                <Settings className="h-4 w-4 text-purple-500" />
                                Skills Management
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statsData?.users?.total || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {statsData?.users?.active || 0} active users
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Exchanges</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statsData?.exchanges?.total || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {statsData?.exchanges?.completed || 0} completed
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statsData?.reviews?.total || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Total platform reviews
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statsData?.users?.newLast30Days || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    New users in last 30 days
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Detailed Stats */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* User Statistics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    User Statistics
                                </CardTitle>
                                <CardDescription>Detailed breakdown of user data</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Active Users</span>
                                    <Badge variant="secondary">{statsData?.users?.active || 0}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Verified Users</span>
                                    <Badge variant="secondary">{statsData?.users?.verified || 0}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">New Users (30 days)</span>
                                    <Badge variant="outline">{statsData?.users?.newLast30Days || 0}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Exchange Statistics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Exchange Statistics
                                </CardTitle>
                                <CardDescription>Exchange activity overview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Pending Exchanges</span>
                                    <Badge variant="outline">{statsData?.exchanges?.pending || 0}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Active Exchanges</span>
                                    <Badge variant="secondary">{statsData?.exchanges?.active || 0}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Completed Exchanges</span>
                                    <Badge variant="default">{statsData?.exchanges?.completed || 0}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Top Skills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Popular Skills
                            </CardTitle>
                            <CardDescription>Most requested skills on the platform</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h4 className="font-semibold mb-3">Skills to Teach</h4>
                                    <div className="space-y-2">
                                        {statsData?.topSkills?.teach?.slice(0, 5).map((skill, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span className="text-sm">{skill._id}</span>
                                                <Badge variant="outline">{skill.count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3">Skills to Learn</h4>
                                    <div className="space-y-2">
                                        {statsData?.topSkills?.learn?.slice(0, 5).map((skill, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span className="text-sm">{skill._id}</span>
                                                <Badge variant="outline">{skill.count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Skill Statistics */}
                {skillStatsLoading ? (
                    <div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 mt-8"
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
                                <Tag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{skillStats?.data?.totalSkills || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {skillStats?.data?.activeSkills || 0} active skills
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Suggestions</CardTitle>
                                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{skillStats?.data?.totalSuggestions || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {skillStats?.data?.pendingSuggestions || 0} pending review
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Skills by Category</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{skillStats?.data?.skillsByCategory?.length || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Categories available
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Most Popular Category</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {skillStats?.data?.skillsByCategory?.[0]?._id || 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {skillStats?.data?.skillsByCategory?.[0]?.count || 0} skills
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}