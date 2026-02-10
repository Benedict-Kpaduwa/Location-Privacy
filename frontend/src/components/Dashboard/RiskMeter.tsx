
import { getRiskLevel } from '../../types';

interface RiskMeterProps {
  risk: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskMeter({ risk, label, size = 'md' }: RiskMeterProps) {
  const level = getRiskLevel(risk);
  
  const colors = {
    low: { main: 'hsl(152,82%,45%)', glow: 'rgba(16,185,129,0.4)' },
    medium: { main: 'hsl(38,95%,55%)', glow: 'rgba(245,158,11,0.4)' },
    high: { main: 'hsl(0,85%,60%)', glow: 'rgba(239,68,68,0.4)' },
  };

  const color = colors[level];
  
  const sizes = {
    sm: { outer: 100, stroke: 8, text: 'text-xl', label: 'text-xs' },
    md: { outer: 140, stroke: 10, text: 'text-3xl', label: 'text-sm' },
    lg: { outer: 180, stroke: 12, text: 'text-4xl', label: 'text-base' },
  };

  const s = sizes[size];
  const radius = (s.outer - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (risk / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: s.outer, height: s.outer }}>
        <svg className="relative -rotate-90" width={s.outer} height={s.outer}>

          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={radius}
            fill="none"
            stroke="hsl(225,15%,15%)"
            strokeWidth={s.stroke}
          />

          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={radius}
            fill="none"
            stroke={color.main}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ 
              transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: `drop-shadow(0 0 6px ${color.glow})`
            }}
          />
        </svg>


        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className={`font-bold number-display ${s.text}`}
            style={{ color: color.main, textShadow: `0 0 20px ${color.glow}` }}
          >
            {risk.toFixed(0)}
          </span>
          <span className="text-[9px] text-[hsl(215,15%,45%)] uppercase tracking-widest mt-0.5">
            Risk %
          </span>
        </div>
      </div>
      
      {label && (
        <div className={`mt-3 ${s.label} text-[hsl(215,15%,55%)] font-medium`}>
          {label}
        </div>
      )}
    </div>
  );
}
