import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Availability Schedule
        </CardTitle>
        <CardDescription>
          Set your weekly availability for skill exchanges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAYS.map(day => {
          const dayAvailability = getDayAvailability(day);
          
          return (
            <div key={day} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{day}</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addTimeSlot(day)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Slot
                </Button>
              </div>

              {dayAvailability && dayAvailability.slots.length > 0 ? (
                <div className="space-y-2">
                  {dayAvailability.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      
                      <Select
                        value={slot.startTime}
                        onValueChange={(value) => updateTimeSlot(day, slotIndex, 'startTime', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <span className="text-muted-foreground">to</span>

                      <Select
                        value={slot.endTime}
                        onValueChange={(value) => updateTimeSlot(day, slotIndex, 'endTime', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTimeSlot(day, slotIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No availability set for {day}
                </div>
              )}
            </div>
          );
        })}

        {availability.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <Label className="text-sm font-medium">Your Availability:</Label>
              {availability.map(dayAvail => (
                <Badge key={dayAvail.day} variant="secondary" className="gap-1">
                  {dayAvail.day} ({dayAvail.slots.length} slot{dayAvail.slots.length > 1 ? 's' : ''})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
})
