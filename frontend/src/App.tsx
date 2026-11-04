import { useState, useCallback, type ComponentType, type ReactNode } from 'react';
import {
  Database,
  AlertTriangle,
  Loader2,
  MapPin,
  Layers,
  HelpCircle,
  Shield,
  Users,
  Zap,
  ChevronRight,
  Target,
  Lock,
  Home,
  Building,
  SlidersHorizontal,
  BarChart3,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, tint } from '@/lib/utils';

import { MapView } from './components/Map/MapView';
import { TimelineSlider } from './components/Map/TimelineSlider';
import { UserSelector } from './components/Sidebar/UserSelector';
import { PrivacyControls } from './components/Sidebar/PrivacyControls';
import { RiskMeter } from './components/Dashboard/RiskMeter';
import { ComparisonChart } from './components/Dashboard/ComparisonChart';
import { Walkthrough } from './components/Teaching/Walkthrough';
import { useColorScheme } from './hooks/useColorScheme';

import * as api from './services/api';
import { getRiskColor } from './types';
import type {
  Dataset,
  RiskScore,
  PrivacyTechnique,
  AnonymizedDataset,
  LocationPoint
} from './types';

type View = 'explore' | 'map' | 'results';

/** True when the viewport is narrower than `px` (Tailwind breakpoints: lg 1024, xl 1280). */
const isBelow = (px: number) => window.matchMedia(`(max-width: ${px - 1}px)`).matches;

type Icon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

function Chip({
  on,
  onClick,
  icon: IconComponent,
  children,
}: {
  on: boolean;
  onClick: () => void;
  icon: Icon;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'pressable inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-bold sm:h-10',
        on ? 'bg-brand text-white' : 'bg-field text-mute'
      )}
    >
      <IconComponent className="size-4" aria-hidden />
      {children}
    </button>
  );
}

function StatPill({
  icon: IconComponent,
  value,
  label,
  color,
}: {
  icon: Icon;
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div
      className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-field px-4 sm:h-10"
      style={color ? { background: tint(color, 12) } : undefined}
    >
      <IconComponent className="size-4 text-mute" aria-hidden />
      <span className="num text-[15px]" style={color ? { color } : undefined}>{value}</span>
      <span className="text-[13px] text-mute">{label}</span>
    </div>
  );
}

function App() {
  const scheme = useColorScheme();
  const [view, setView] = useState<View>('map');
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [riskScores, setRiskScores] = useState<Record<string, RiskScore>>({});
  const [anonymizedResult, setAnonymizedResult] = useState<AnonymizedDataset | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [timeFilter, setTimeFilter] = useState<{ start: number; end: number } | undefined>();
  const [showAnonymized, setShowAnonymized] = useState(false);
  const chartType = 'bar' as const;
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCalculatingRisk, setIsCalculatingRisk] = useState(false);
  const [isAnonymizing, setIsAnonymizing] = useState(false);

  const handleGenerateDataset = useCallback(async (refresh = false) => {
    setIsGenerating(true);
    try {
      const data = await api.generateDataset(undefined, refresh);
      setDataset(data);
      setRiskScores({});
      setAnonymizedResult(null);
      setSelectedUserId(null);
      setShowAnonymized(false);
      // On small screens, pick a user next.
      if (isBelow(1024)) setView('explore');
    } catch (error) {
      console.error('Failed to generate dataset:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleCalculateRisk = useCallback(async () => {
    if (!dataset) return;
    setIsCalculatingRisk(true);
    try {
      const risks = await api.calculateRisk(dataset);
      setRiskScores(risks);
      if (isBelow(1280)) setView('results');
    } catch (error) {
      console.error('Failed to calculate risk:', error);
    } finally {
      setIsCalculatingRisk(false);
    }
  }, [dataset]);

  const handleApplyPrivacy = useCallback(async (
    technique: PrivacyTechnique,
    params: Record<string, number>
  ) => {
    if (!dataset) return;
    setIsAnonymizing(true);
    try {
      let result: AnonymizedDataset;
      switch (technique) {
        case 'k-anonymity':
          result = await api.applyKAnonymity(dataset, params.k);
          break;
        case 'spatial-cloaking':
          result = await api.applySpatialCloaking(dataset, params.radius_meters);
          break;
        case 'differential-privacy':
          result = await api.applyDifferentialPrivacy(dataset, params.epsilon);
          break;
      }
      setAnonymizedResult(result);
      setShowAnonymized(true);
    } catch (error) {
      console.error('Failed to apply privacy technique:', error);
    } finally {
      setIsAnonymizing(false);
    }
  }, [dataset]);

  const handleReset = useCallback(() => {
    setAnonymizedResult(null);
    setShowAnonymized(false);
  }, []);

  const handleSelectUser = useCallback((userId: string | null) => {
    setSelectedUserId(userId);
    if (userId && isBelow(1024)) setView('map');
  }, []);

  const getDisplayLocations = useCallback((): LocationPoint[] => {
    if (!selectedUserId || !dataset) return [];
    const sourceDataset = showAnonymized && anonymizedResult ? anonymizedResult.dataset : dataset;
    const user = sourceDataset.users.find(u => u.user_id === selectedUserId);
    return user?.locations || [];
  }, [selectedUserId, dataset, anonymizedResult, showAnonymized]);

  const hasRisk = Object.keys(riskScores).length > 0;
  const avgOriginalRisk = hasRisk
    ? Object.values(riskScores).reduce((sum, r) => sum + r.overall_risk, 0) / Object.values(riskScores).length
    : 0;
  const avgAnonymizedRisk = anonymizedResult?.new_risk_score.overall_risk || 0;
  const riskReduction = avgOriginalRisk > 0 ? ((avgOriginalRisk - avgAnonymizedRisk) / avgOriginalRisk * 100) : 0;
  const totalPoints = dataset ? dataset.users.reduce((sum, u) => sum + u.locations.length, 0) : 0;

  const tabs: { id: View; label: string; icon: Icon; disabled?: boolean; hideFromLg?: boolean }[] = [
    { id: 'explore', label: 'Explore', icon: SlidersHorizontal, hideFromLg: true },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'results', label: 'Results', icon: BarChart3, disabled: !hasRisk },
  ];

  const emptyExplore = (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-brand/12 text-accent-text">
        <Database className="size-8" aria-hidden />
      </span>
      <p className="max-w-[16rem] text-[17px] text-mute">
        Generate synthetic location data to explore privacy risks.
      </p>
      <Button size="lg" onClick={() => handleGenerateDataset(true)} disabled={isGenerating} className="w-full max-w-[16rem]">
        {isGenerating ? <Loader2 className="animate-spin" aria-hidden /> : <Zap aria-hidden />}
        Quick start
      </Button>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-page text-ink">
        {/* ---------- Header ---------- */}
        <header className="shrink-0 border-b border-line px-safe pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-white sm:size-11">
                <MapPin className="size-5 sm:size-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-[18px] font-extrabold leading-tight tracking-tight sm:text-[20px]">
                  Location Privacy Lab
                </h1>
                <p className="hidden truncate text-[13px] text-mute sm:block">
                  Interactive re-identification risk analysis
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                onClick={() => handleGenerateDataset(true)}
                disabled={isGenerating}
                aria-label={dataset ? 'Refresh data' : 'Generate dataset'}
                className="max-sm:size-11 max-sm:rounded-full max-sm:px-0"
              >
                {isGenerating ? <Loader2 className="animate-spin" aria-hidden /> : <Database aria-hidden />}
                <span className="hidden sm:inline">{dataset ? 'Refresh data' : 'Generate dataset'}</span>
              </Button>

              {dataset && (
                <Button
                  variant="outline"
                  onClick={handleCalculateRisk}
                  disabled={isCalculatingRisk}
                  aria-label="Analyze risk"
                  className="max-sm:size-11 max-sm:rounded-full max-sm:px-0"
                >
                  {isCalculatingRisk ? <Loader2 className="animate-spin" aria-hidden /> : <Target aria-hidden />}
                  <span className="hidden sm:inline">Analyze risk</span>
                </Button>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setShowWalkthrough(true)}
                    aria-label="Take a guided tour"
                  >
                    <HelpCircle aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Take a guided tour</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {dataset && (
            <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
              <Chip on={showHeatmap} onClick={() => setShowHeatmap(v => !v)} icon={Layers}>
                Heat map
              </Chip>
              {anonymizedResult && (
                <Chip on={showAnonymized} onClick={() => setShowAnonymized(v => !v)} icon={Lock}>
                  Protected view
                </Chip>
              )}

              <div className="ml-auto flex items-center gap-2 pl-2">
                <StatPill icon={Users} value={dataset.users.length} label="users" />
                <StatPill icon={MapPin} value={totalPoints.toLocaleString()} label="points" />
                {hasRisk && (
                  <StatPill
                    icon={AlertTriangle}
                    value={`${avgOriginalRisk.toFixed(0)}%`}
                    label="avg risk"
                    color={getRiskColor(avgOriginalRisk)}
                  />
                )}
              </div>
            </div>
          )}
        </header>

        {/* ---------- Panels ---------- */}
        <main className="flex min-h-0 flex-1">
          {/* Explore */}
          <aside
            className={cn(
              'min-h-0 w-full flex-col overflow-y-auto overscroll-contain px-safe py-4 lg:flex lg:w-80 lg:shrink-0 lg:border-r lg:border-line lg:px-4',
              view === 'explore' ? 'flex' : 'hidden'
            )}
          >
            <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 lg:max-w-none">
              {dataset ? (
                <>
                  <UserSelector
                    users={dataset.users}
                    selectedUserId={selectedUserId}
                    riskScores={riskScores}
                    onSelectUser={handleSelectUser}
                  />
                  <PrivacyControls
                    onApply={handleApplyPrivacy}
                    onReset={handleReset}
                    isLoading={isAnonymizing}
                    isAnonymized={!!anonymizedResult}
                  />
                  {selectedUserId && (
                    <TimelineSlider
                      locations={getDisplayLocations()}
                      onChange={setTimeFilter}
                    />
                  )}
                </>
              ) : (
                emptyExplore
              )}
            </div>
          </aside>

          {/* Map / welcome */}
          <div
            className={cn(
              'relative min-w-0 flex-1',
              view === 'explore' ? 'hidden lg:block' : view === 'results' ? 'hidden xl:block' : 'block'
            )}
          >
            {dataset ? (
              <MapView
                key={scheme}
                dark={scheme === 'dark'}
                users={showAnonymized && anonymizedResult ? anonymizedResult.dataset.users : dataset.users}
                selectedUserId={selectedUserId}
                riskScores={riskScores}
                showHeatmap={showHeatmap}
                timeFilter={timeFilter}
                showOriginal={!showAnonymized}
                showAnonymized={showAnonymized}
              />
            ) : (
              <div className="flex h-full overflow-y-auto">
                <div className="m-auto w-full max-w-2xl px-safe py-10 sm:px-8">
                  <h2 className="hero">
                    <span>Your location says</span>
                    <span>more than you think.</span>
                  </h2>
                  <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-mute sm:text-[18px]">
                    See how just a few GPS points can point to you, then try the techniques that hide you.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                      size="lg"
                      onClick={() => handleGenerateDataset(true)}
                      disabled={isGenerating}
                      className="w-full sm:w-auto"
                    >
                      {isGenerating && <Loader2 className="animate-spin" aria-hidden />}
                      Start exploring
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setShowWalkthrough(true)}
                      className="w-full sm:w-auto"
                    >
                      Take a tour
                      <ChevronRight aria-hidden />
                    </Button>
                  </div>

                  <ul className="mt-10 grid gap-3 sm:grid-cols-3">
                    {[
                      { icon: MapPin, title: 'Trace', text: 'Follow a trajectory on the map.' },
                      { icon: AlertTriangle, title: 'Analyze', text: 'See how identifiable it is.' },
                      { icon: Shield, title: 'Protect', text: 'Apply a privacy technique.' },
                    ].map(item => (
                      <li key={item.title} className="flex gap-3 rounded-[20px] bg-field p-4 sm:flex-col">
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand/12 text-accent-text">
                          <item.icon className="size-5" aria-hidden />
                        </span>
                        <div>
                          <div className="text-[17px] font-extrabold tracking-tight">{item.title}</div>
                          <div className="text-[15px] text-mute">{item.text}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {dataset && (
            <aside
              className={cn(
                'min-h-0 w-full flex-col overflow-y-auto overscroll-contain px-safe py-4 xl:w-[380px] xl:shrink-0 xl:border-l xl:border-line xl:px-4 2xl:w-[420px]',
                view === 'results' ? 'flex' : 'hidden',
                hasRisk ? 'xl:flex' : 'xl:hidden'
              )}
            >
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 xl:max-w-none">
                <section className="rounded-[20px] bg-field p-4 sm:p-5">
                  <header className="mb-4 flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
                    <Shield className="size-5 text-mute" aria-hidden />
                    Risk overview
                  </header>
                  <div className="flex justify-around rounded-[16px] bg-page py-5">
                    <RiskMeter risk={avgOriginalRisk} label="Original" size="sm" />
                    {anonymizedResult && (
                      <RiskMeter risk={avgAnonymizedRisk} label="Protected" size="sm" />
                    )}
                  </div>

                  {anonymizedResult && riskReduction > 0 && (
                    <div className="mt-3 rounded-[16px] bg-page p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[14px] text-mute">Risk reduction</span>
                        <span className="num text-[22px] text-risk-low">
                          -{riskReduction.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={riskReduction} className="h-2" />
                    </div>
                  )}
                </section>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: dataset.users.length, label: 'Users', icon: Users },
                    { value: `${(totalPoints / 1000).toFixed(1)}k`, label: 'Locations', icon: MapPin },
                    { value: Object.values(riskScores).filter(r => r.home_inferred).length, label: 'Homes found', icon: Home },
                    { value: Object.values(riskScores).filter(r => r.work_inferred).length, label: 'Works found', icon: Building },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-[20px] bg-field p-4">
                      <stat.icon className="mb-2 size-5 text-mute" aria-hidden />
                      <div className="num text-[28px] leading-none">{stat.value}</div>
                      <div className="eyebrow mt-1.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <ComparisonChart
                  originalRisk={Object.values(riskScores)[0]}
                  anonymizedRisk={anonymizedResult?.new_risk_score}
                  utilityLoss={anonymizedResult?.utility_loss}
                  chartType={chartType}
                />

                {anonymizedResult && (
                  <section className="animate-fade-in rounded-[20px] bg-field p-4 sm:p-5">
                    <header className="mb-3 flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
                      <Zap className="size-5 text-mute" aria-hidden />
                      Applied protection
                    </header>
                    <dl className="space-y-3 rounded-[16px] bg-page p-4">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-[14px] text-mute">Technique</dt>
                        <dd>
                          <Badge className="capitalize">{anonymizedResult.technique.replace(/-/g, ' ')}</Badge>
                        </dd>
                      </div>
                      {Object.entries(anonymizedResult.parameters).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between gap-3">
                          <dt className="text-[14px] capitalize text-mute">{key.replace(/_/g, ' ')}</dt>
                          <dd className="num text-[15px]">{value}</dd>
                        </div>
                      ))}
                      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                        <dt className="text-[14px] text-mute">Utility loss</dt>
                        <dd className="num text-[15px] text-risk-mid">
                          {anonymizedResult.utility_loss.toFixed(1)}%
                        </dd>
                      </div>
                    </dl>
                  </section>
                )}
              </div>
            </aside>
          )}
        </main>

        {/* ---------- Tab bar (below xl) ---------- */}
        <nav
          aria-label="Sections"
          className="px-safe shrink-0 border-t border-line bg-page pt-2 pb-safe xl:hidden"
        >
          <div className="mx-auto flex max-w-xl gap-2">
            {tabs.map(tab => {
              const active = view === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  disabled={tab.disabled}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'pressable flex h-12 flex-1 items-center justify-center gap-2 rounded-[16px] text-[15px] font-bold disabled:opacity-35',
                    active ? 'bg-brand text-white' : 'bg-field text-mute',
                    // From lg up the Explore panel is always visible, so Map is the active tab.
                    tab.id === 'map' && view === 'explore' && 'lg:bg-brand lg:text-white',
                    tab.hideFromLg && 'lg:hidden'
                  )}
                >
                  <tab.icon className="size-5" aria-hidden />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {showWalkthrough && <Walkthrough onClose={() => setShowWalkthrough(false)} />}
      </div>
    </TooltipProvider>
  );
}

export default App;
