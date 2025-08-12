import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = ['00', '15', '30', '45'];

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  className
}) => {
  const [hour, minute] = value.split(':');

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour}:${newMinute}`);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-24">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}:00
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-24">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              :{m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
