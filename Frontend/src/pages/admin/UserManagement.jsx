import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    getAllUsers,
    deactivateUser,
    activateUser,
    deleteUser,
    getDeactivatedUsers
} from '@/api/AdminApi';
import {
    Users,
    Search,
    Filter,
    MoreHorizontal,
    UserCheck,
    UserX,
    Trash2,
    Eye,
    Ban,
    CheckCircle,
    AlertTriangle,
    MessageSquare,
    User,
    Star,
    AlertCircle,
    MapPin,
    BookOpen,
    Target,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function UserManagement() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const limit = 20;

    const queryClient = useQueryClient();

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['admin-users', { page, search, status }],
        queryFn: () => getAllUsers({ page, limit, search, status }),
        onError: (err) => toast.error('Failed to fetch users', { description: err?.message || 'Try again later.' })
    });

    const { data: deactivatedData } = useQuery({
        queryKey: ['admin-deactivated-users'],
        queryFn: getDeactivatedUsers,
        onError: (err) => toast.error('Failed to fetch deactivated users', { description: err?.message || 'Try again later.' })
    });

    // Mutations
    const deactivateMutation = useMutation({
        mutationFn: deactivateUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            queryClient.invalidateQueries(['admin-deactivated-users']);
            toast.success('User deactivated');
        },
        onError: (error) => {
            toast.error('Failed to deactivate user', { description: error?.message || 'Try again later.' });
        }
    });

    const activateMutation = useMutation({
        mutationFn: activateUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            queryClient.invalidateQueries(['admin-deactivated-users']);
            toast.success('User reactivated');
        },
        onError: (error) => {
            toast.error('Failed to reactivate user', { description: error?.message || 'Try again later.' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            queryClient.invalidateQueries(['admin-deactivated-users']);
            toast.success('User deleted');
        },
        onError: (error) => {
            toast.error('Failed to delete user', { description: error?.message || 'Try again later.' });
        }
    });

    const users = usersData?.data?.users || [];
    const pagination = usersData?.data?.pagination || {};

    const handleStatusChange = (userId, action) => {
        if (action === 'deactivate') {
            deactivateMutation.mutate(userId);
        } else if (action === 'activate') {
            activateMutation.mutate(userId);
        } else if (action === 'delete') {
            deleteMutation.mutate(userId);
        }
    };

    const getStatusBadge = (user) => {
        if (!user.isActive) {
            return <Badge variant="destructive">Inactive</Badge>;
        }
        if (user.isEmailVerified) {
            return <Badge variant="default">Verified</Badge>;
        }
        return <Badge variant="secondary">Unverified</Badge>;
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        User Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Manage user accounts, permissions, and activity
                    </p>
                </motion.div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="search">Search Users</Label>
                                <Input
                                    id="search"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <Label htmlFor="status">Filter by Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Users ({pagination.total || 0})
                        </CardTitle>
                        <CardDescription>
                            Manage user accounts and permissions
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
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Last Active</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {users.map((user) => (
                                            <motion.tr
                                                key={user._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                                            <img
                                                                src={user.profilePic?.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`}
                                                                alt={user.name}
                                                                className="avatar"
                                                                loading="lazy"
                                                                style={{ width: 35, height: 35, borderRadius: '100%' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {user.rating?.average?.toFixed(1) || '0.0'} ⭐ ({user.rating?.count || 0} reviews)
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{getStatusBadge(user)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                                <TableCell>{formatDate(user.lastActive)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setSelectedUser(user)}
                                                        >
                                                            <Eye className="h-4 w-4 text-blue-500 " />
                                                        </Button>

                                                        {/* Replace the deactivate button (around line 259-266) with this AlertDialog */}
                                                        {user.isActive ? (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        disabled={deactivateMutation.isPending}
                                                                    >
                                                                        <Ban className="h-4 w-4 text-orange-500" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Deactivate User Account</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to deactivate this user account? The user will no longer be able to access the platform, but their data will be preserved and they can be reactivated later.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleStatusChange(user._id, 'deactivate')}
                                                                            className="bg-orange-600 hover:bg-orange-700"
                                                                        >
                                                                            Deactivate Account
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleStatusChange(user._id, 'activate')}
                                                                disabled={activateMutation.isPending}
                                                            >
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            </Button>
                                                        )}

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the user account and all associated data.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleStatusChange(user._id, 'delete')}
                                                                        className="bg-red-600 hover:bg-red-700"
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

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                    disabled={page === pagination.pages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Deactivated Users Section */}
                {deactivatedData?.data?.users?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    Deactivated Users ({deactivatedData.data.users.length})
                                </CardTitle>
                                <CardDescription>
                                    Users who have been deactivated by admins
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {deactivatedData.data.users.map((user) => (
                                        <div key={user._id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleStatusChange(user._id, 'activate')}
                                                disabled={activateMutation.isPending}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                Reactivate
                                            </Button>
                                        </div>
                                    ))}

                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* User Detail Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={selectedUser.profilePic?.url || `https://ui-avatars.com/api/?name=${selectedUser?.name || 'U'}&background=random`}
                                                alt={selectedUser.name}
                                                loading="lazy"
                                                className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
                                            />
                                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${selectedUser.isActive ? 'bg-green-500' : 'bg-red-500'
                                                }`}>
                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                                            <p className="text-blue-100">{selectedUser.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getStatusBadge(selectedUser)}
                                                <Badge variant={selectedUser.role === 'admin' ? 'destructive' : 'secondary'} className="bg-white/20 text-white border-white/30">
                                                    {selectedUser.role}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedUser(null)}
                                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        {/* Basic Info */}
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    Account Information
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                                                        <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Last Active</Label>
                                                        <p className="font-medium">{formatDate(selectedUser.lastActive)}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                                                        <p className="font-medium flex items-center gap-1">
                                                            {selectedUser.rating?.average?.toFixed(1) || '0.0'}
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm text-muted-foreground">
                                                                ({selectedUser.rating?.count || 0} reviews)
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Verification</Label>
                                                        <p className="font-medium flex items-center gap-2">
                                                            {selectedUser.isEmailVerified ? (
                                                                <>
                                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    Email Verified
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                                    Email Not Verified
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Location */}
                                        {selectedUser.location && (
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <MapPin className="h-5 w-5" />
                                                        Location
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="font-medium">
                                                        {selectedUser?.location.city ? (
                                                            <span>
                                                                {/* This handles all cases: city only, country only, or both */}
                                                                {[selectedUser.location.city, selectedUser.location.country].filter(Boolean).join(', ')}
                                                            </span>
                                                        ) : (
                                                            <span className="italic text-muted-foreground/60">
                                                                Location not specified
                                                            </span>
                                                        )}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Bio */}
                                        {selectedUser.bio && (
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <MessageSquare className="h-5 w-5" />
                                                        Bio
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm leading-relaxed">{selectedUser.bio}</p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Skills to Teach */}
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <BookOpen className="h-5 w-5 text-green-600" />
                                                    Skills to Teach
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedUser.skillsToTeach?.map((skillObj) => (
                                                        <Badge key={skillObj.skill} variant="secondary" className="gap-1">
                                                            {skillObj.skill}
                                                            <span className="text-xs opacity-75">({skillObj.level})</span>
                                                        </Badge>
                                                    )) || <span className="text-sm text-muted-foreground">No skills to teach</span>}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Skills to Learn */}
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Target className="h-5 w-5 text-blue-600" />
                                                    Skills to Learn
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedUser.skillsToLearn?.map((skillObj) => (
                                                        <Badge key={skillObj.skill} variant="outline" className="gap-1">
                                                            {skillObj.skill}
                                                            <span className="text-xs opacity-75">({skillObj.level})</span>
                                                        </Badge>
                                                    )) || <span className="text-sm text-muted-foreground">No skills to learn</span>}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Actions */}
                                <Card className="mt-6">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-wrap gap-3">
                                            <Link to={`/users/${selectedUser._id}`} >
                                                <Button variant="outline" className="gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    View Public Profile
                                                </Button>
                                            </Link>
                                            <Link to={`/chat/${selectedUser._id}`} >
                                                <Button variant="outline" className="gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    Send Message
                                                </Button>
                                            </Link>

                                            {selectedUser.isActive ? (
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => {
                                                        handleStatusChange(selectedUser._id, 'deactivate');
                                                        setSelectedUser(null);
                                                    }}
                                                    disabled={deactivateMutation.isPending}
                                                    className="gap-2"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                    Deactivate User
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="default"
                                                    onClick={() => {
                                                        handleStatusChange(selectedUser._id, 'activate');
                                                        setSelectedUser(null);
                                                    }}
                                                    disabled={activateMutation.isPending}
                                                    className="gap-2 text-green-500"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Reactivate User
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}