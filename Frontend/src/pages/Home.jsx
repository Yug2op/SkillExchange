import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Users,
  MessageCircle,
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
  Heart,
  Award,
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

  // Fetch real stats data
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn: getPublicStats,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Format stats for display
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
    // Better fallback data while loading
    { number: 'Loading...', label: 'Active Members', icon: Users },
    { number: 'Loading...', label: 'Skills Available', icon: Lightbulb },
    { number: 'Loading...', label: 'Exchanges Completed', icon: Handshake },
    { number: 'Loading...', label: 'Satisfaction Rate', icon: Star }
  ];

  const features = [
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'Get paired with users based on skills you teach and want to learn. Our algorithm finds your perfect learning partners.',
      gradient: 'from-blue-400 to-blue-600',  // Monochromatic blue gradient
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Zap,
      title: 'Real-time Chat',
      description: 'Message instantly with typing indicators, read receipts, and emoji reactions. Stay connected with your learning partners.',
      gradient: 'from-blue-500 to-blue-700',  // Monochromatic blue gradient
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Schedule online or offline sessions with flexible time slots. Integrated calendar with reminders and confirmations.',
      gradient: 'from-blue-300 to-blue-500',  // Monochromatic blue gradient
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Public reviews and ratings help build trust in the community. Rate your learning experiences and build your reputation.',
      gradient: 'from-blue-600 to-blue-800',  // Monochromatic blue gradient
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Connect with learners worldwide or find local partners. Language support and cultural exchange opportunities.',
      gradient: 'from-blue-200 to-blue-400',  // Monochromatic blue gradient
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Trophy,
      title: 'Achievement System',
      description: 'Earn badges and certificates as you complete skill exchanges. Track your learning journey and showcase achievements.',
      gradient: 'from-blue-500 to-blue-700',  // Monochromatic blue gradient
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-purple-100/20 to-pink-100/20 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              className="space-y-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit text-sm">
                  🚀 Now in Beta - Join Early Access
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Learn and Teach Skills,
                  <span className="text-primary block">Together</span>.
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                  Find perfect matches: share what you know, learn what you love.
                  Real-time chat, session scheduling, and community reviews.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/search">
                    <Search className="mr-2 h-5 w-5" />
                    Explore Skills
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link to="/register">
                    Join Community
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
                {stats.slice(0, 3).map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Visual Element */}
            <motion.div
              className="relative"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <div className="relative">
                {/* Floating skill cards */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    {popularSkills.slice(0, 4).map((skill, index) => (
                      <motion.div
                        key={skill}
                        className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-border"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-sm font-medium text-center">{skill}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Central card */}
                <Card className="relative z-10 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-primary/20 shadow-2xl">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Skill Exchange Hub</CardTitle>
                    <CardDescription>
                      Connect • Learn • Grow Together
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-semibold text-sm">Active Users</div>
                          <div className="text-xs text-muted-foreground">
                            {statsLoading ? 'Loading...' : `${stats[0]?.number || '0'} members`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <div className="font-semibold text-sm">Success Rate</div>
                          <div className="text-xs text-muted-foreground">
                            {statsLoading ? 'Loading...' : `${stats[3]?.number || '0%'} satisfaction`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Why Choose SkillExchange?</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Unlock limitless learning potential through collaborative skill trading and community empowerment
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Begin your skill exchange journey in three powerful steps
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Build Your Profile',
                description: 'Showcase the skills you can teach and identify what you want to master. Create a compelling profile that highlights your expertise and learning aspirations.'
              },
              {
                step: '02',
                title: 'Connect & Match',
                description: 'Discover skilled professionals in your area or globally online. Our intelligent matching system connects you with ideal partners whose skills align perfectly with your goals.'
              },
              {
                step: '03',
                title: 'Exchange & Grow',
                description: 'Schedule collaborative sessions, share knowledge, and evolve together. Experience transformative learning through hands-on exchange and mutual empowerment.'
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                      {item.step}
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 h-8 w-8 text-muted-foreground" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Community Impact</h2>
            <p className="text-muted-foreground">Join a growing community of learners and teachers</p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold">What Our Community Says</h2>
            <p className="text-muted-foreground">
              Real experiences from real learners and teachers
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Skills Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="space-y-8"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl lg:text-3xl font-bold">Popular Skills</h2>
              </div>
              <p className="text-muted-foreground">
                Discover the most sought-after skills in our community
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {popularSkills.map((skill) => (
                <Link
                  key={skill}
                  to={`/search?skill=${encodeURIComponent(skill)}`}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
                  >
                    {skill}
                  </Badge>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center space-y-8 max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">Ready to Start Your Learning Journey?</h2>
              <p className="text-muted-foreground text-lg">
                Join thousands of learners and teachers building skills together
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/register">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/search">
                  Browse Skills
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                No payment required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Start learning today
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Join {statsLoading ? '...' : `${stats[0]?.number || '0'}`} members
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}