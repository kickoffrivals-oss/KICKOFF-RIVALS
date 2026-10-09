import { useState, useEffect } from "react";
import { cn, formatNumber, truncateAddress } from "../lib/utils";
import { useGame } from "../contexts/GameContext";
import { soundFx } from "../lib/soundFx";
import { Trophy, Zap, Users, Award, Locate } from "lucide-react";
import { Chip } from "./ui/Chip";

interface LeaderboardEntry {
  walletAddress: string;
  username: string;
  doodlBalance: number; // KOR
  totalBets: number;    // Games
  wins: number;         // Wins
  referralCount: number;
  coins: number;        // Points
}

export function Leaderboard() {
  const { profile } = useGame();
  const [entriesKor, setEntriesKor] = useState<LeaderboardEntry[]>([]);
  const [entriesReferral, setEntriesReferral] = useState<LeaderboardEntry[]>([]);
  const [personalRankKor, setPersonalRankKor] = useState<number | null>(null);
  const [personalRankReferral, setPersonalRankReferral] = useState<number | null>(null);
  const [currentUserStatsFromAPI, setCurrentUserStatsFromAPI] = useState<LeaderboardEntry | null>(null);
  const [activeTab, setActiveTab] = useState<"kor" | "referral">("kor");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const walletAddress = profile?.walletAddress;
        const url = walletAddress 
          ? `/api/leaderboard?walletAddress=${walletAddress}` 
          : "/api/leaderboard";
          
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setEntriesKor(data.leaderboardKor || []);
          setEntriesReferral(data.leaderboardReferrals || []);
          setPersonalRankKor(data.userRankKor);
          setPersonalRankReferral(data.userRankReferrals);
          setCurrentUserStatsFromAPI(data.currentUserStats);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [profile?.walletAddress]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64 text-text-muted">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-wider font-bold text-text-muted font-mono">Loading Leaderboard...</p>
      </div>
    );
  }

  const currentEntries = activeTab === "kor" ? entriesKor : entriesReferral;

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto w-full p-4 sm:p-6">
      {/* Standings Banner */}
      <div className="bg-surface-panel border border-border-subtle rounded-md p-5 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-sm bg-surface-raised border border-border-subtle flex items-center justify-center text-semantic-reward">
          <Trophy size={24} strokeWidth={2} />
        </div>

        <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
          HALL OF FAME
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-text-primary font-display tracking-tight uppercase mt-0.5">
          GLOBAL LEADERBOARD
        </h1>
        <p className="text-xs text-text-muted max-w-sm mx-auto mt-1">
          Top prediction managers competing for season rewards and prizes.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-surface-page p-1 rounded-sm border border-border-subtle">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab("kor");
          }}
          className={cn(
            "flex-1 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-accent",
            activeTab === "kor"
              ? "bg-surface-raised text-text-primary border border-border-strong font-bold"
              : "text-text-muted hover:text-text-primary"
          )}
        >
          <Zap size={14} strokeWidth={2.5} />
          Highest KOR
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab("referral");
          }}
          className={cn(
            "flex-1 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-accent",
            activeTab === "referral"
              ? "bg-surface-raised text-text-primary border border-border-strong font-bold"
              : "text-text-muted hover:text-text-primary"
          )}
        >
          <Users size={14} strokeWidth={2.5} />
          Most Referrals
        </button>
      </div>

      {/* Entries List */}
      {currentEntries.length === 0 ? (
        <div className="bg-surface-panel rounded-sm p-12 text-center border border-border-subtle">
          <p className="text-text-muted text-xs uppercase tracking-wider font-bold">No managers found on the leaderboard yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentEntries.map((entry, index) => {
            const isUser = entry.walletAddress.toLowerCase() === profile?.walletAddress?.toLowerCase();

            return (
              <div
                key={entry.walletAddress}
                id={`user-rank-${entry.walletAddress}`}
                className={cn(
                  "bg-surface-panel rounded-sm p-3 border transition-colors",
                  isUser
                    ? "border-accent bg-accent/5"
                    : "border-border-subtle hover:border-border-strong"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={cn(
                        "w-7 h-7 rounded-sm flex items-center justify-center font-mono font-bold text-xs shrink-0 tabular-nums",
                        index === 0 ? "bg-[#382305] text-[#FBBF24] border border-[#F59E0B]/50" :
                        index === 1 ? "bg-surface-raised text-text-primary border border-border-strong" :
                        index === 2 ? "bg-surface-raised text-text-muted border border-border-subtle" :
                        "bg-surface-page text-text-muted border border-border-subtle"
                      )}
                    >
                      #{index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-text-primary text-xs sm:text-sm uppercase truncate">
                          {entry.username}
                        </span>
                        {isUser && (
                          <span className="text-xs font-bold uppercase px-1.5 py-0.2 bg-accent text-surface-page rounded-xs">
                            YOU
                          </span>
                        )}
                        {index === 0 && <Award size={14} className="text-semantic-reward shrink-0" />}
                      </div>
                      <div className="text-xs text-text-muted font-mono">
                        {truncateAddress(entry.walletAddress)}
                      </div>
                    </div>
                  </div>

                  {/* Value Pill */}
                  <div className="text-right">
                    {activeTab === "kor" ? (
                      <div className="font-bold font-mono text-xs text-semantic-reward bg-surface-raised px-2.5 py-1 rounded-sm border border-border-subtle flex items-center gap-1 tabular-nums">
                        <Zap size={13} className="text-semantic-reward" />
                        {formatNumber(entry.doodlBalance)} KOR
                      </div>
                    ) : (
                      <div className="font-bold font-mono text-xs text-text-primary bg-surface-raised px-2.5 py-1 rounded-sm border border-border-subtle flex items-center gap-1 tabular-nums">
                        <Users size={13} className="text-text-muted" />
                        {formatNumber(entry.referralCount)} Refs
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance sub-bar */}
                <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs text-text-muted font-mono">
                  <div>
                    <span className="text-semantic-win font-bold">{entry.wins}W</span>
                    <span className="text-border-strong mx-1">/</span>
                    <span className="text-semantic-loss font-bold">{Math.max(0, entry.totalBets - entry.wins)}L</span>
                    <span className="text-border-strong mx-1.5">•</span>
                    <span>{entry.totalBets} Matches</span>
                  </div>
                  <div className="text-text-muted">
                    {entry.totalBets > 0 ? `${Math.round((entry.wins / entry.totalBets) * 100)}% Win Rate` : "--"}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Sticky Personal Rank Bar */}
          {(() => {
            const personalRank = activeTab === "kor" ? personalRankKor : personalRankReferral;
            if (!currentUserStatsFromAPI || personalRank === null) return null;

            return (
              <div className="fixed bottom-4 left-0 right-0 z-40 p-4 pointer-events-none flex justify-center">
                <div className="bg-surface-panel text-text-primary rounded-md p-3 shadow-modal border border-accent w-full max-w-xl pointer-events-auto flex items-center justify-between gap-4 animate-slide-up">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-sm bg-accent text-surface-page flex items-center justify-center font-bold font-mono shrink-0">
                      #{personalRank}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-accent uppercase tracking-wider">
                        YOUR RANK
                      </div>
                      <div className="text-xs sm:text-sm font-bold truncate uppercase text-text-primary">
                        {currentUserStatsFromAPI.username}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-semibold text-text-muted uppercase">
                        Standing
                      </div>
                      <div className="text-xs font-bold font-mono tabular-nums text-semantic-reward">
                        {activeTab === "kor" ? `${formatNumber(currentUserStatsFromAPI.doodlBalance)} KOR` : `${formatNumber(currentUserStatsFromAPI.referralCount)} Refs`}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        soundFx.playClick();
                        const el = document.getElementById(`user-rank-${currentUserStatsFromAPI.walletAddress}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          el.classList.add('ring-2', 'ring-accent');
                          setTimeout(() => el.classList.remove('ring-2', 'ring-accent'), 2000);
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="bg-accent text-surface-page px-3 py-1.5 rounded-sm font-bold text-xs uppercase tracking-wider hover:bg-accent-hover transition-colors flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <Locate size={14} />
                      <span>Locate</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;

