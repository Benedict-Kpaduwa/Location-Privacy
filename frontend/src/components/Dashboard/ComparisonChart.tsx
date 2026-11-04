
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from 'recharts';
import { BarChart3, Activity, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { RiskScore } from '../../types';

interface ComparisonChartProps {
  originalRisk?: RiskScore;
  anonymizedRisk?: RiskScore;
  utilityLoss?: number;
  chartType?: 'bar' | 'radar';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-[16px] bg-page p-3 text-sm shadow-[0_10px_34px_rgba(0,0,0,0.18)]">
        <p className="mb-2 font-extrabold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="size-2.5 rounded-full" style={{ background: entry.color || entry.payload?.fill }} />
            <span className="text-mute">{entry.name}:</span>
            <span className="num">{entry.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = {
  original: 'var(--brand)',
  protected: 'var(--risk-low)',
};

export function ComparisonChart({
  originalRisk,
  anonymizedRisk,
  utilityLoss,
  chartType = 'bar',
}: ComparisonChartProps) {
  if (!originalRisk) {
    return (
      <section className="rounded-[20px] bg-field p-5">
        <header className="mb-4 flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
          <BarChart3 className="size-5 text-mute" aria-hidden />
          Privacy analysis
        </header>
        <div className="flex h-36 flex-col items-center justify-center gap-2 text-center">
          <Activity className="size-9 text-mute/50" aria-hidden />
          <p className="text-[15px] text-mute">Tap “Analyze risk” to see metrics.</p>
        </div>
      </section>
    );
  }

  const barData = [
    { name: 'Overall', Original: originalRisk.overall_risk, Protected: anonymizedRisk?.overall_risk || 0 },
    { name: 'Unique', Original: originalRisk.uniqueness_score, Protected: anonymizedRisk?.uniqueness_score || originalRisk.uniqueness_score },
    { name: 'Re-ID', Original: originalRisk.reidentification_probability, Protected: anonymizedRisk?.reidentification_probability || originalRisk.reidentification_probability },
  ];

  const radarData = [
    { metric: 'Overall', Original: originalRisk.overall_risk, Protected: anonymizedRisk?.overall_risk || 0 },
    { metric: 'Unique', Original: originalRisk.uniqueness_score, Protected: anonymizedRisk?.uniqueness_score || originalRisk.uniqueness_score },
    { metric: 'Re-ID', Original: originalRisk.reidentification_probability, Protected: anonymizedRisk?.reidentification_probability || originalRisk.reidentification_probability },
    { metric: 'Home', Original: originalRisk.home_inferred ? 100 : 20, Protected: anonymizedRisk?.home_inferred ? 100 : 20 },
    { metric: 'Work', Original: originalRisk.work_inferred ? 100 : 20, Protected: anonymizedRisk?.work_inferred ? 100 : 20 },
  ];

  const utilityColor =
    utilityLoss === undefined
      ? 'var(--risk-low)'
      : utilityLoss > 50 ? 'var(--risk-high)' : utilityLoss > 25 ? 'var(--risk-mid)' : 'var(--risk-low)';

  return (
    <section className="rounded-[20px] bg-field p-4 sm:p-5">
      <header className="mb-4 flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
        <BarChart3 className="size-5 text-mute" aria-hidden />
        Privacy analysis
      </header>

      <div className="rounded-[16px] bg-page p-3 sm:p-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={barData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--muted)', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: 'var(--line)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--field)' }} />
                <Bar dataKey="Original" radius={[8, 8, 0, 0]} maxBarSize={34}>
                  {barData.map((_, index) => (
                    <Cell key={`orig-${index}`} fill={COLORS.original} />
                  ))}
                </Bar>
                {anonymizedRisk && (
                  <Bar dataKey="Protected" radius={[8, 8, 0, 0]} maxBarSize={34}>
                    {barData.map((_, index) => (
                      <Cell key={`prot-${index}`} fill={COLORS.protected} />
                    ))}
                  </Bar>
                )}
              </BarChart>
            ) : (
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke="var(--line)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} />
                <Radar name="Original" dataKey="Original" stroke={COLORS.original} fill={COLORS.original} fillOpacity={0.2} strokeWidth={2} />
                {anonymizedRisk && (
                  <Radar name="Protected" dataKey="Protected" stroke={COLORS.protected} fill={COLORS.protected} fillOpacity={0.2} strokeWidth={2} />
                )}
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-center justify-center gap-5 border-t border-line pt-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold">
            <span className="size-3 rounded-full" style={{ background: COLORS.original }} />
            Original
          </div>
          {anonymizedRisk && (
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="size-3 rounded-full" style={{ background: COLORS.protected }} />
              Protected
            </div>
          )}
        </div>
      </div>

      {utilityLoss !== undefined && (
        <div className="mt-3 rounded-[16px] bg-page p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[14px] text-mute">
              <TrendingDown className="size-4" aria-hidden />
              Data utility loss
            </span>
            <span className="num text-[16px]" style={{ color: utilityColor }}>
              {utilityLoss.toFixed(1)}%
            </span>
          </div>
          <Progress value={utilityLoss} className="h-2" />
        </div>
      )}
    </section>
  );
}
