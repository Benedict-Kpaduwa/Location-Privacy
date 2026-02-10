
import { useState } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles, CheckCircle, MapPin, Shield, Activity, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface WalkthroughProps {
  onClose: () => void;
  onStep?: (step: number) => void;
}

const WALKTHROUGH_STEPS = [
  {
    title: 'Welcome to Location Privacy Lab',
    content: 'Discover how location data can reveal your identity, and learn how privacy techniques protect you.',
    icon: Sparkles,
    color: 'hsl(252,100%,69%)',
  },
  {
    title: 'Generate Location Data',
    content: 'Create synthetic user trajectories with realistic movement patterns. Click "Generate Dataset" to begin.',
    icon: Database,
    color: 'hsl(185,100%,50%)',
  },
  {
    title: 'Explore User Trajectories',
    content: 'Select a user to see their movements. Notice how patterns reveal daily routines - home, work, leisure.',
    icon: MapPin,
    color: 'hsl(38,95%,55%)',
  },
  {
    title: 'Analyze Re-identification Risk',
    content: 'Each user has a risk score (0-100%). Click "Analyze Risk" to see how easily they could be identified.',
    icon: Activity,
    color: 'hsl(0,85%,60%)',
  },
  {
    title: 'Apply Privacy Protection',
    content: 'Choose a technique (k-anonymity, spatial cloaking, differential privacy) and see the risk reduction.',
    icon: Shield,
    color: 'hsl(152,82%,45%)',
  },
  {
    title: 'Key Takeaways',
    content: '• Just 4 location points can identify 95% of people\n• Home/work locations are inferred from patterns\n• Privacy techniques reduce risk but affect data utility',
    icon: CheckCircle,
    color: 'hsl(152,82%,45%)',
  },
];

export function Walkthrough({ onClose, onStep }: WalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = WALKTHROUGH_STEPS[currentStep];
  const isLastStep = currentStep === WALKTHROUGH_STEPS.length - 1;
  const Icon = step.icon;
  const progressPercent = ((currentStep + 1) / WALKTHROUGH_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStep?.(nextStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStep?.(prevStep);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-6 pointer-events-none">

      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      

      <div className="relative w-full max-w-md pointer-events-auto animate-slide-up">
        <div className="rounded-2xl bg-[hsl(225,20%,8%)] border border-[hsl(225,15%,18%)] shadow-2xl overflow-hidden">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(215,15%,45%)] hover:text-white hover:bg-[hsl(225,15%,15%)] transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>


          <div className="p-5 pb-0">
            <div className="flex items-center justify-between text-[10px] text-[hsl(215,15%,45%)] uppercase tracking-widest mb-2">
              <span>Step {currentStep + 1} of {WALKTHROUGH_STEPS.length}</span>
            </div>
            <Progress value={progressPercent} className="h-1" />
          </div>


          <div className="p-6">

            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ 
                background: `${step.color}15`,
                boxShadow: `0 0 30px ${step.color}20`
              }}
            >
              <Icon className="w-7 h-7" style={{ color: step.color }} />
            </div>

            <h3 className="text-xl font-bold text-white mb-3 font-display">
              {step.title}
            </h3>

            <p className="text-[hsl(215,15%,55%)] text-sm whitespace-pre-line leading-relaxed mb-8">
              {step.content}
            </p>


            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex-1 border-[hsl(225,15%,18%)] bg-[hsl(225,15%,12%)] hover:bg-[hsl(225,15%,15%)] disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <Button 
                onClick={handleNext} 
                className="flex-1 bg-gradient-to-r from-[hsl(252,100%,69%)] to-[hsl(185,100%,50%)] hover:from-[hsl(252,100%,75%)] hover:to-[hsl(185,100%,60%)] text-white border-0"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>


          <div className="pb-5 flex items-center justify-center gap-1.5">
            {WALKTHROUGH_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentStep(i); onStep?.(i); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep 
                    ? 'bg-[hsl(252,100%,69%)] w-6' 
                    : i < currentStep 
                    ? 'bg-[hsl(152,82%,45%)]' 
                    : 'bg-[hsl(225,15%,20%)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
