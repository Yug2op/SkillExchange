import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Plus,
  Users,
  BookOpen,
  Target,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import SkillCard from './SkillCard';

function SkillsSelection({
  selectedSkills = { teach: [], learn: [] },
  onSkillsChange,
  mode = 'registration'
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [newSkillSuggestion, setNewSkillSuggestion] = useState({
    name: '',
    category: '',
    description: ''
  });

  // Fetch skills and categories natively
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

  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const isInTeach = selectedSkills.teach.some(s => s.skill === skill.name);
      const isInLearn = selectedSkills.learn.some(s => s.skill === skill.name);
      return !isInTeach && !isInLearn;
    });
  }, [skills, selectedSkills]);

  const handleSkillToggle = (skillName, type, level = 'beginner') => {
    const skillObj = { skill: skillName, level };

    if (type === 'teach') {
      const isSelected = selectedSkills.teach.some(s => s.skill === skillName);
      const newTeach = isSelected
        ? selectedSkills.teach.filter(s => s.skill !== skillName)
        : [...selectedSkills.teach, skillObj];

      onSkillsChange({ ...selectedSkills, teach: newTeach });
    } else if (type === 'learn') {
      const isSelected = selectedSkills.learn.some(s => s.skill === skillName);
      const newLearn = isSelected
        ? selectedSkills.learn.filter(s => s.skill !== skillName)
        : [...selectedSkills.learn, skillObj];

      onSkillsChange({ ...selectedSkills, learn: newLearn });
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
      Beginner: 'border-muted text-muted-foreground bg-muted/20',
      Intermediate: 'border-primary/20 text-primary bg-primary/5',
      Advanced: 'border-secondary/20 text-secondary bg-secondary/5',
      Expert: 'border-foreground/20 text-foreground bg-foreground/5'
    };
    return colors[level] || colors.Beginner;
  };

  return (
    <div className="space-y-10">
      
      {/* SECTION CARD HEADER TITLE */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-light tracking-tight text-foreground">
          {mode === 'registration' ? 'Choose Your Skills' : 'Manage Your Skills'}
        </h2>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
          {mode === 'registration' ? 'Select skills you can teach and want to learn' : 'Browse and manage your skills'}
        </p>
      </div>

      {/* FILTER CONTROL HORIZONTAL ACTION BAR */}
      <div className="flex flex-col md:flex-row items-center gap-4 p-4 border border-border/30 bg-card/60 rounded-2xl shadow-xs">
        <div className="relative flex-1 w-full border-b border-border/60 focus-within:border-foreground transition-colors py-1">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
          <Input
            placeholder="Query public skillsets repo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent pl-6 pr-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light shadow-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-44 h-9 bg-background border-border/40 focus:ring-0 rounded-lg text-xs font-mono uppercase tracking-wide">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/40 text-foreground">
              <SelectItem value="all" className="text-xs font-mono uppercase">All Fields</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat} className="text-xs font-mono">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* SUGGESTION PANEL SUB-MODAL SYSTEM */}
          <Dialog open={isSuggestModalOpen} onOpenChange={setIsSuggestModalOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full sm:w-auto text-xs uppercase tracking-widest font-medium h-9 px-4 border border-border/40 hover:bg-muted bg-background rounded-lg gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-primary stroke-[1.75]" /> Suggest Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-md bg-card text-foreground border-border/40 rounded-xl p-6">
              <DialogHeader className="text-left">
                <DialogTitle className="text-lg font-medium tracking-tight">Suggest New Skill</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-light leading-relaxed">
                  Can't discover a specific vector? Submit parameters for admin pipeline review.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-3">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">Skill Name</Label>
                  <div className="relative border-b border-border/60 focus-within:border-foreground transition-colors py-1">
                    <Input
                      value={newSkillSuggestion.name}
                      onChange={(e) => setNewSkillSuggestion(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Machine Learning"
                      className="border-0 bg-transparent px-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium block">Category Vector Placement</Label>
                  <Select
                    value={newSkillSuggestion.category}
                    onValueChange={(value) => setNewSkillSuggestion(prev => ({ ...prev, category: value, customCategory: '' }))}
                  >
                    <SelectTrigger className="w-full h-10 bg-background border-border/40 focus:ring-0 rounded-lg text-xs">
                      <SelectValue placeholder="Select existing category group (Optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/40 text-foreground">
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="relative border-b border-border/60 focus-within:border-foreground transition-colors py-1 flex items-center">
                    <Input
                      value={newSkillSuggestion.customCategory || ''}
                      onChange={(e) => setNewSkillSuggestion(prev => ({
                        ...prev,
                        customCategory: e.target.value,
                        category: e.target.value || prev.category
                      }))}
                      placeholder="Or dictate new custom group name"
                      className="border-0 bg-transparent px-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light flex-1"
                    />
                    {newSkillSuggestion.customCategory && <CheckCircle className="h-4 w-4 text-secondary shrink-0 ml-2" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">Brief Description</Label>
                  <div className="relative border-b border-border/60 focus-within:border-foreground transition-colors py-1">
                    <Input
                      value={newSkillSuggestion.description}
                      onChange={(e) => setNewSkillSuggestion(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter brief skill conceptual scope mapping..."
                      className="border-0 bg-transparent px-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-light"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-4 border-t border-border/20">
                <Button type="button" variant="ghost" onClick={() => setIsSuggestModalOpen(false)} className="text-xs uppercase tracking-widest font-medium h-10 px-4 border border-border/40 hover:bg-muted/60 rounded-lg">Cancel</Button>
                <Button type="button" onClick={handleSuggestSkill} className="text-xs uppercase tracking-widest font-medium h-10 px-5 rounded-lg bg-foreground text-background hover:opacity-90">Submit Matrix Token</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ACTIVE SELECTIONS MONITOR FOOTPRINT TRACK */}
      {(selectedSkills.teach.length > 0 || selectedSkills.learn.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 font-medium">Active Workspace Profile Traces</h3>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Instruction Nodes Given */}
            {selectedSkills.teach.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-medium text-foreground/70 flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-primary stroke-[1.5]" /> Skills I Teach ({selectedSkills.teach.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.teach.map((skillObj, index) => (
                    <span key={`sel-teach-${index}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border/40 text-xs font-light">
                      {skillObj.skill}
                      <span className={`text-[10px] font-mono tracking-wide px-1.5 py-px border rounded lowercase leading-none ${getSkillLevelColor(skillObj.level)}`}>
                        {skillObj.level}
                      </span>
                      <button type="button" onClick={() => handleSkillToggle(skillObj.skill, 'teach')} className="text-muted-foreground/40 hover:text-destructive text-sm leading-none ml-0.5 font-medium transition-colors">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Target Acquisition Goals */}
            {selectedSkills.learn.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-medium text-foreground/70 flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-secondary stroke-[1.5]" /> Skills I Want to Learn ({selectedSkills.learn.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.learn.map((skillObj, index) => (
                    <span key={`sel-learn-${index}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border/40 text-xs font-light">
                      {skillObj.skill}
                      <span className={`text-[10px] font-mono tracking-wide px-1.5 py-px border rounded lowercase leading-none ${getSkillLevelColor(skillObj.level)}`}>
                        {skillObj.level}
                      </span>
                      <button type="button" onClick={() => handleSkillToggle(skillObj.skill, 'learn')} className="text-muted-foreground/40 hover:text-destructive text-sm leading-none ml-0.5 font-medium transition-colors">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* GLOBAL DISCOVERY DATA GRID PIPELINE */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
          <Users className="h-4 w-4 stroke-[1.5]" /> Available Repository Matrix ({filteredSkills.length})
        </h3>

        {skillsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 bg-muted rounded-xl animate-pulse opacity-40" />
            ))}
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border/40 bg-card/40 rounded-2xl max-w-sm mx-auto space-y-3">
            <AlertCircle className="h-5 w-5 mx-auto text-muted-foreground/30 stroke-[1.25]" />
            <p className="text-xs text-muted-foreground/60 font-light">No platform skill tokens match current criteria filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
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
      </div>

    </div>
  );
}

export default React.memo(SkillsSelection);