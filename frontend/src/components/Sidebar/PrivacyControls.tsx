/**
 * PrivacyControls Component - Premium Design
 */
import { useState } from 'react';
import { Shield, Grid3X3, Circle, Waves, Loader2, RotateCcw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
    paramLabel: 'K Value',
    min: 2,
    max: 20,
    default: 5,
    step: 1,
    valueFormat: (v: number) => `k = ${v}`,
    color: 'hsl(252,100%,69%)',
  },
  {
    id: 'spatial-cloaking' as PrivacyTechnique,
    name: 'Spatial Cloaking',
    icon: Circle,
    description: 'Random displacement',
    param: 'radius_meters',
    paramLabel: 'Radius (m)',
    min: 50,
    max: 1000,
    default: 200,
    step: 50,
    valueFormat: (v: number) => `${v}m`,
    color: 'hsl(185,100%,50%)',
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
    default: 1.0,
    step: 0.1,
    valueFormat: (v: number) => `ε = ${v.toFixed(1)}`,
    color: 'hsl(280,100%,70%)',
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
  const privacyColor = privacyLevel === 'High' ? 'hsl(152,82%,45%)' : privacyLevel === 'Medium' ? 'hsl(38,95%,55%)' : 'hsl(0,85%,60%)';

  return (
    <div className="rounded-2xl bg-[hsl(225,20%,8%)] border border-[hsl(225,15%,15%)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[hsl(225,15%,12%)] flex items-center gap-2">
        <Lock className="w-4 h-4 text-[hsl(152,82%,45%)]" />
        <span className="text-sm font-semibold text-white">Privacy Protection</span>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Technique Cards */}
        <div className="space-y-2">
          {TECHNIQUES.map((technique) => {
            const isSelected = selectedTechnique === technique.id;
            const Icon = technique.icon;
            
            return (
              <button
                key={technique.id}
                onClick={() => setSelectedTechnique(technique.id)}
                className={`w-full p-3.5 rounded-xl flex items-center gap-3 transition-all text-left border ${
                  isSelected
                    ? 'border-[hsl(252,100%,69%)]/40 bg-[hsl(252,100%,69%)]/5'
                    : 'border-transparent hover:bg-[hsl(225,15%,12%)]'
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{ 
                    background: isSelected ? `${technique.color}20` : 'hsl(225,15%,12%)',
                    color: isSelected ? technique.color : 'hsl(215,15%,45%)'
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-[hsl(215,15%,55%)]'}`}>
                    {technique.name}
                  </div>
                  <div className="text-[11px] text-[hsl(215,15%,40%)]">
                    {technique.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full" style={{ background: technique.color, boxShadow: `0 0 8px ${technique.color}` }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Parameter Slider */}
        <div className="p-4 rounded-xl bg-[hsl(225,15%,6%)] border border-[hsl(225,15%,12%)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-[hsl(215,15%,45%)] uppercase tracking-wider">{currentTechnique.paramLabel}</span>
            <span 
              className="text-sm font-bold number-display px-2 py-0.5 rounded-lg"
              style={{ background: `${currentTechnique.color}20`, color: currentTechnique.color }}
            >
              {currentTechnique.valueFormat(params[currentTechnique.param])}
            </span>
          </div>
          
          <Slider
            value={[params[currentTechnique.param]]}
            min={currentTechnique.min}
            max={currentTechnique.max}
            step={currentTechnique.step}
            onValueChange={([value]) => setParams(prev => ({
              ...prev,
              [currentTechnique.param]: value
            }))}
            className="my-2"
          />
          
          <div className="flex justify-between text-[10px] text-[hsl(215,15%,35%)] mt-2">
            <span>Less Privacy</span>
            <span>More Privacy</span>
          </div>
        </div>

        {/* Privacy Level Indicator */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-[hsl(215,15%,45%)]">Protection Level</span>
          <span 
            className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ background: `${privacyColor}20`, color: privacyColor }}
          >
            {privacyLevel}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isAnonymized && (
            <Button
              variant="outline"
              onClick={onReset}
              className="flex-1 border-[hsl(225,15%,18%)] bg-[hsl(225,15%,12%)] hover:bg-[hsl(225,15%,15%)]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
          <Button
            onClick={() => onApply(selectedTechnique, params)}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-[hsl(252,100%,69%)] to-[hsl(185,100%,50%)] hover:from-[hsl(252,100%,75%)] hover:to-[hsl(185,100%,60%)] text-white border-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            {isAnonymized ? 'Re-Apply' : 'Apply Protection'}
          </Button>
        </div>
      </div>
    </div>
  );
}
