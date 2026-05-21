import { useState, useEffect, useMemo } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

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
  MapPin,
  Loader2
} from 'lucide-react';

export default function RequestExchange() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: meData } = useMe();

  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedTeachingSkill, setSelectedTeachingSkill] = useState('');
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

  // 1. Skills they can teach that you want to learn (What you can request)
  // FALLBACK: If empty, show ALL their teaching skills so you can still request something!
  const matchingSkills = useMemo(() => {
    const directMatches = (user?.skillsToTeach || []).filter(skillObj => {
      const userSkillName = typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName;
      return (currentUser?.skillsToLearn || []).some(learnObj => {
        const learnSkillName = typeof learnObj.skill === 'string' ? learnObj.skill : learnObj.skillName;
        return learnSkillName === userSkillName;
      });
    });

    return directMatches.length > 0 ? directMatches : (user?.skillsToTeach || []);
  }, [user, currentUser]);

  // 2. Skills you can teach that they want to learn (What you can offer)
  // FALLBACK: If empty, show ALL your teaching skills so you can offer anything!
  const offeringSkills = useMemo(() => {
    const directOffers = (currentUser?.skillsToTeach || []).filter(skillObj => {
      const currentUserSkillName = typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName;
      return (user?.skillsToLearn || []).some(teachObj => {
        const teachSkillName = typeof teachObj.skill === 'string' ? teachObj.skill : teachObj.skillName;
        return teachSkillName === currentUserSkillName;
      });
    });

    return directOffers.length > 0 ? directOffers : (currentUser?.skillsToTeach || []);
  }, [user, currentUser]);

  useEffect(() => {
    // Auto-select your offer if there's only one option available
    if (offeringSkills.length === 1 && !selectedTeachingSkill) {
      const skillName = typeof offeringSkills[0].skill === 'string'
        ? offeringSkills[0].skill
        : offeringSkills[0].skillName || 'None';
      setSelectedTeachingSkill(skillName);
    }
  }, [offeringSkills, selectedTeachingSkill]);

  const handleSkillToggle = (skill) => {
    // Single select mode for clear payload transitions
    setSelectedSkills([skill]);
  };

  const handleTeachingSkillSelect = (skill) => {
    setSelectedTeachingSkill(skill);
  };

  // Check if at least an asymmetric single route match is possible
  const canExchange = matchingSkills.length > 0 || offeringSkills.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalRequestedSkill = selectedSkills[0] || 'None';
    const finalOfferedSkill = selectedTeachingSkill || 
      (offeringSkills.length === 1 
        ? (typeof offeringSkills[0].skill === 'string' ? offeringSkills[0].skill : offeringSkills[0].skillName) 
        : 'None');

    // Block logic only if both sides are completely empty
    if (finalRequestedSkill === 'None' && finalOfferedSkill === 'None') {
      toast.error('Cannot create an empty exchange. Please select a skill to learn or teach.');
      return;
    }

    try {
      setLoading(true);

      await createRequest({
        receiverId: id,
        skillOffered: finalOfferedSkill,
        skillRequested: finalRequestedSkill,
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <BrandLoader/>
          </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm space-y-6">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-medium tracking-tight">User Node Absent</h3>
            <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">
              The partner profile could not be verified inside our active system directory registry.
            </p>
          </div>
          <Button asChild className="w-full text-xs uppercase tracking-widest font-medium py-5 rounded-lg bg-foreground text-background">
            <Link to="/search"><ArrowLeft className="mr-2 h-3.5 w-3.5" /> Return to Directory</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="text-xs uppercase tracking-widest font-medium h-10 px-3 -ml-3 hover:bg-muted/60">
            <Link to={`/users/${id}`}>
              <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Back to Profile
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5 border-border/30" />
          <div>
            <h1 className="text-2xl font-light tracking-tight">Request Skill Exchange</h1>
            <p className="text-xs text-muted-foreground font-light mt-1">Start a learning partnership with {user.name}</p>
          </div>
        </motion.div>

        {/* CONTORL SPLIT PANELS */}
        <div className="grid gap-12 lg:grid-cols-2">
          
          {/* LEFT COLUMN: PARTNER METRICS */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="space-y-8">
            <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-border/20">
                <Avatar className="h-14 w-14 filter grayscale contrast-125 rounded-full ring-1 ring-border/40">
                  <AvatarImage src={user.profilePic?.url} />
                  <AvatarFallback className="text-sm font-mono bg-muted">{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-base font-medium tracking-tight text-foreground">{user.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/80 font-light">
                    <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-secondary text-secondary" /> {user.rating?.average?.toFixed(1) || '0.0'}</span>
                    {user.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {user.location.city}</span>}
                  </div>
                </div>
              </div>

              {user.bio && <p className="text-xs text-muted-foreground/80 font-light leading-relaxed">{user.bio}</p>}

              {/* Flexible Match Status banner info */}
              {canExchange ? (
                <div className="p-4 border border-primary/20 bg-background/40 rounded-xl space-y-1">
                  <div className="text-xs font-medium text-primary flex items-center gap-1.5 font-mono uppercase tracking-wide">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Match Protocol Active
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 font-light leading-relaxed">
                    You can trade any missing skill parameter directly using our flexible single-ended learning protocol.
                  </p>
                </div>
              ) : (
                <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-xl space-y-1">
                  <div className="text-xs font-medium text-destructive flex items-center gap-1.5 font-mono uppercase tracking-wide">
                    <AlertCircle className="h-3.5 w-3.5" /> Empty Profile Repositories
                  </div>
                  <p className="text-[11px] text-destructive/80 font-light leading-relaxed">
                    Both users must provide at least one active talent token field to initialize connection parameters.
                  </p>
                </div>
              )}
            </div>

            {/* DIRECT SYSTEM ASSETS CARDS SUMMARY */}
            {offeringSkills.length > 0 && (
              <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs uppercase tracking-widest text-muted-foreground/70 font-mono font-medium flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" /> Available Teaching Vault
                  </h4>
                  <p className="text-[11px] text-muted-foreground/50 font-light">Skills on your profile that can be mapped to this request configuration.</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {offeringSkills.map((skillObj, index) => {
                    const skillName = typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName || 'Unknown Skill';
                    return (
                      <span key={`offer-${index}-${skillName}`} className="text-xs font-mono tracking-wide px-3 py-1 bg-background border border-border/40 text-foreground/80 rounded-md">
                        {skillName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* RIGHT COLUMN: ACTION SELECTIONS SUBMIT FORM */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <form onSubmit={handleSubmit} className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-8">
              
              {/* DESIRED ACQUISITION FIELDS SELECTION */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium block">
                    1. Select Skill You Want to Learn (Request)
                  </Label>
                  <p className="text-[11px] text-muted-foreground/50 font-light">Choose a proficiency framework. Leave unselected if you are trading solely on an offer basis.</p>
                </div>

                {matchingSkills.length > 0 ? (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {matchingSkills.map((skillObj, index) => {
                      const skillName = typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName || 'Unknown Skill';
                      const isSelected = selectedSkills.includes(skillName);
                      return (
                        <button
                          key={`matching-${index}-${skillName}`}
                          type="button"
                          onClick={() => handleSkillToggle(skillName)}
                          className={`p-3.5 rounded-xl border text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary/[0.03] text-primary shadow-sm'
                              : 'border-border/60 bg-background hover:border-foreground/20 hover:bg-muted/40'
                          }`}
                        >
                          <div className="text-xs font-medium tracking-tight flex items-center justify-between">
                            <span>{skillName}</span>
                            {isSelected && <Sparkles className="h-3 w-3 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 text-xs border border-dashed border-border text-center rounded-xl text-muted-foreground/40 font-light">
                    No matching teach targets discovered inside partner profile indices.
                  </div>
                )}
              </div>

              {/* REVERSE PIPELINE TEACH SELECTION CHIPS SLOT */}
              <div className="space-y-4 pt-6 border-t border-border/20">
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium block">
                    2. Select Skill You Want to Teach (Offer)
                  </Label>
                  <p className="text-[11px] text-muted-foreground/50 font-light">Select an instructional framework. Leave unselected if you want to request learning parameters only.</p>
                </div>

                {offeringSkills.length > 0 ? (
                  offeringSkills.length === 1 ? (
                    <div className="p-4 bg-background border border-border/30 rounded-xl text-xs font-light flex justify-between items-center">
                      <div className="text-muted-foreground/60 font-mono uppercase tracking-wide text-[10px]">Active Standalone Offer:</div>
                      <span className="font-medium text-foreground">{typeof offeringSkills[0].skill === 'string' ? offeringSkills[0].skill : offeringSkills[0].skillName}</span>
                    </div>
                  ) : (
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      {offeringSkills.map((skillObj, index) => {
                        const skillName = typeof skillObj.skill === 'string' ? skillObj.skill : skillObj.skillName || 'Unknown Skill';
                        const isSelected = selectedTeachingSkill === skillName;
                        return (
                          <button
                            key={`offering-${index}-${skillName}`}
                            type="button"
                            onClick={() => handleTeachingSkillSelect(skillName)}
                            className={`p-3.5 rounded-xl border text-left transition-all duration-200 ${
                              isSelected
                                ? 'border-secondary bg-secondary/[0.03] text-foreground font-medium shadow-sm'
                                : 'border-border/60 bg-background hover:border-foreground/20 hover:bg-muted/40'
                            }`}
                          >
                            <div className="text-xs tracking-tight flex items-center justify-between">
                              <span>{skillName}</span>
                              {isSelected && <BookOpen className="h-3 w-3 shrink-0 text-secondary" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="p-3 text-xs border border-dashed border-border text-center rounded-xl text-muted-foreground/40 font-light">
                    No talent asset fields found on your account architecture profile.
                  </div>
                )}
              </div>

              {/* INTRODUCTION TEXT MESSAGE SECTION CONTAINER */}
              <div className="space-y-2 pt-6 border-t border-border/20">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-medium block">
                  3. Personal Message (Optional)
                </Label>
                <div className="border border-border/40 focus-within:border-foreground/60 rounded-xl p-3 bg-background">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Introduce your project workspace, request details, or scheduling expectations..."
                    rows={4}
                    className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light text-sm shadow-none min-h-24"
                  />
                </div>
              </div>

              {/* ACTION COMPLIANCE CONTROLS TRIGGER BAR BUTTON LAYER */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/20">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(`/users/${id}`)}
                  className="flex-1 text-xs uppercase tracking-widest font-medium py-6 border border-border/40 hover:bg-muted/60 rounded-xl transition-all"
                >
                  Discard Request
                </Button>
                
                <Button
                  type="submit"
                  disabled={loading || (!selectedSkills[0] && !selectedTeachingSkill)}
                  className="flex-1 text-xs uppercase tracking-widest font-medium py-6 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity gap-2"
                >
                  {loading ? (
                    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                          <BrandLoader/>
                        </div>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Send Request
                    </>
                  )}
                </Button>
              </div>

            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}