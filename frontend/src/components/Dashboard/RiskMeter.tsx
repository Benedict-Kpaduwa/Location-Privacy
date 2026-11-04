import { getRiskColor } from '../../types';

interface RiskMeterProps {
  risk: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskMeter({ risk, label, size = 'md' }: RiskMeterProps) {
  const color = getRiskColor(risk);

  const sizes = {
    sm: { outer: 104, stroke: 10, text: 'text-[26px]' },
    md: { outer: 140, stroke: 12, text: 'text-[34px]' },
    lg: { outer: 180, stroke: 14, text: 'text-[44px]' },
  };

  const s = sizes[size];
  const radius = (s.outer - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.min(100, Math.max(0, risk)) / 100) * circumference;

  return (
    <div
      className="flex flex-col items-center"
      role="img"
      aria-label={`${label ?? 'Risk'}: ${risk.toFixed(0)} percent`}
    >
      <div className="relative" style={{ width: s.outer, height: s.outer }}>
        <svg className="-rotate-90" width={s.outer} height={s.outer} aria-hidden>
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={radius}
            fill="none"
            stroke="var(--line)"
            strokeWidth={s.stroke}
          />
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`num leading-none ${s.text}`} style={{ color }}>
            {risk.toFixed(0)}
          </span>
          <span className="eyebrow mt-1">Risk %</span>
        </div>
      </div>

      {label && <div className="mt-2 text-[15px] font-bold">{label}</div>}
    </div>
  );
}
