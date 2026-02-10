
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
    <div className="rounded-2xl bg-[hsl(225,20%,8%)] border border-[hsl(225,15%,15%)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[hsl(225,15%,12%)] flex items-center gap-2">
        <Clock className="w-4 h-4 text-[hsl(185,100%,50%)]" />
        <span className="text-sm font-semibold text-white">Time Filter</span>
      </div>
      
      <div className="p-4 space-y-4">
        <Slider
          defaultValue={[0, 24]}
          min={0}
          max={24}
          step={1}
          onValueChange={handleChange}
        />
        
        <div className="flex justify-between text-xs text-[hsl(215,15%,45%)]">
          <span>{formatHour(timeRange.min)}</span>
          <span>{formatHour(timeRange.max)}</span>
        </div>
        
        <div className="text-xs text-center text-[hsl(215,15%,45%)]">
          Showing <span className="font-semibold text-white">{locations.length}</span> location points
        </div>
      </div>
    </div>
  );
}
