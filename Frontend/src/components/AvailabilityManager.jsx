import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Clock, Calendar, ArrowRight } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

export default React.memo(function AvailabilityManager({ initialAvailability = [], onAvailabilityChange }) {
  const [availability, setAvailability] = useState(initialAvailability || []);

  useEffect(() => {
    onAvailabilityChange?.(availability);
  }, [availability, onAvailabilityChange]);

  const addTimeSlot = (day) => {
    const dayAvailability = availability.find(a => a.day === day);
    if (dayAvailability) {
      setAvailability(prev => prev.map(a => 
        a.day === day 
          ? { ...a, slots: [...a.slots, { startTime: '09:00', endTime: '10:00' }] }
          : a
      ));
    } else {
      setAvailability(prev => [...prev, { 
        day, 
        slots: [{ startTime: '09:00', endTime: '10:00' }] 
      }]);
    }
  };

  const removeTimeSlot = (day, slotIndex) => {
    setAvailability(prev => prev.map(a => {
      if (a.day === day) {
        const newSlots = a.slots.filter((_, index) => index !== slotIndex);
        return newSlots.length > 0 ? { ...a, slots: newSlots } : null;
      }
      return a;
    }).filter(Boolean));
  };

  const updateTimeSlot = (day, slotIndex, field, value) => {
    setAvailability(prev => prev.map(a => {
      if (a.day === day) {
        const newSlots = [...a.slots];
        newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
        return { ...a, slots: newSlots };
      }
      return a;
    }));
  };

  const getDayAvailability = (day) => {
    return availability.find(a => a.day === day);
  };

  return (
    <div className="border border-border/30 bg-card rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
      
      {/* SECTION CARD HEADER */}
      <div className="space-y-1 pb-4 border-b border-border/20">
        <h3 className="text-sm font-mono uppercase tracking-widest text-primary font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 stroke-[1.5]" /> Availability Schedule
        </h3>
        <p className="text-xs text-muted-foreground/60 font-light">Set your weekly availability window parameters for incoming requests.</p>
      </div>

      {/* COMPACT INTERACTIVE LIST ARCHITECTURE */}
      <div className="divide-y divide-border/10 space-y-4">
        {DAYS.map(day => {
          const dayAvailability = getDayAvailability(day);
          
          return (
            <div key={day} className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-4 first:pt-0">
              
              {/* Left Column: Day Label Metric */}
              <div className="flex items-center justify-between md:w-32 shrink-0 pt-1">
                <span className="text-xs uppercase font-mono tracking-wider text-foreground/80 font-medium">{day}</span>
                
                {/* Mobile Inline Add Button Trigger */}
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => addTimeSlot(day)}
                  className="md:hidden text-[11px] font-mono uppercase tracking-wider text-primary h-8 px-2.5 rounded-lg hover:bg-primary/5"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>

              {/* Middle Axis Column: Inline Selection Interval Blocks */}
              <div className="flex-1 space-y-2">
                {dayAvailability && dayAvailability.slots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {dayAvailability.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="inline-flex items-center gap-2 px-3 py-1.5 bg-background border border-border/40 rounded-xl transition-all hover:border-foreground/20 group">
                        <Clock className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                        
                        {/* Start Interval dropdown block */}
                        <Select
                          value={slot.startTime}
                          onValueChange={(value) => updateTimeSlot(day, slotIndex, 'startTime', value)}
                        >
                          <SelectTrigger className="w-16 h-7 border-0 p-0 text-xs font-mono font-medium focus:ring-0 shadow-none bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border/40 text-foreground min-w-[5rem]">
                            {TIME_SLOTS.map(time => (
                              <SelectItem key={time} value={time} className="text-xs font-mono">{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0 stroke-[1.5]" />

                        {/* End Interval dropdown block */}
                        <Select
                          value={slot.endTime}
                          onValueChange={(value) => updateTimeSlot(day, slotIndex, 'endTime', value)}
                        >
                          <SelectTrigger className="w-16 h-7 border-0 p-0 text-xs font-mono font-medium focus:ring-0 shadow-none bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border/40 text-foreground min-w-[5rem]">
                            {TIME_SLOTS.map(time => (
                              <SelectItem key={time} value={time} className="text-xs font-mono">{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <button
                          type="button"
                          onClick={() => removeTimeSlot(day, slotIndex)}
                          className="text-muted-foreground/40 hover:text-destructive p-0.5 rounded transition-colors ml-1"
                          aria-label={`Remove interval slot #${slotIndex + 1} for ${day}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground/30 italic font-light pt-1.5">
                    No active runtime windows configured.
                  </div>
                )}
              </div>

              {/* Right Column: Desktop Add Button Anchor */}
              <div className="hidden md:block shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => addTimeSlot(day)}
                  className="text-[10px] uppercase font-mono tracking-widest text-primary hover:text-foreground h-8 px-3 border border-border/40 hover:bg-muted/60 rounded-lg gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Slot
                </Button>
              </div>

            </div>
          );
        })}
      </div>

      {/* LOWER TOTAL COMPACT VISUAL TRACKER SUMMARY FOOTPRINT */}
      {availability.length > 0 && (
        <div className="pt-5 border-t border-border/20 space-y-2.5">
          <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground/50 font-medium block">
            Active Schedule
          </span>
          <div className="flex flex-wrap gap-1.5">
            {availability.map(dayAvail => (
              <span key={dayAvail.day} className="text-[11px] font-mono tracking-wide px-2.5 py-1 rounded bg-muted text-foreground/80 border border-border/10">
                {dayAvail.day.substring(0, 3)}: {dayAvail.slots.length} node{dayAvail.slots.length > 1 ? 's' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
});