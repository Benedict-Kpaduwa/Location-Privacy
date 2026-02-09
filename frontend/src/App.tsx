/**
 * Main App Component
 * Location Privacy Teaching System - Premium Design
 */
import { useState, useCallback } from 'react';
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
  Sparkles,
  Target,
  Lock,
  Home,
  Building
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { MapView } from './components/Map/MapView';
import { TimelineSlider } from './components/Map/TimelineSlider';
import { UserSelector } from './components/Sidebar/UserSelector';
import { PrivacyControls } from './components/Sidebar/PrivacyControls';
import { RiskMeter } from './components/Dashboard/RiskMeter';
import { ComparisonChart } from './components/Dashboard/ComparisonChart';
import { Walkthrough } from './components/Teaching/Walkthrough';

import * as api from './services/api';
import type { 
  Dataset, 
  RiskScore, 
  PrivacyTechnique, 
  AnonymizedDataset,
  LocationPoint 
} from './types';

function App() {
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

  const getDisplayLocations = useCallback((): LocationPoint[] => {
    if (!selectedUserId || !dataset) return [];
    const sourceDataset = showAnonymized && anonymizedResult ? anonymizedResult.dataset : dataset;
    const user = sourceDataset.users.find(u => u.user_id === selectedUserId);
    return user?.locations || [];
  }, [selectedUserId, dataset, anonymizedResult, showAnonymized]);

  const avgOriginalRisk = Object.values(riskScores).length > 0
    ? Object.values(riskScores).reduce((sum, r) => sum + r.overall_risk, 0) / Object.values(riskScores).length
    : 0;
  const avgAnonymizedRisk = anonymizedResult?.new_risk_score.overall_risk || 0;
  const riskReduction = avgOriginalRisk > 0 ? ((avgOriginalRisk - avgAnonymizedRisk) / avgOriginalRisk * 100) : 0;

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-[hsl(225,25%,5%)]">
        {/* ===== PREMIUM HEADER ===== */}
        <header className="flex-shrink-0 relative">
          {/* Gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(252,100%,69%)] to-transparent opacity-50" />
          
          <div className="px-6 py-4 bg-[hsl(225,20%,8%)]">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(252,100%,69%)] to-[hsl(185,100%,50%)] flex items-center justify-center glow-primary">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[hsl(185,100%,50%)] flex items-center justify-center border-2 border-[hsl(225,20%,8%)]">
                    <MapPin className="w-2.5 h-2.5 text-[hsl(225,25%,5%)]" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient font-display tracking-tight">
                    Location Privacy Lab
                  </h1>
                  <p className="text-xs text-[hsl(215,15%,55%)] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Interactive Re-identification Risk Analysis
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleGenerateDataset(true)}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-[hsl(252,100%,69%)] to-[hsl(252,100%,60%)] hover:from-[hsl(252,100%,75%)] hover:to-[hsl(252,100%,65%)] text-white border-0 shadow-lg shadow-[hsl(252,100%,69%)]/25"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  {dataset ? 'Refresh Data' : 'Generate Dataset'}
                </Button>
                
                {dataset && (
                  <Button
                    variant="outline"
                    onClick={handleCalculateRisk}
                    disabled={isCalculatingRisk}
                    className="border-[hsl(225,15%,18%)] bg-[hsl(225,15%,12%)] hover:bg-[hsl(252,100%,69%)]/10 hover:border-[hsl(252,100%,69%)]/30"
                  >
                    {isCalculatingRisk ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4 mr-2" />
                    )}
                    Analyze Risk
                  </Button>
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowWalkthrough(true)}
                      className="icon-btn"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Take a guided tour</TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            {/* Stats Bar */}
            {dataset && (
              <div className="flex items-center gap-8 mt-5 pt-4 border-t border-[hsl(225,15%,15%)]">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <Switch
                      checked={showHeatmap}
                      onCheckedChange={setShowHeatmap}
                    />
                    <span className="text-sm text-[hsl(215,15%,55%)] group-hover:text-[hsl(185,100%,50%)] transition-colors flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Heat Map
                    </span>
                  </label>
                  
                  {anonymizedResult && (
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <Switch
                        checked={showAnonymized}
                        onCheckedChange={setShowAnonymized}
                      />
                      <span className="text-sm text-[hsl(215,15%,55%)] group-hover:text-[hsl(185,100%,50%)] transition-colors flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Protected View
                      </span>
                    </label>
                  )}
                </div>
                
                {/* Quick Stats */}
                <div className="ml-auto flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(225,15%,10%)] border border-[hsl(225,15%,15%)]">
                    <Users className="w-4 h-4 text-[hsl(252,100%,69%)]" />
                    <span className="text-sm font-semibold number-display text-white">{dataset.users.length}</span>
                    <span className="text-xs text-[hsl(215,15%,45%)]">users</span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(225,15%,10%)] border border-[hsl(225,15%,15%)]">
                    <MapPin className="w-4 h-4 text-[hsl(185,100%,50%)]" />
                    <span className="text-sm font-semibold number-display text-white">
                      {dataset.users.reduce((sum, u) => sum + u.locations.length, 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-[hsl(215,15%,45%)]">points</span>
                  </div>
                  
                  {Object.keys(riskScores).length > 0 && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                      avgOriginalRisk > 70 
                        ? 'bg-[hsl(0,85%,60%)]/10 border-[hsl(0,85%,60%)]/30' 
                        : avgOriginalRisk > 40 
                        ? 'bg-[hsl(38,95%,55%)]/10 border-[hsl(38,95%,55%)]/30'
                        : 'bg-[hsl(152,82%,45%)]/10 border-[hsl(152,82%,45%)]/30'
                    }`}>
                      <AlertTriangle className="w-4 h-4" style={{ color: avgOriginalRisk > 70 ? 'hsl(0,85%,60%)' : avgOriginalRisk > 40 ? 'hsl(38,95%,55%)' : 'hsl(152,82%,45%)' }} />
                      <span className="text-sm font-semibold number-display" style={{ color: avgOriginalRisk > 70 ? 'hsl(0,85%,60%)' : avgOriginalRisk > 40 ? 'hsl(38,95%,55%)' : 'hsl(152,82%,45%)' }}>
                        {avgOriginalRisk.toFixed(0)}%
                      </span>
                      <span className="text-xs text-[hsl(215,15%,45%)]">avg risk</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-80 flex-shrink-0 border-r border-[hsl(225,15%,12%)] bg-[hsl(225,20%,6%)]">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {dataset ? (
                  <>
                    <UserSelector
                      users={dataset.users}
                      selectedUserId={selectedUserId}
                      riskScores={riskScores}
                      onSelectUser={setSelectedUserId}
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
                  <div className="h-96 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[hsl(252,100%,69%)]/20 to-[hsl(185,100%,50%)]/20 flex items-center justify-center mb-6 animate-float">
                      <Database className="w-10 h-10 text-[hsl(252,100%,69%)]" />
                    </div>
                    <p className="text-[hsl(215,15%,55%)] text-sm mb-6">
                      Generate synthetic location data to explore privacy risks
                    </p>
                    <Button 
                      onClick={() => handleGenerateDataset(true)}
                      className="bg-gradient-to-r from-[hsl(252,100%,69%)] to-[hsl(252,100%,60%)] hover:from-[hsl(252,100%,75%)] hover:to-[hsl(252,100%,65%)] text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Quick Start
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </aside>
          
          {/* Map Area */}
          <div className="flex-1 relative">
            {dataset ? (
              <MapView
                users={showAnonymized && anonymizedResult ? anonymizedResult.dataset.users : dataset.users}
                selectedUserId={selectedUserId}
                riskScores={riskScores}
                showHeatmap={showHeatmap}
                timeFilter={timeFilter}
                showOriginal={!showAnonymized}
                showAnonymized={showAnonymized}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-[hsl(225,20%,6%)]">
                <div className="text-center max-w-xl mx-auto px-8">
                  {/* Hero */}
                  <div className="relative mb-10">
                    <div className="w-40 h-40 mx-auto rounded-[2rem] bg-gradient-to-br from-[hsl(252,100%,69%)]/10 to-[hsl(185,100%,50%)]/10 flex items-center justify-center border border-[hsl(225,15%,15%)] animate-float">
                      <MapPin className="w-20 h-20 text-[hsl(252,100%,69%)]" />
                    </div>
                    <div className="absolute top-4 right-16 w-12 h-12 rounded-2xl bg-[hsl(0,85%,60%)]/10 flex items-center justify-center border border-[hsl(0,85%,60%)]/20 animate-pulse-soft">
                      <AlertTriangle className="w-6 h-6 text-[hsl(0,85%,60%)]" />
                    </div>
                    <div className="absolute bottom-4 left-16 w-14 h-14 rounded-2xl bg-[hsl(152,82%,45%)]/10 flex items-center justify-center border border-[hsl(152,82%,45%)]/20">
                      <Shield className="w-7 h-7 text-[hsl(152,82%,45%)]" />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold font-display mb-4 text-white">
                    Discover Location Privacy Risks
                  </h2>
                  <p className="text-[hsl(215,15%,55%)] mb-8 text-lg leading-relaxed">
                    Your location data tells more about you than you think. 
                    See how just a few GPS points can reveal your identity.
                  </p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      size="lg"
                      onClick={() => handleGenerateDataset(true)}
                      className="bg-gradient-to-r from-[hsl(252,100%,69%)] to-[hsl(185,100%,50%)] hover:from-[hsl(252,100%,75%)] hover:to-[hsl(185,100%,60%)] text-white shadow-xl shadow-[hsl(252,100%,69%)]/20"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Exploring
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="lg"
                      onClick={() => setShowWalkthrough(true)}
                      className="text-[hsl(215,15%,55%)] hover:text-white"
                    >
                      Take a tour
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Dashboard */}
          {dataset && Object.keys(riskScores).length > 0 && (
            <aside className="w-[420px] flex-shrink-0 border-l border-[hsl(225,15%,12%)] bg-[hsl(225,20%,6%)]">
              <ScrollArea className="h-full">
                <div className="p-5 space-y-5">
                  {/* Risk Overview Card */}
                  <div className="gradient-border p-5">
                    <div className="section-title mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Risk Overview
                    </div>
                    <div className="flex justify-around">
                      <RiskMeter risk={avgOriginalRisk} label="Original" size="sm" />
                      {anonymizedResult && (
                        <RiskMeter risk={avgAnonymizedRisk} label="Protected" size="sm" />
                      )}
                    </div>
                    
                    {anonymizedResult && riskReduction > 0 && (
                      <div className="mt-5 p-4 rounded-xl bg-[hsl(152,82%,45%)]/10 border border-[hsl(152,82%,45%)]/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[hsl(215,15%,55%)]">Risk Reduction</span>
                          <span className="text-xl font-bold number-display text-[hsl(152,82%,45%)]">
                            -{riskReduction.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={riskReduction} className="h-2" />
                      </div>
                    )}
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: dataset.users.length, label: 'Users', icon: Users, color: 'hsl(252,100%,69%)' },
                      { value: `${(dataset.users.reduce((sum, u) => sum + u.locations.length, 0) / 1000).toFixed(1)}k`, label: 'Locations', icon: MapPin, color: 'hsl(185,100%,50%)' },
                      { value: Object.values(riskScores).filter(r => r.home_inferred).length, label: 'Homes Found', icon: Home, color: 'hsl(0,85%,60%)' },
                      { value: Object.values(riskScores).filter(r => r.work_inferred).length, label: 'Works Found', icon: Building, color: 'hsl(38,95%,55%)' },
                    ].map((stat, i) => (
                      <div key={i} className="stat-card p-4 rounded-xl bg-[hsl(225,20%,8%)] border border-[hsl(225,15%,15%)]">
                        <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
                        <div className="text-2xl font-bold number-display text-white">{stat.value}</div>
                        <div className="text-[10px] text-[hsl(215,15%,45%)] uppercase tracking-wider mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chart */}
                  <ComparisonChart
                    originalRisk={Object.values(riskScores)[0]}
                    anonymizedRisk={anonymizedResult?.new_risk_score}
                    utilityLoss={anonymizedResult?.utility_loss}
                    chartType={chartType}
                  />
                  
                  {/* Protection Info */}
                  {anonymizedResult && (
                    <Card className="animate-fade-in bg-[hsl(225,20%,8%)] border-[hsl(225,15%,15%)]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-white">
                          <Zap className="w-4 h-4 text-[hsl(185,100%,50%)]" />
                          Applied Protection
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[hsl(215,15%,55%)]">Technique</span>
                          <Badge className="bg-gradient-to-r from-[hsl(252,100%,69%)] to-[hsl(185,100%,50%)] text-white border-0">
                            {anonymizedResult.technique.replace('-', ' ')}
                          </Badge>
                        </div>
                        {Object.entries(anonymizedResult.parameters).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-[hsl(215,15%,55%)] capitalize">{key}</span>
                            <span className="text-sm font-medium number-display text-white">{value}</span>
                          </div>
                        ))}
                        <Separator className="bg-[hsl(225,15%,15%)]" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[hsl(215,15%,55%)]">Utility Loss</span>
                          <Badge variant="outline" className="border-[hsl(38,95%,55%)]/30 text-[hsl(38,95%,55%)]">
                            {anonymizedResult.utility_loss.toFixed(1)}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </aside>
          )}
        </main>
        
        {showWalkthrough && <Walkthrough onClose={() => setShowWalkthrough(false)} />}
      </div>
    </TooltipProvider>
  );
}

export default App;
