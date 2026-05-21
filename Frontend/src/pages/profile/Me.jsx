import { useMe } from '@/hooks/useMe';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Star, Calendar, Award, Edit3, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandLoader from '@/components/BrandLoader';

export default function MeProfile() {
  const { data: user, isLoading, isError } = useMe();

  if (isLoading) return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <BrandLoader/>
    </div>
  );

  if (isError || !user) return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center max-w-sm space-y-6"
      >
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-medium tracking-tight">Identity Terminated</h3>
          <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">
            Please log in to your account dashboard to authenticate session parameters.
          </p>
        </div>
        <Button asChild className="w-full text-xs uppercase tracking-widest font-medium py-5 rounded-lg bg-foreground text-background">
          <Link to="/login">Go to Login Matrix</Link>
        </Button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        
        {/* INTERFACE HERO OVERVIEW CARD */}
        <motion.div 
          className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Profile Avatar Frame */}
              <div className="relative shrink-0">
                <img
                  src={user?.profilePic?.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`}
                  alt={user.name}
                  loading="lazy"
                  className="w-24 h-24 rounded-full object-cover filter grayscale contrast-125 border border-border/40"
                />
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-secondary border-2 border-card animate-pulse" />
              </div>

              {/* Identity Descriptions */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-3xl font-light tracking-tight text-foreground">{user.name}</h2>
                  <p className="text-xs font-mono text-muted-foreground/80 font-light">{user.email}</p>
                </div>

                {/* Rating Vector Display */}
                <div className="flex items-center gap-3 text-xs font-light text-muted-foreground/70">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3.5 w-3.5 ${i < Math.floor(user.rating?.average || 0) ? 'fill-secondary text-secondary' : 'text-border/60'}`} 
                      />
                    ))}
                  </div>
                  <span>
                    {user.rating?.average?.toFixed(1) || '0.0'} ({user.rating?.count || 0} index records)
                  </span>
                </div>

                {/* Meta Coordinate Lines */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-light text-muted-foreground/60">
                  {(user.location?.city || user.location?.country) && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {[user.location.city, user.location.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Anchor */}
            <Link 
              to="/profile/edit" 
              className="text-xs uppercase tracking-widest font-medium h-11 px-5 border border-border/40 hover:bg-muted bg-card text-foreground rounded-lg flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-primary" /> Edit Profile
            </Link>

          </div>
        </motion.div>

        {/* PROFILE ATTRIBUTE GRID SEGMENTS */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* About Me Section Area */}
          <motion.div 
            className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h3 className="text-sm font-mono uppercase tracking-widest text-primary font-medium flex items-center gap-2">
              <svg className="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              About Me
            </h3>
            <p className="text-sm text-muted-foreground/90 font-light leading-relaxed">
              {user.bio || 'No structural biography logged yet.'}
            </p>
          </motion.div>

          {/* Cleaned Skills Matrix Section Area (Fixed Duplication Defect) */}
          <motion.div 
            className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-mono uppercase tracking-widest text-primary font-medium flex items-center gap-2">
              <Award className="w-4 h-4 stroke-[1.5]" /> Skills Matrix
            </h3>

            <div className="space-y-5">
              {/* Instruction Mapping */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-foreground/70 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full" /> Skills I Teach
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(user.skillsToTeach || []).length > 0 ? (
                    (user.skillsToTeach || []).map((skillObj, index) => (
                      <span key={index} className="text-xs font-light px-3 py-1 bg-background border border-border/40 text-foreground/90 rounded-md">
                        {skillObj.skill} <span className="text-[10px] font-mono text-muted-foreground/60 ml-0.5">({skillObj.level})</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs italic text-muted-foreground/40 font-light pl-1">No instructional arrays active.</span>
                  )}
                </div>
              </div>

              {/* Acquisition Mapping */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-foreground/70 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Skills I Want to Learn
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(user.skillsToLearn || []).length > 0 ? (
                    (user.skillsToLearn || []).map((skillObj, index) => (
                      <span key={index} className="text-xs font-light px-3 py-1 bg-background border border-border/40 text-muted-foreground rounded-md">
                        {skillObj.skill} <span className="text-[10px] font-mono text-muted-foreground/40 ml-0.5">({skillObj.level})</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs italic text-muted-foreground/40 font-light pl-1">No learning arrays active.</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* HORIZONTAL SYSTEM AUDIT SUMMARY OVERLAY */}
        <motion.div 
          className="border border-border/30 bg-card rounded-2xl p-6 md:p-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 mb-6 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" /> Operational Metrics Overview
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: user.rating?.count || 0, label: 'Logs Reviewed' },
              { value: user.rating?.average?.toFixed(1) || '0.0', label: 'Rating Metric' },
              { value: new Date(user.createdAt).getFullYear(), label: 'Initialization' },
              { value: user.isEmailVerified ? 'Verified' : 'Pending', label: 'Security State' }
            ].map((stat) => (
              <div key={stat.label} className="space-y-0.5 text-center sm:text-left border-l border-border/20 pl-4 sm:pl-6">
                <div className="text-2xl font-light tracking-tight text-primary">
                  {stat.value}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* BOTTOM GLOBAL ROUTER LINK CTAS CONTROLS */}
        <motion.div 
          className="flex items-center justify-center gap-4 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link 
            to="/profile/edit"
            className="text-xs uppercase tracking-widest font-medium h-12 px-8 bg-foreground text-background hover:opacity-90 rounded-xl flex items-center gap-2 transition-opacity"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </Link>
          <Link 
            to="/change-password"
            className="text-xs uppercase tracking-widest font-medium h-12 px-8 border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl flex items-center gap-2 transition-all"
          >
            <Lock className="w-4 h-4 stroke-[1.75]" /> Update Password
          </Link>
        </motion.div>

      </div>
    </div>
  );
}