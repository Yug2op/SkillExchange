import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Users,
  Calendar,
  Star,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Globe,
  Handshake,
  Trophy,
  ChevronRight,
  PlayCircle,
  Shield,
  Lightbulb
} from 'lucide-react';

import { usePopularSkills } from '@/hooks/usePopularSkills';
import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '@/api/PublicApi';
import { formatStatsNumber } from '@/utils/formatStats';

export default function Home() {
  const { data: popularSkillsData } = usePopularSkills();

  // Fetch real stats data safely through your exact query parameters
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn: getPublicStats,
    staleTime: 5 * 60 * 1000, 
  });

  // Structural mappings retaining all baseline labels and dynamic keys
  const stats = statsData?.data ? [
    {
      number: formatStatsNumber(statsData.data.activeMembers),
      label: 'Active Members',
      icon: Users
    },
    {
      number: formatStatsNumber(statsData.data.skillsAvailable),
      label: 'Skills Available',
      icon: Lightbulb
    },
    {
      number: formatStatsNumber(statsData.data.exchangesCompleted),
      label: 'Exchanges Completed',
      icon: Handshake
    },
    {
      number: `${statsData.data.satisfactionRate}%`,
      label: 'Satisfaction Rate',
      icon: Star
    }
  ] : [
    { number: 'Loading...', label: 'Active Members', icon: Users },
    { number: 'Loading...', label: 'Skills Available', icon: Lightbulb },
    { number: 'Loading...', label: 'Exchanges Completed', icon: Handshake },
    { number: 'Loading...', label: 'Satisfaction Rate', icon: Star }
  ];

  // Restored 100% of your exact text data arrays & configuration keys
  const features = [
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'Get paired with users based on skills you teach and want to learn. Our algorithm finds your perfect learning partners.',
      gradient: 'from-primary/20 to-primary/5',  
      iconColor: 'text-primary'
    },
    {
      icon: Zap,
      title: 'Real-time Chat',
      description: 'Message instantly with typing indicators, read receipts, and emoji reactions. Stay connected with your learning partners.',
      gradient: 'from-secondary/20 to-secondary/5',  
      iconColor: 'text-secondary'
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Schedule online or offline sessions with flexible time slots. Integrated calendar with reminders and confirmations.',
      gradient: 'from-primary/20 to-primary/5',
      iconColor: 'text-primary'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Public reviews and ratings help build trust in the community. Rate your learning experiences and build your reputation.',
      gradient: 'from-secondary/20 to-secondary/5',
      iconColor: 'text-secondary'
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Connect with learners worldwide or find local partners. Language support and cultural exchange opportunities.',
      gradient: 'from-primary/20 to-primary/5',
      iconColor: 'text-primary'
    },
    {
      icon: Trophy,
      title: 'Achievement System',
      description: 'Earn badges and certificates as you complete skill exchanges. Track your learning journey and showcase achievements.',
      gradient: 'from-secondary/20 to-secondary/5',
      iconColor: 'text-secondary'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'UX Designer',
      content: 'Found amazing mentors for design skills. The platform made learning so accessible!',
      avatar: 'SC',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Software Engineer',
      content: 'Teaching React has never been easier. Great community and smooth scheduling.',
      avatar: 'MJ',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'Marketing Manager',
      content: 'Perfect for learning new skills while sharing my marketing expertise.',
      avatar: 'ER',
      rating: 5
    }
  ];

  const popularSkills = popularSkillsData?.data?.popularSkills || [
    'JavaScript', 'Python', 'React', 'Design', 'Marketing',
    'Photography', 'Music', 'Cooking', 'Yoga', 'Spanish',
    'Guitar', 'Drawing', 'Writing', 'Data Science', 'Public Speaking'
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased transition-colors duration-300">
      
      {/* MONOLITHIC CYBER HERO HEADER GRID */}
      <section className="relative overflow-hidden border-b border-border/30 bg-card/20 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-12 items-center">
          
          <motion.div 
            className="space-y-8 lg:col-span-7"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-4">
              <Badge variant="outline" className="px-3 py-1 bg-card border-border/60 font-mono text-[11px] tracking-wider text-secondary uppercase animate-pulse">
                Join Early Access
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-medium tracking-tight tracking-[-0.04em] leading-[1.1]">
                Learn and Teach Skills, <br />
                <span className="text-primary font-light italic">Together</span>.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl font-light leading-relaxed">
                Find perfect matches: share what you know, learn what you love. Real-time chat, session scheduling, and community reviews.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
              <Button asChild size="lg" className="w-full sm:w-auto text-xs uppercase tracking-widest font-medium py-6 px-8 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
                <Link to="/search" className="flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" /> Explore SkillsF
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-xs uppercase tracking-widest font-medium py-6 px-8 border-border/60 hover:bg-muted bg-card text-foreground rounded-lg">
                <Link to="/register" className="flex items-center justify-center gap-2">
                  Join Community <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Flat Embedded Linear Row Stats Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/30 max-w-md">
              {stats.slice(0, 3).map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="text-2xl font-light tracking-tight text-primary">
                    {statsLoading ? '...' : stat.number}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                    {stat.label.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT HERO SIDE PANEL (Preserving your specific layout controls) */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 blur opacity-30" />
            
            <Card className="relative z-10 bg-card border border-border/40 shadow-xl rounded-2xl backdrop-blur-sm">
              <CardHeader className="text-center pb-4 border-b border-border/20">
                <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-md">
                  <Link 
                    to="/" 
                    className="flex items-center gap-3.5 group relative select-none focus-visible:outline-none"
                    aria-label="SkillExchange Home Coordinates"
                  >
                    {/* VISUAL GEOMETRIC HANDSHAKE MARQUE */}
                    <div className="relative w-8 h-8 flex items-center justify-center transition-transform duration-500 ease-[0.16, 1, 0.3, 1] group-hover:scale-[1.04]">
                      
                      {/* Base Shifting Anchor (Skill Left) */}
                      <div className="absolute left-0 w-5 h-5 rounded-md border border-primary/30 bg-primary/5 rotate-45 transition-transform duration-500 ease-[0.16, 1, 0.3, 1] group-hover:rotate-[135deg] group-hover:border-primary/60" />
                      
                      {/* Intersecting Trajectory Anchor (Exchange Right) */}
                      <div className="absolute right-0 w-5 h-5 rounded-md border border-secondary/40 bg-secondary/10 rotate-45 mix-blend-difference dark:mix-blend-screen transition-transform duration-500 ease-[0.16, 1, 0.3, 1] group-hover:rotate-[-45deg] group-hover:border-secondary/70" />
                      
                      {/* Central Core Handshake Node */}
                      <div className="absolute h-1.5 w-1.5 rounded-full bg-foreground border border-background shadow-xs relative z-10" />
                    </div>
                  </Link>
                </div>
                
                <CardTitle className="text-xl font-medium tracking-tight">Skill Exchange Hub</CardTitle>
                <CardDescription className="text-xs text-muted-foreground/80 font-light mt-1">
                  Connect • Learn • Grow Together
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3.5 bg-background/50 border border-border/20 rounded-xl">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium text-xs">Active Users</div>
                      <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                        {statsLoading ? 'Loading...' : `${stats[0]?.number || '0'} members`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 bg-background/50 border border-border/20 rounded-xl">
                    <Star className="h-4 w-4 text-secondary fill-secondary" />
                    <div>
                      <div className="font-medium text-xs">Success Rate</div>
                      <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                        {statsLoading ? 'Loading...' : `${stats[3]?.number || '0%'} metrics`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Micro Floating Skill Chips Overlay Area */}
                <div className="flex flex-wrap gap-1.5 justify-center mt-6 pt-4 border-t border-border/20">
                  {popularSkills.slice(0, 4).map((skill) => (
                    <span key={skill} className="text-[10px] font-mono tracking-wide px-2.5 py-1 rounded bg-muted/60 text-foreground/80 border border-border/10">
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </section>

      {/* ASYMMETRIC BENTO GRID FEATURE PANEL LAYOUT */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
          <Badge variant="outline" className="px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
            Why Choose SkillExchange?
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">Everything You Need to Succeed</h2>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            Unlock limitless learning potential through collaborative skill trading and community empowerment.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ y: 15, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: Math.min(idx * 0.05, 0.3) }}
              viewport={{ once: true }}
            >
              <Card className="h-full border border-border/40 bg-card rounded-xl transition-all duration-300 hover:border-foreground/20 group cursor-pointer flex flex-col justify-between">
                <CardHeader className="space-y-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-105 transition-transform border border-border/10`}>
                    <feature.icon className={`h-4 w-4 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-base font-medium tracking-tight group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs text-muted-foreground/90 leading-relaxed font-light">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TIMELINE PROGRESS HOVER FLOW MATRIX (HOW IT WORKS) */}
      <section className="bg-card/20 border-y border-border/30 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-md mx-auto mb-20">
            <h2 className="text-3xl font-medium tracking-tight">How It Works</h2>
            <p className="text-sm text-muted-foreground font-light mt-1">Begin your skill exchange journey in three powerful steps</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto relative">
            {[
              { step: '01', title: 'Build Your Profile', desc: 'Showcase the skills you can teach and identify what you want to master. Create a compelling profile that highlights your expertise and learning aspirations.' },
              { step: '02', title: 'Connect & Match', desc: 'Discover skilled professionals in your area or globally online. Our intelligent matching system connects you with ideal partners whose skills align perfectly with your goals.' },
              { step: '03', title: 'Exchange & Grow', desc: 'Schedule collaborative sessions, share knowledge, and evolve together. Experience transformative learning through hands-on exchange and mutual empowerment.' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative group"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border border-border/40 rounded-xl h-full p-4 text-center flex flex-col items-center">
                  <CardHeader className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-muted border border-border/40 font-mono font-medium text-sm flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      {item.step}
                    </div>
                    <CardTitle className="text-base font-medium tracking-tight">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs text-muted-foreground/80 font-light leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-6 transform -translate-y-1/2 z-20 text-muted-foreground/30 group-hover:text-primary/60 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE REPUTATION ANALYSIS SECTION (IMPACT STATS) */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-border/20">
        <div className="text-center max-w-md mx-auto mb-16">
          <h2 className="text-2xl font-medium tracking-tight">Community Impact</h2>
          <p className="text-xs text-muted-foreground font-light mt-1">Join a growing community of learners and teachers</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.98, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="text-center border border-border/40 bg-card rounded-xl hover:border-primary/30 transition-colors">
                <CardContent className="pt-8 pb-6 space-y-3">
                  <div className="p-2 w-fit rounded-lg bg-background border border-border/10 mx-auto text-muted-foreground/60">
                    <stat.icon className="h-4 w-4 stroke-[1.5]" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-3xl font-light tracking-tight text-primary">{stat.number}</div>
                    <div className="text-[11px] text-muted-foreground font-mono tracking-wider uppercase">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CHRISP TEXT TESTIMONIAL PANEL CARDS */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-md mx-auto mb-16">
          <h2 className="text-2xl font-medium tracking-tight">What Our Community Says</h2>
          <p className="text-xs text-muted-foreground font-light mt-1">Real experiences from real learners and teachers</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border border-border/40 bg-card rounded-xl h-full flex flex-col justify-between p-2">
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center gap-0.5">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/90 font-light leading-relaxed italic">
                    "{test.content}"
                  </p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-8 w-8 rounded-full bg-muted border border-border/30 text-xs font-mono font-medium text-muted-foreground flex items-center justify-center">
                      {test.avatar}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-medium text-foreground">{test.name}</div>
                      <div className="text-[11px] text-muted-foreground/60 font-light">{test.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* RADIAL SEARCH EXPLORATION CHIPS (POPULAR SKILLS) */}
      <section className="bg-card/20 border-t border-border/30 py-20 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground/80">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span>Popular Skills</span>
            </div>
            <p className="text-xs text-muted-foreground/60 font-light">Discover the most sought-after skills in our community</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {popularSkills.map((skill) => (
              <Link key={skill} to={`/search?skill=${encodeURIComponent(skill)}`}>
                <Badge variant="outline" className="px-3.5 py-1.5 bg-card hover:bg-foreground hover:text-background border-border/40 hover:border-foreground text-foreground/80 text-[11px] tracking-wide rounded-full font-light transition-all duration-200">
                  {skill}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM HIGH-CONTRAST CONSOLIDATION HERO BANNER (CTA) */}
      <section className="bg-foreground text-background py-24 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter tracking-[-0.03em] leading-tight">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xs sm:text-sm text-background/70 max-w-md mx-auto font-light leading-relaxed">
              Join thousands of learners and teachers building skills together without payment rules or commission gateways.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xs sm:max-w-md mx-auto">
            <Button asChild size="lg" className="w-full text-xs uppercase tracking-widest font-medium py-6 px-8 bg-background text-foreground hover:bg-background/80 rounded-lg transition-opacity">
              <Link to="/register" className="flex items-center justify-center gap-2">
                <PlayCircle className="h-4 w-4" /> Get Started Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full text-xs uppercase tracking-widest font-medium py-6 px-8 border-background/20 hover:bg-background/10 bg-transparent text-background rounded-lg transition-colors">
              <Link to="/search" className="flex items-center justify-center gap-2">
                Browse Skills <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Verification compliance labels matrix */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[10px] uppercase tracking-widest font-mono text-background/40 pt-4">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-secondary stroke-[2.5]" /> No payment required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-secondary stroke-[2.5]" /> Start learning today</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-secondary stroke-[2.5]" /> Join {statsLoading ? '...' : stats[0]?.number} members
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}