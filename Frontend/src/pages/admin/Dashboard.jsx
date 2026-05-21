import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  BarChart3,
  Settings,
  Tag,
  Lightbulb,
  Loader2
} from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, 
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <BrandLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="text-center max-w-sm space-y-6">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-medium tracking-tight border-b border-border/20 pb-2">Error Loading Dashboard</h3>
            <p className="text-sm text-destructive font-light leading-relaxed">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const statsData = stats?.data;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        
        {/* INTERFACE HEADLINE AND MANAGEMENT DIRECTORY ANCHORS */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-light tracking-tighter leading-none">Admin Dashboard.</h1>
            <p className="text-sm text-muted-foreground font-light">Monitor and manage your SkillExchange platform metrics.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              onClick={() => navigate('/admin/users')}
              variant="ghost"
              className="text-xs uppercase tracking-widest font-medium h-11 px-5 border border-border/40 hover:bg-muted/60 bg-card text-foreground rounded-lg gap-2.5 transition-all"
            >
              <Users className="h-3.5 w-3.5 text-primary" />
              User Management
            </Button>
            <Button
              onClick={() => navigate('/admin/skills')}
              variant="ghost"
              className="text-xs uppercase tracking-widest font-medium h-11 px-5 border border-border/40 hover:bg-muted/60 bg-card text-foreground rounded-lg gap-2.5 transition-all"
            >
              <Settings className="h-3.5 w-3.5 text-secondary" />
              Skills Management
            </Button>
          </div>
        </motion.div>

        {/* PRIMARY OVERVIEW STATS HIGHLIGHT DATA ROWS */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="p-6 border border-border/30 bg-card rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
              <span>Total Users</span> <Users className="h-3.5 w-3.5" />
            </div>
            <div className="text-3xl font-light tracking-tight text-foreground">{statsData?.users?.total || 0}</div>
            <p className="text-[11px] text-muted-foreground/60 font-light truncate">{statsData?.users?.active || 0} active users</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 border border-border/30 bg-card rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
              <span>Total Exchanges</span> <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <div className="text-3xl font-light tracking-tight text-foreground">{statsData?.exchanges?.total || 0}</div>
            <p className="text-[11px] text-primary font-light truncate">{statsData?.exchanges?.completed || 0} completed</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 border border-border/30 bg-card rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
              <span>Reviews</span> <Star className="h-3.5 w-3.5" />
            </div>
            <div className="text-3xl font-light tracking-tight text-foreground">{statsData?.reviews?.total || 0}</div>
            <p className="text-[11px] text-muted-foreground/60 font-light truncate">Total platform reviews</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 border border-border/30 bg-card rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
              <span>New This Month</span> <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div className="text-3xl font-light tracking-tight text-secondary">{statsData?.users?.newLast30Days || 0}</div>
            <p className="text-[11px] text-muted-foreground/60 font-light truncate">New users in last 30 days</p>
          </motion.div>
        </div>

        {/* DETAILED DOUBLE GRID BLOCK ARRAYS */}
        <div className="grid gap-8 lg:grid-cols-2 pt-4">
          
          {/* USER SYSTEM DETAILED PARAMETERS */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-6">
            <div className="space-y-1 pb-4 border-b border-border/20">
              <h3 className="text-sm font-mono uppercase tracking-widest text-primary font-medium flex items-center gap-2">
                <Users className="h-4 w-4 stroke-[1.5]" /> User Statistics
              </h3>
            </div>

            <div className="space-y-4 text-xs font-light text-muted-foreground">
              <div className="flex justify-between items-center py-1">
                <span>Active Users</span>
                <span className="font-mono font-medium text-foreground text-sm">{statsData?.users?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-border/10 pt-4">
                <span>Verified Users</span>
                <span className="font-mono font-medium text-foreground text-sm">{statsData?.users?.verified || 0}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-border/10 pt-4">
                <span>New Users (30 days)</span>
                <span className="font-mono font-medium text-secondary text-sm">{statsData?.users?.newLast30Days || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* EXCHANGE OPERATIONAL STATISTICS */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-6">
            <div className="space-y-1 pb-4 border-b border-border/20">
              <h3 className="text-sm font-mono uppercase tracking-widest text-primary font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 stroke-[1.5]" /> Exchange Statistics
              </h3>
            </div>

            <div className="space-y-4 text-xs font-light text-muted-foreground">
              <div className="flex justify-between items-center py-1">
                <span>Pending Exchanges</span>
                <span className="font-mono font-medium text-foreground text-sm">{statsData?.exchanges?.pending || 0}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-border/10 pt-4">
                <span>Active Exchanges</span>
                <span className="font-mono font-medium text-foreground text-sm">{statsData?.exchanges?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-border/10 pt-4">
                <span>Completed Exchanges</span>
                <span className="font-mono font-medium text-primary text-sm">{statsData?.exchanges?.completed || 0}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* POPULAR TALENT DEMAND MATRICES */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-6">
          <div className="space-y-1 pb-4 border-b border-border/20">
            <h3 className="text-sm font-mono uppercase tracking-widest text-primary font-medium flex items-center gap-2">
              <Award className="h-4 w-4 stroke-[1.5]" /> Popular Skills Metrics
            </h3>
          </div>

          <div className="grid gap-12 md:grid-cols-2 pt-2">
            {/* Skills to Teach Panel */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-wider text-muted-foreground/60 font-medium">Skills to Teach</h4>
              <div className="space-y-3.5">
                {statsData?.topSkills?.teach?.slice(0, 5).map((skill, index) => (
                  <div key={index} className="flex justify-between items-center text-xs font-light text-muted-foreground pb-2 border-b border-border/10">
                    <span className="text-foreground/90">{skill._id}</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground">{skill.count} channels</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills to Learn Panel */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-wider text-muted-foreground/60 font-medium">Skills to Learn</h4>
              <div className="space-y-3.5">
                {statsData?.topSkills?.learn?.slice(0, 5).map((skill, index) => (
                  <div key={index} className="flex justify-between items-center text-xs font-light text-muted-foreground pb-2 border-b border-border/10">
                    <span className="text-foreground/90">{skill._id}</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground">{skill.count} nodes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* RADIAL SKILL MATRIX AUDIT INDEX ROWS */}
        {skillStatsLoading ? (
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <BrandLoader/>
              </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            <div className="p-5 border border-border/30 bg-card rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                <span>Total Skills</span> <Tag className="h-3.5 w-3.5" />
              </div>
              <div className="text-2xl font-light text-foreground">{skillStats?.data?.totalSkills || 0}</div>
              <p className="text-[10px] text-muted-foreground/40 font-light truncate">{skillStats?.data?.activeSkills || 0} active rows</p>
            </div>

            <div className="p-5 border border-border/30 bg-card rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                <span>Pending Suggestions</span> <Lightbulb className="h-3.5 w-3.5" />
              </div>
              <div className="text-2xl font-light text-secondary">{skillStats?.data?.totalSuggestions || 0}</div>
              <p className="text-[10px] text-muted-foreground/40 font-light truncate">{skillStats?.data?.pendingSuggestions || 0} pending review</p>
            </div>

            <div className="p-5 border border-border/30 bg-card rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                <span>Skills by Category</span> <BarChart3 className="h-3.5 w-3.5" />
              </div>
              <div className="text-2xl font-light text-foreground">{skillStats?.data?.skillsByCategory?.length || 0}</div>
              <p className="text-[10px] text-muted-foreground/40 font-light truncate">Categories available</p>
            </div>

            <div className="p-5 border border-border/30 bg-card rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                <span>Primary Category</span> <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <div className="text-lg font-medium text-primary truncate tracking-tight pt-1 leading-none">{skillStats?.data?.skillsByCategory?.[0]?._id || 'N/A'}</div>
              <p className="text-[10px] text-muted-foreground/40 font-light truncate">{skillStats?.data?.skillsByCategory?.[0]?.count || 0} active skill sets</p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}