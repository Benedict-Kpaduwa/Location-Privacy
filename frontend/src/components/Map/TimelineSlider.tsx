import { useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Clock } from 'lucide-react';
import type { LocationPoint } from '../../types';

interface TimelineSliderProps {
  locations: LocationPoint[];
  onChange: (range: { start: number; end: number } | undefined) => void;
}

export function TimelineSlider({ locations, onChange }: TimelineSliderProps) {
  const timeRange = useMemo(() => {
    if (locations.length === 0) return { min: 0, max: 24 };
    const hours = locations.map(loc => new Date(loc.timestamp).getHours());
    return { min: Math.min(...hours), max: Math.max(...hours) };
  }, [locations]);

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}${ampm}`;
  };

  const handleChange = (values: number[]) => {
    if (values[0] === 0 && values[1] === 24) {
      onChange(undefined);
    } else {
      onChange({ start: values[0], end: values[1] });
    }
  };

  if (locations.length === 0) return null;

  return (
    <section className="rounded-[20px] bg-field p-4">
      <header className="mb-4 flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
        <Clock className="size-5 text-mute" aria-hidden />
        Time filter
      </header>

      <div className="rounded-[16px] bg-page p-4">
        <Slider
          aria-label="Time range"
          defaultValue={[0, 24]}
          min={0}
          max={24}
          step={1}
          onValueChange={handleChange}
          className="py-2"
        />

        <div className="mt-2 flex justify-between text-[13px] font-semibold text-mute">
          <span>{formatHour(timeRange.min)}</span>
          <span>{formatHour(timeRange.max)}</span>
        </div>
      </div>

      <p className="mt-3 text-center text-[14px] text-mute">
        Showing <span className="font-extrabold text-ink">{locations.length}</span> location points
      </p>
    </section>
  );
}
