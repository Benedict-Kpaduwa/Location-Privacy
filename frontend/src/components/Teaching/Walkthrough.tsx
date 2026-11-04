import { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles, CheckCircle, MapPin, Shield, Activity, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalkthroughProps {
  onClose: () => void;
  onStep?: (step: number) => void;
}

const WALKTHROUGH_STEPS = [
  {
    top: 'Welcome.',
    title: 'Meet the Privacy Lab',
    content: 'Discover how location data can reveal your identity, and learn how privacy techniques protect you.',
    icon: Sparkles,
  },
  {
    top: 'Step one.',
    title: 'Generate location data',
    content: 'Create synthetic user trajectories with realistic movement patterns. Tap “Generate dataset” to begin.',
    icon: Database,
  },
  {
    top: 'Step two.',
    title: 'Follow a trajectory',
    content: 'Select a user to see their movements. Notice how patterns reveal daily routines: home, work, leisure.',
    icon: MapPin,
  },
  {
    top: 'Step three.',
    title: 'Check the risk',
    content: 'Each user has a risk score from 0 to 100%. Tap “Analyze risk” to see how easily they could be identified.',
    icon: Activity,
  },
  {
    top: 'Step four.',
    title: 'Add protection',
    content: 'Choose a technique (k-anonymity, spatial cloaking or differential privacy) and see how much the risk drops.',
    icon: Shield,
  },
  {
    top: 'Remember.',
    title: 'Key takeaways',
    content: '• Just 4 location points can identify 95% of people\n• Home and work are inferred from patterns\n• Privacy techniques reduce risk but cost some data utility',
    icon: CheckCircle,
  },
];

export function Walkthrough({ onClose, onStep }: WalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = WALKTHROUGH_STEPS[currentStep];
  const isLastStep = currentStep === WALKTHROUGH_STEPS.length - 1;
  const Icon = step.icon;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const goTo = (next: number) => {
    setCurrentStep(next);
    onStep?.(next);
  };

  const handleNext = () => (isLastStep ? onClose() : goTo(currentStep + 1));
  const handlePrev = () => currentStep > 0 && goTo(currentStep - 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Guided tour">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="animate-sheet relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-y-auto rounded-t-[28px] bg-page px-6 pb-safe pt-3 shadow-[0_10px_34px_rgba(0,0,0,0.18)] sm:rounded-[28px] sm:pb-6">
        <div className="mx-auto mb-3 h-[5px] w-10 rounded-full bg-mute/40 sm:hidden" aria-hidden />

        <button
          onClick={onClose}
          aria-label="Close tour"
          className="pressable absolute right-3 top-3 grid size-11 place-items-center rounded-full"
        >
          <span className="grid size-9 place-items-center rounded-full bg-field text-mute">
            <X className="size-4" aria-hidden />
          </span>
        </button>

        <div className="eyebrow mb-4 mt-1">
          Step {currentStep + 1} of {WALKTHROUGH_STEPS.length}
        </div>

        <span className="mb-5 grid size-14 place-items-center rounded-full bg-brand/12 text-accent-text">
          <Icon className="size-7" aria-hidden />
        </span>

        <h3 className="hero !text-[clamp(1.7rem,7vw,2rem)]" key={currentStep}>
          <span>{step.top}</span>
          <span>{step.title}</span>
        </h3>

        <p className="mb-7 mt-4 whitespace-pre-line text-[17px] leading-relaxed text-mute">
          {step.content}
        </p>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft aria-hidden />
            Back
          </Button>

          <Button size="lg" onClick={handleNext} className="flex-1">
            {isLastStep ? 'Get started' : 'Continue'}
            {!isLastStep && <ChevronRight aria-hidden />}
          </Button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-1">
          {WALKTHROUGH_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === currentStep}
              className="grid h-6 w-6 place-items-center"
            >
              <span
                className={`h-2 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-brand' : 'w-2 bg-line'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
