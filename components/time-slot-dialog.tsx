import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { TimePicker } from "./ui/time-picker";

interface TimeSlotDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    date: Date;
    startTime: string;
    endTime: string;
    reason?: string;
  }) => Promise<void>;
  dialogType: 'maintenance' | 'operating' | 'blackout';
  title?: string;
  description?: string;
}

export function TimeSlotDialog({
  open,
  onClose,
  onConfirm,
  dialogType,
  title,
  description,
}: TimeSlotDialogProps) {
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        date,
        startTime,
        endTime,
        reason: dialogType === 'maintenance' ? reason : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting time slot:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {title ||
                (dialogType === 'maintenance'
                  ? 'Block for Maintenance'
                  : dialogType === 'operating'
                  ? 'Set Operating Hours'
                  : 'Add Blackout Date')}
            </DialogTitle>
            <DialogDescription>
              {description ||
                (dialogType === 'maintenance'
                  ? 'Block time slots for court maintenance.'
                  : dialogType === 'operating'
                  ? 'Set regular operating hours for this court.'
                  : 'Add dates when the court will be unavailable.')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Select Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            {dialogType !== 'blackout' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <TimePicker
                    value={startTime}
                    onChange={setStartTime}
                    className="w-full"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <TimePicker
                    value={endTime}
                    onChange={setEndTime}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {dialogType === 'maintenance' && (
              <div className="grid gap-2">
                <Label htmlFor="reason">Maintenance Reason</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for maintenance"
                  required
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!date || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
