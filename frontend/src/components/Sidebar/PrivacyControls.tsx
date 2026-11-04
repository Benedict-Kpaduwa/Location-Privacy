import { useState } from 'react';
import { Shield, Grid3X3, Circle, Waves, Loader2, RotateCcw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { tint } from '@/lib/utils';
import type { PrivacyTechnique } from '../../types';

interface PrivacyControlsProps {
  onApply: (technique: PrivacyTechnique, params: Record<string, number>) => void;
  onReset: () => void;
  isLoading: boolean;
  isAnonymized: boolean;
}

const TECHNIQUES = [
  {
    id: 'k-anonymity' as PrivacyTechnique,
    name: 'K-Anonymity',
    icon: Grid3X3,
    description: 'Group into grid cells',
    param: 'k',
    paramLabel: 'K value',
    min: 2,
    max: 20,
    step: 1,
    valueFormat: (v: number) => `k = ${v}`,
  },
  {
    id: 'spatial-cloaking' as PrivacyTechnique,
    name: 'Spatial Cloaking',
    icon: Circle,
    description: 'Random displacement',
    param: 'radius_meters',
    paramLabel: 'Radius',
    min: 50,
    max: 1000,
    step: 50,
    valueFormat: (v: number) => `${v} m`,
  },
  {
    id: 'differential-privacy' as PrivacyTechnique,
    name: 'Differential Privacy',
    icon: Waves,
    description: 'Noise injection',
    param: 'epsilon',
    paramLabel: 'Epsilon (ε)',
    min: 0.1,
    max: 2.0,
    step: 0.1,
    valueFormat: (v: number) => `ε = ${v.toFixed(1)}`,
  },
];

export function PrivacyControls({
  onApply,
  onReset,
  isLoading,
  isAnonymized,
}: PrivacyControlsProps) {
  const [selectedTechnique, setSelectedTechnique] = useState<PrivacyTechnique>('k-anonymity');
  const [params, setParams] = useState<Record<string, number>>({
    k: 5,
    radius_meters: 200,
    epsilon: 1.0,
  });

  const currentTechnique = TECHNIQUES.find(t => t.id === selectedTechnique)!;

  const getPrivacyLevel = () => {
    switch (selectedTechnique) {
      case 'k-anonymity':
        return params.k >= 10 ? 'High' : params.k >= 5 ? 'Medium' : 'Low';
      case 'spatial-cloaking':
        return params.radius_meters >= 500 ? 'High' : params.radius_meters >= 200 ? 'Medium' : 'Low';
      case 'differential-privacy':
        return params.epsilon <= 0.5 ? 'High' : params.epsilon <= 1.0 ? 'Medium' : 'Low';
    }
  };

  const privacyLevel = getPrivacyLevel();
  const levelColor =
    privacyLevel === 'High' ? 'var(--risk-low)' : privacyLevel === 'Medium' ? 'var(--risk-mid)' : 'var(--risk-high)';

  return (
    <section className="rounded-[20px] bg-field p-4">
      <header className="mb-3 flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
        <Lock className="size-5 text-mute" aria-hidden />
        Privacy protection
      </header>

      <div role="radiogroup" aria-label="Technique" className="space-y-2">
        {TECHNIQUES.map(technique => {
          const isSelected = selectedTechnique === technique.id;
          const Icon = technique.icon;

          return (
            <button
              key={technique.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelectedTechnique(technique.id)}
              className={`pressable flex min-h-14 w-full items-center gap-3 rounded-[16px] bg-page px-3 py-2 text-left ${
                isSelected ? 'outline-2 -outline-offset-2 outline-brand' : ''
              }`}
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full ${
                  isSelected ? 'bg-brand text-white' : 'bg-field text-mute'
                }`}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold leading-tight">{technique.name}</span>
                <span className="block text-[13px] text-mute">{technique.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-[16px] bg-page p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="eyebrow">{currentTechnique.paramLabel}</span>
          <span className="num rounded-full bg-brand/12 px-3 py-1 text-[14px] text-accent-text">
            {currentTechnique.valueFormat(params[currentTechnique.param])}
          </span>
        </div>

        <Slider
          aria-label={currentTechnique.paramLabel}
          value={[params[currentTechnique.param]]}
          min={currentTechnique.min}
          max={currentTechnique.max}
          step={currentTechnique.step}
          onValueChange={([value]) => setParams(prev => ({
            ...prev,
            [currentTechnique.param]: value,
          }))}
          className="py-2"
        />

        <div className="mt-2 flex justify-between text-[12px] text-mute">
          <span>Less privacy</span>
          <span>More privacy</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-[14px] text-mute">Protection level</span>
        <span
          className="rounded-full px-3 py-1 text-[13px] font-extrabold"
          style={{ background: tint(levelColor, 14), color: levelColor }}
        >
          {privacyLevel}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
        {isAnonymized && (
          <Button variant="outline" size="lg" onClick={onReset} className="sm:flex-1 lg:flex-none xl:flex-1">
            <RotateCcw aria-hidden />
            Reset
          </Button>
        )}
        <Button
          size="lg"
          onClick={() => onApply(selectedTechnique, params)}
          disabled={isLoading}
          className="sm:flex-1 lg:flex-none xl:flex-1"
        >
          {isLoading ? <Loader2 className="animate-spin" aria-hidden /> : <Shield aria-hidden />}
          {isAnonymized ? 'Re-apply' : 'Apply protection'}
        </Button>
      </div>
    </section>
  );
}
