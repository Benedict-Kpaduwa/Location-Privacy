import { Users, Home, Briefcase, MapPin, AlertTriangle } from 'lucide-react';
import type { UserProfile, RiskScore } from '../../types';
import { getRiskColor } from '../../types';
import { tint } from '@/lib/utils';

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

  const selectedUser = users.find(u => u.user_id === selectedUserId);
  const selectedRisk = selectedUserId ? riskScores[selectedUserId] : null;

  return (
    <section className="rounded-[20px] bg-field p-2">
      <header className="flex items-center justify-between px-3 pb-2 pt-3">
        <div className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
          <Users className="size-5 text-mute" aria-hidden />
          Users
        </div>
        <span className="rounded-full bg-brand/12 px-2.5 py-0.5 text-[13px] font-extrabold text-accent-text">
          {users.length}
        </span>
      </header>

      <ul className="max-h-60 space-y-1 overflow-y-auto overscroll-contain pr-0.5 lg:max-h-64">
        {sortedUsers.map(user => {
          const risk = riskScores[user.user_id];
          const isSelected = user.user_id === selectedUserId;
          const riskColor = risk ? getRiskColor(risk.overall_risk) : 'var(--muted)';

          return (
            <li key={user.user_id}>
              <button
                onClick={() => onSelectUser(isSelected ? null : user.user_id)}
                aria-pressed={isSelected}
                className={`pressable flex min-h-14 w-full items-center gap-3 rounded-[16px] px-3 py-2 text-left ${
                  isSelected ? 'bg-page outline-2 -outline-offset-2 outline-brand' : 'hover:bg-page/60'
                }`}
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-extrabold"
                  style={{ background: tint(riskColor, 14), color: riskColor }}
                >
                  {user.user_id.slice(-2)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-bold leading-tight">
                    User {user.user_id.slice(-4)}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-[13px] text-mute">
                    {user.locations.length} points
                    {risk?.home_inferred && <Home className="size-3.5 text-risk-low" aria-label="Home found" />}
                    {risk?.work_inferred && <Briefcase className="size-3.5 text-navy dark:text-ink" aria-label="Work found" />}
                  </span>
                </span>

                {risk && (
                  <span
                    className="rounded-full px-2.5 py-1 text-[13px] font-extrabold"
                    style={{ background: tint(riskColor, 14), color: riskColor }}
                  >
                    {risk.overall_risk.toFixed(0)}%
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {selectedUser && selectedRisk && (
        <div className="animate-fade-in mt-2 rounded-[16px] bg-page p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="eyebrow flex items-center gap-1">
                <AlertTriangle className="size-3" aria-hidden /> Risk
              </div>
              <div className="num mt-1 text-[26px] leading-none" style={{ color: getRiskColor(selectedRisk.overall_risk) }}>
                {selectedRisk.overall_risk.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="eyebrow flex items-center gap-1">
                <MapPin className="size-3" aria-hidden /> Unique
              </div>
              <div className="num mt-1 text-[26px] leading-none">
                {selectedRisk.uniqueness_score.toFixed(1)}%
              </div>
            </div>
          </div>
          <p className="mt-3 text-[14px] text-mute">
            <span className="font-extrabold text-ink">{selectedRisk.min_points_to_identify}</span>{' '}
            {selectedRisk.min_points_to_identify === 1 ? 'point is' : 'points are'} enough to identify this user.
          </p>
        </div>
      )}
    </section>
  );
}
