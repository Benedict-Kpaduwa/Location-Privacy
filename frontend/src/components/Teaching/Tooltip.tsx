
import { useState } from 'react';
import { Info, X, Lightbulb, BookOpen } from 'lucide-react';

interface TooltipProps {
  concept: string;
  children: React.ReactNode;
}

const CONCEPT_EXPLANATIONS: Record<string, {
  title: string;
  explanation: string;
  example?: string;
  realWorld?: string;
}> = {
  'k-anonymity': {
    title: 'K-Anonymity',
    explanation: 'K-anonymity ensures that each record in a dataset is indistinguishable from at least k-1 other records. For location data, this means generalizing coordinates so that multiple users share the same location region.',
    example: 'With k=5, if you\'re at "123 Main St", the system might report you\'re in "Main St Block" along with 4+ other users, making it impossible to know which specific user you are.',
    realWorld: 'This is similar to saying you live in "downtown" instead of giving your exact address.',
  },
  'spatial-cloaking': {
    title: 'Spatial Cloaking',
    explanation: 'Spatial cloaking replaces your exact GPS coordinates with a larger geographic region (cloaking zone). The system reports you\'re somewhere within that zone rather than your precise location.',
    example: 'With a 500m radius, your exact position (51.0447, -114.0719) becomes "somewhere within this 500m circle".',
    realWorld: 'Like telling someone you\'re "near the coffee shop" instead of "at table 3 by the window".',
  },
  'differential-privacy': {
    title: 'Differential Privacy',
    explanation: 'Differential privacy adds carefully calibrated random noise to data. The epsilon (ε) parameter controls the privacy-utility tradeoff: smaller ε means more noise/privacy but less accuracy.',
    example: 'With ε=1.0, your coordinates might be shifted by ~110 meters randomly. With ε=0.1, they might shift by ~1km.',
    realWorld: 'Used by Apple and Google to collect usage statistics while preserving individual privacy.',
  },
  'reidentification': {
    title: 'Re-identification Risk',
    explanation: 'Even with names removed, location patterns can uniquely identify you. Research shows that just 4 location points are enough to uniquely identify 95% of people.',
    example: 'If you\'re the only person who goes from Location A at 8am to Location B at 9am, you can be identified from this pattern alone.',
    realWorld: 'In 2006, AOL released "anonymized" search data. Researchers identified individuals by their search patterns within days.',
  },
  'uniqueness': {
    title: 'Uniqueness Score',
    explanation: 'Measures how distinctive your location trajectory is compared to others in the dataset. Higher uniqueness means you\'re easier to identify.',
    example: 'Someone who works from home has a less unique pattern than someone who visits 5 different locations daily.',
  },
  'home-inference': {
    title: 'Home Location Inference',
    explanation: 'Algorithms can infer where you live by analyzing where you spend nights and early mornings. This is one of the most sensitive pieces of information that can be derived from location data.',
    example: 'If you\'re consistently at the same location between 10pm-7am, that\'s almost certainly where you live.',
  },
};

export function EducationalTooltip({ concept, children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const info = CONCEPT_EXPLANATIONS[concept];

  if (!info) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block">
      <div 
        className="inline-flex items-center gap-1 cursor-help"
        onClick={() => setIsOpen(true)}
      >
        {children}
        <Info className="w-4 h-4 text-[var(--accent)] opacity-60 hover:opacity-100 transition-opacity" />
      </div>
      
      {isOpen && (
        <>

          <div 
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          

          <div className="absolute z-50 w-80 left-0 top-full mt-2 animate-fade-in">
            <div className="glass-card p-4 shadow-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[var(--accent)]" />
                  <h4 className="font-semibold text-[var(--text-primary)]">{info.title}</h4>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                {info.explanation}
              </p>
              
              {info.example && (
                <div className="bg-[var(--surface-dark)] rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-1 text-xs text-[var(--accent)] mb-1">
                    <Lightbulb className="w-3 h-3" />
                    Example
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{info.example}</p>
                </div>
              )}
              
              {info.realWorld && (
                <div className="text-xs text-[var(--text-muted)] italic">
                  💡 Real world: {info.realWorld}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
