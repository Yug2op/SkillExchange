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
import { Users, BookOpen, Target, X, Sparkles } from 'lucide-react';

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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative border border-border/30 bg-card rounded-xl p-4 transition-all duration-300 hover:border-foreground/10 hover:shadow-sm flex flex-col justify-between h-full"
    >
      <div className="space-y-3">
        {/* TOP ROW BRAND STRIP */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <h4 className="font-medium text-sm text-foreground truncate">{skill.name}</h4>
          </div>
          <Badge variant="outline" className="text-[9px] font-mono uppercase tracking-widest px-2 py-0 h-4 border-border/60 bg-secondary/50 text-muted-background/80 shrink-0">
            {skill.category}
          </Badge>
        </div>

        {/* LOG FIELD DESCRIPTION STRING */}
        {skill.description && skill.description.length < 60 && (
          <p className="text-xs text-muted-foreground/80 font-light leading-relaxed line-clamp-2 pr-2">
            {skill.description}
          </p>
        )}
      </div>

      {/* FOOTER ACTIONS CRITERIA RIG */}
      <div className="space-y-3 mt-5 pt-3 border-t border-border/10">
        
        {/* COUNTER ANALYTICS ROW */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/40 font-light uppercase tracking-wider">
          <Users className="h-3 w-3 stroke-[1.5]" />
          <span>{skill.userCount || 0} Platform Nodes</span>
        </div>

        {/* COMPACT STACK BUTTON LAYOUT SWITCHES */}
        <div className="space-y-1.5">
          
          {/* INSTRUCTION TEACH OPERATOR CONTROL TRACK */}
          <div className="relative">
            {showLevelSelector === 'teach' ? (
              <div className="flex items-center gap-1.5 p-1 bg-background border border-border/50 rounded-lg animate-fade-in-up">
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="h-7 flex-1 text-[11px] font-mono border-0 focus:ring-0 shadow-none bg-transparent px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/40 text-foreground min-w-[100px]">
                    <SelectItem value="Beginner" className="text-xs font-mono">Beginner</SelectItem>
                    <SelectItem value="Intermediate" className="text-xs font-mono">Intermediate</SelectItem>
                    <SelectItem value="Advanced" className="text-xs font-mono">Advanced</SelectItem>
                    <SelectItem value="Expert" className="text-xs font-mono">Expert</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  size="sm"
                  type="button"
                  onClick={() => handleAddSkill('teach')}
                  className="h-7 text-[10px] font-mono uppercase tracking-wider bg-foreground text-background px-2.5 rounded-md transition-opacity hover:opacity-90"
                >
                  Confirm
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setShowLevelSelector(null)}
                  className="h-7 w-7 p-0 text-muted-foreground/30 hover:text-foreground hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => handleAddSkill('teach')}
                disabled={isInTeach}
                className={`w-full h-8 text-[11px] font-mono uppercase tracking-wider gap-2 border rounded-lg transition-all ${
                  isInTeach 
                    ? 'border-primary/20 bg-primary/5 text-primary disabled:opacity-100' 
                    : 'border-border/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {isInTeach ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Teaching
                  </>
                ) : (
                  <>
                    <BookOpen className="h-3.5 w-3.5 shrink-0 stroke-[1.5]" /> Teach Skill
                  </>
                )}
              </Button>
            )}
          </div>

          {/* TARGET LEARN OPERATOR CONTROL TRACK */}
          <div className="relative">
            {showLevelSelector === 'learn' ? (
              <div className="flex items-center gap-1.5 p-1 bg-background border border-border/50 rounded-lg animate-fade-in-up">
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="h-7 flex-1 text-[11px] font-mono border-0 focus:ring-0 shadow-none bg-transparent px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/40 text-foreground min-w-[100px]">
                    <SelectItem value="Beginner" className="text-xs font-mono">Beginner</SelectItem>
                    <SelectItem value="Intermediate" className="text-xs font-mono">Intermediate</SelectItem>
                    <SelectItem value="Advanced" className="text-xs font-mono">Advanced</SelectItem>
                    <SelectItem value="Expert" className="text-xs font-mono">Expert</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  size="sm"
                  type="button"
                  onClick={() => handleAddSkill('learn')}
                  className="h-7 text-[10px] font-mono uppercase tracking-wider bg-foreground text-background px-2.5 rounded-md transition-opacity hover:opacity-90"
                >
                  Confirm
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setShowLevelSelector(null)}
                  className="h-7 w-7 p-0 text-muted-foreground/30 hover:text-foreground hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => handleAddSkill('learn')}
                disabled={isInLearn}
                className={`w-full h-8 text-[11px] font-mono uppercase tracking-wider gap-2 border rounded-lg transition-all ${
                  isInLearn 
                    ? 'border-secondary/20 bg-secondary/5 text-secondary disabled:opacity-100' 
                    : 'border-border/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {isInLearn ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5 shrink-0" /> Learning
                  </>
                ) : (
                  <>
                    <Target className="h-3.5 w-3.5 shrink-0 stroke-[1.5]" /> Learn Skill
                  </>
                )}
              </Button>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}

export default React.memo(SkillCard);