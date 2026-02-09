/**
 * ComparisonChart Component - Premium Design
 */
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
      <div className="bg-[hsl(225,20%,10%)] border border-[hsl(225,15%,18%)] p-3 rounded-xl shadow-xl text-sm">
        <p className="font-semibold text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-[hsl(215,15%,55%)]">{entry.name}:</span>
            <span className="font-bold number-display" style={{ color: entry.color }}>
              {entry.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ComparisonChart({
  originalRisk,
  anonymizedRisk,
  utilityLoss,
  chartType = 'bar',
}: ComparisonChartProps) {
  if (!originalRisk) {
    return (
      <div className="rounded-2xl bg-[hsl(225,20%,8%)] border border-[hsl(225,15%,15%)] p-5">
        <div className="section-title mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Privacy Analysis
        </div>
        <div className="h-36 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-10 h-10 text-[hsl(215,15%,25%)] mx-auto mb-3" />
            <p className="text-sm text-[hsl(215,15%,45%)]">
              Click "Analyze Risk" to see metrics
            </p>
          </div>
        </div>
      </div>
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

  const COLORS = {
    original: 'hsl(0,85%,60%)',
    protected: 'hsl(152,82%,45%)',
  };

  return (
    <div className="rounded-2xl bg-[hsl(225,20%,8%)] border border-[hsl(225,15%,15%)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[hsl(225,15%,12%)] flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-[hsl(252,100%,69%)]" />
        <span className="text-sm font-semibold text-white">Privacy Analysis</span>
      </div>
      
      <div className="p-5">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={barData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,15%,15%)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(215,15%,45%)', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(225,15%,15%)' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: 'hsl(215,15%,45%)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(225,15%,10%)' }} />
                <Bar dataKey="Original" radius={[6, 6, 0, 0]} maxBarSize={30}>
                  {barData.map((_, index) => (
                    <Cell key={`orig-${index}`} fill={COLORS.original} />
                  ))}
                </Bar>
                {anonymizedRisk && (
                  <Bar dataKey="Protected" radius={[6, 6, 0, 0]} maxBarSize={30}>
                    {barData.map((_, index) => (
                      <Cell key={`prot-${index}`} fill={COLORS.protected} />
                    ))}
                  </Bar>
                )}
              </BarChart>
            ) : (
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke="hsl(225,15%,18%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(215,15%,55%)', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(215,15%,45%)', fontSize: 9 }} axisLine={false} />
                <Radar name="Original" dataKey="Original" stroke={COLORS.original} fill={COLORS.original} fillOpacity={0.25} strokeWidth={2} />
                {anonymizedRisk && (
                  <Radar name="Protected" dataKey="Protected" stroke={COLORS.protected} fill={COLORS.protected} fillOpacity={0.25} strokeWidth={2} />
                )}
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[hsl(225,15%,12%)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: COLORS.original }} />
            <span className="text-xs text-[hsl(215,15%,55%)]">Original</span>
          </div>
          {anonymizedRisk && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: COLORS.protected }} />
              <span className="text-xs text-[hsl(215,15%,55%)]">Protected</span>
            </div>
          )}
        </div>

        {/* Utility Loss */}
        {utilityLoss !== undefined && (
          <div className="mt-4 p-4 rounded-xl bg-[hsl(225,15%,6%)] border border-[hsl(225,15%,12%)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[hsl(215,15%,45%)] flex items-center gap-1.5">
                <TrendingDown className="w-3 h-3" />
                Data Utility Loss
              </span>
              <span 
                className="text-sm font-bold number-display"
                style={{ 
                  color: utilityLoss > 50 ? 'hsl(0,85%,60%)' : utilityLoss > 25 ? 'hsl(38,95%,55%)' : 'hsl(152,82%,45%)'
                }}
              >
                {utilityLoss.toFixed(1)}%
              </span>
            </div>
            <Progress value={utilityLoss} className="h-1.5" />
          </div>
        )}
      </div>
    </div>
  );
}
