/**
 * UserSelector Component - Premium Design
 */
import { Users, Home, Briefcase, MapPin, AlertTriangle, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UserProfile, RiskScore } from '../../types';
import { getRiskLevel } from '../../types';

interface UserSelectorProps {
  users: UserProfile[];
  selectedUserId: string | null;
  riskScores: Record<string, RiskScore>;
  onSelectUser: (userId: string | null) => void;
}

export function UserSelector({
  users,
  selectedUserId,
  riskScores,
  onSelectUser,
}: UserSelectorProps) {
  const sortedUsers = [...users].sort((a, b) => {
    const riskA = riskScores[a.user_id]?.overall_risk || 0;
    const riskB = riskScores[b.user_id]?.overall_risk || 0;
    return riskB - riskA;
  });

  const getRiskColor = (risk: number) => {
    const level = getRiskLevel(risk);
    if (level === 'high') return 'hsl(0,85%,60%)';
    if (level === 'medium') return 'hsl(38,95%,55%)';
    return 'hsl(152,82%,45%)';
  };

  const selectedUser = users.find(u => u.user_id === selectedUserId);
  const selectedRisk = selectedUserId ? riskScores[selectedUserId] : null;

  return (
    <div className="rounded-2xl bg-[hsl(225,20%,8%)] border border-[hsl(225,15%,15%)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[hsl(225,15%,12%)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[hsl(252,100%,69%)]" />
          <span className="text-sm font-semibold text-white">Users</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(252,100%,69%)]/10 text-[hsl(252,100%,69%)] font-medium">
          {users.length}
        </span>
      </div>
      
      {/* User List */}
      <ScrollArea className="h-52">
        <div className="p-2">
          {sortedUsers.map((user) => {
            const risk = riskScores[user.user_id];
            const isSelected = user.user_id === selectedUserId;
            const riskColor = risk ? getRiskColor(risk.overall_risk) : 'hsl(215,15%,45%)';
            
            return (
              <button
                key={user.user_id}
                onClick={() => onSelectUser(isSelected ? null : user.user_id)}
                className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all text-left mb-1 ${
                  isSelected
                    ? 'bg-[hsl(252,100%,69%)]/10 ring-1 ring-[hsl(252,100%,69%)]/40'
                    : 'hover:bg-[hsl(225,15%,12%)]'
                }`}
              >
                {/* Avatar with risk ring */}
                <div 
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm"
                  style={{ 
                    background: `${riskColor}15`,
                    color: riskColor,
                    boxShadow: risk ? `0 0 12px ${riskColor}30` : 'none'
                  }}
                >
                  {user.user_id.slice(-2)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      User {user.user_id.slice(-4)}
                    </span>
                    {risk && (
                      <span 
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{ 
                          background: `${riskColor}20`,
                          color: riskColor
                        }}
                      >
                        {risk.overall_risk.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-[hsl(215,15%,45%)]">
                      {user.locations.length} pts
                    </span>
                    <div className="flex items-center gap-1.5">
                      {risk?.home_inferred && (
                        <Home className="w-3 h-3 text-[hsl(152,82%,45%)]" />
                      )}
                      {risk?.work_inferred && (
                        <Briefcase className="w-3 h-3 text-[hsl(185,100%,50%)]" />
                      )}
                    </div>
                  </div>
                </div>
                
                <ChevronDown className={`w-4 h-4 text-[hsl(215,15%,35%)] transition-transform ${isSelected ? 'rotate-180' : ''}`} />
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Selected User Details */}
      {selectedUser && selectedRisk && (
        <div className="p-4 border-t border-[hsl(225,15%,12%)] bg-[hsl(225,15%,6%)] animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[hsl(225,20%,10%)] border border-[hsl(225,15%,15%)]">
              <div className="flex items-center gap-1 text-[10px] text-[hsl(215,15%,45%)] uppercase tracking-wider mb-1">
                <AlertTriangle className="w-3 h-3" />
                Risk
              </div>
              <div 
                className="text-xl font-bold number-display"
                style={{ color: getRiskColor(selectedRisk.overall_risk) }}
              >
                {selectedRisk.overall_risk.toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[hsl(225,20%,10%)] border border-[hsl(225,15%,15%)]">
              <div className="flex items-center gap-1 text-[10px] text-[hsl(215,15%,45%)] uppercase tracking-wider mb-1">
                <MapPin className="w-3 h-3" />
                Unique
              </div>
              <div className="text-xl font-bold number-display text-[hsl(185,100%,50%)]">
                {selectedRisk.uniqueness_score.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <p className="mt-3 text-xs text-[hsl(215,15%,45%)] text-center">
            <span className="font-semibold text-white">{selectedRisk.min_points_to_identify}</span>
            {' '}points needed for identification
          </p>
        </div>
      )}
    </div>
  );
}
