import { useState, useEffect } from "react";
import { cn, formatNumber, truncateAddress } from "../lib/utils";
import { useGame } from "../contexts/GameContext";
import { useTheme } from "../contexts/ThemeContext";
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
  const { isNeoBrutalist } = useTheme();
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
      <div className={cn("flex flex-col items-center justify-center p-12 h-64", isNeoBrutalist ? "text-black" : "text-text-muted")}>
        <div className={cn("w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4", isNeoBrutalist ? "border-black" : "border-accent")} />
        <p className={cn("text-xs uppercase tracking-wider font-mono", isNeoBrutalist ? "font-black text-black" : "font-bold text-text-muted")}>
          Loading Leaderboard...
        </p>
      </div>
    );
  }

  const currentEntries = activeTab === "kor" ? entriesKor : entriesReferral;

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto w-full p-4 sm:p-6">
      {/* Standings Banner */}
      <div
        className={cn(
          "p-5 text-center transition-colors",
          isNeoBrutalist
            ? "bg-white border-[2.5px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] text-black rounded-[10px]"
            : "bg-surface-panel border border-border-subtle rounded-md"
        )}
      >
        <div
          className={cn(
            "w-12 h-12 mx-auto mb-3 flex items-center justify-center shrink-0",
            isNeoBrutalist
              ? "bg-[#ffe600] border-2 border-black rounded-[8px] text-black shadow-[2px_2px_0_#000]"
              : "rounded-sm bg-surface-raised border border-border-subtle text-semantic-reward"
          )}
        >
          <Trophy size={24} strokeWidth={isNeoBrutalist ? 2.5 : 2} />
        </div>

        <span
          className={cn(
            "text-xs uppercase tracking-wider block",
            isNeoBrutalist ? "text-black/70 font-black" : "text-text-muted font-bold"
          )}
        >
          HALL OF FAME
        </span>
        <h1
          className={cn(
            "text-xl sm:text-2xl font-black font-display tracking-tight uppercase mt-0.5",
            isNeoBrutalist ? "text-black" : "text-text-primary"
          )}
        >
          GLOBAL LEADERBOARD
        </h1>
        <p
          className={cn(
            "text-xs max-w-sm mx-auto mt-1",
            isNeoBrutalist ? "text-black/70 font-bold" : "text-text-muted"
          )}
        >
          Top prediction managers competing for season rewards and prizes.
        </p>
      </div>

      {/* Tab Switcher */}
      <div
        className={cn(
          "flex p-1 transition-all",
          isNeoBrutalist
            ? "bg-white border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000] gap-1"
            : "bg-surface-page rounded-sm border border-border-subtle"
        )}
      >
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab("kor");
          }}
          className={cn(
            "flex-1 py-2 text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            isNeoBrutalist
              ? activeTab === "kor"
                ? "bg-[#ffe600] text-black border-2 border-black rounded-[6px] font-black shadow-[1.5px_1.5px_0_#000]"
                : "text-black/70 hover:text-black font-black rounded-[6px]"
              : activeTab === "kor"
              ? "bg-surface-raised text-text-primary border border-border-strong font-bold rounded-sm focus-visible:outline-2 focus-visible:outline-accent"
              : "text-text-muted hover:text-text-primary rounded-sm focus-visible:outline-2 focus-visible:outline-accent"
          )}
        >
          <Zap size={14} strokeWidth={isNeoBrutalist ? 2.5 : 2.5} />
          Highest KOR
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab("referral");
          }}
          className={cn(
            "flex-1 py-2 text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            isNeoBrutalist
              ? activeTab === "referral"
                ? "bg-[#ffe600] text-black border-2 border-black rounded-[6px] font-black shadow-[1.5px_1.5px_0_#000]"
                : "text-black/70 hover:text-black font-black rounded-[6px]"
              : activeTab === "referral"
              ? "bg-surface-raised text-text-primary border border-border-strong font-bold rounded-sm focus-visible:outline-2 focus-visible:outline-accent"
              : "text-text-muted hover:text-text-primary rounded-sm focus-visible:outline-2 focus-visible:outline-accent"
          )}
        >
          <Users size={14} strokeWidth={isNeoBrutalist ? 2.5 : 2.5} />
          Most Referrals
        </button>
      </div>

      {/* Entries List */}
      {currentEntries.length === 0 ? (
        <div
          className={cn(
            "p-12 text-center transition-colors",
            isNeoBrutalist
              ? "bg-white border-2 border-black rounded-[10px] shadow-[3px_3px_0_#000] text-black"
              : "bg-surface-panel rounded-sm border border-border-subtle"
          )}
        >
          <p className={cn("text-xs uppercase tracking-wider", isNeoBrutalist ? "font-black text-black/70" : "font-bold text-text-muted")}>
            No managers found on the leaderboard yet.
          </p>
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
                  "p-3 transition-colors",
                  isNeoBrutalist
                    ? cn(
                        "rounded-[8px] sm:rounded-[10px] border-2 border-black shadow-[3px_3px_0_#000] text-black",
                        isUser ? "bg-[#fffef0] ring-2 ring-black" : "bg-white hover:bg-[#fffef0]"
                      )
                    : cn(
                        "bg-surface-panel rounded-sm border",
                        isUser ? "border-accent bg-accent/5" : "border-border-subtle hover:border-border-strong"
                      )
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={cn(
                        "w-7 h-7 flex items-center justify-center font-mono text-xs shrink-0 tabular-nums",
                        isNeoBrutalist
                          ? index === 0
                            ? "bg-[#ffe600] text-black border-2 border-black font-black rounded-[4px] shadow-[1px_1px_0_#000]"
                            : index === 1
                            ? "bg-white text-black border-2 border-black font-black rounded-[4px] shadow-[1px_1px_0_#000]"
                            : index === 2
                            ? "bg-[#00ff66] text-black border-2 border-black font-black rounded-[4px] shadow-[1px_1px_0_#000]"
                            : "bg-[#fcfaf2] text-black border border-black/40 font-bold rounded-[4px]"
                          : cn(
                              "rounded-sm font-bold",
                              index === 0
                                ? "bg-[#382305] text-[#FBBF24] border border-[#F59E0B]/50"
                                : index === 1
                                ? "bg-surface-raised text-text-primary border border-border-strong"
                                : index === 2
                                ? "bg-surface-raised text-text-muted border border-border-subtle"
                                : "bg-surface-page text-text-muted border border-border-subtle"
                            )
                      )}
                    >
                      #{index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-xs sm:text-sm uppercase truncate",
                            isNeoBrutalist ? "font-black text-black" : "font-bold text-text-primary"
                          )}
                        >
                          {entry.username}
                        </span>
                        {isUser && (
                          <span
                            className={cn(
                              "text-xs uppercase px-1.5 py-0.5",
                              isNeoBrutalist
                                ? "bg-black text-[#ffe600] font-black font-mono border border-black rounded-[3px] shadow-[1px_1px_0_#000]"
                                : "font-bold bg-accent text-surface-page rounded-xs"
                            )}
                          >
                            YOU
                          </span>
                        )}
                        {index === 0 && (
                          <Award
                            size={14}
                            className={isNeoBrutalist ? "text-black fill-[#ffe600] shrink-0" : "text-semantic-reward shrink-0"}
                          />
                        )}
                      </div>
                      <div
                        className={cn(
                          "text-xs font-mono",
                          isNeoBrutalist ? "text-black/60 font-bold" : "text-text-muted"
                        )}
                      >
                        {truncateAddress(entry.walletAddress)}
                      </div>
                    </div>
                  </div>

                  {/* Value Pill */}
                  <div className="text-right">
                    {activeTab === "kor" ? (
                      <div
                        className={cn(
                          "font-mono text-xs px-2.5 py-1 rounded-[6px] flex items-center gap-1 tabular-nums",
                          isNeoBrutalist
                            ? "bg-[#fcfaf2] text-black border-2 border-black font-black shadow-[1.5px_1.5px_0_#000]"
                            : "font-bold text-semantic-reward bg-surface-raised rounded-sm border border-border-subtle"
                        )}
                      >
                        <Zap size={13} className={isNeoBrutalist ? "text-black" : "text-semantic-reward"} />
                        {formatNumber(entry.doodlBalance)} KOR
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "font-mono text-xs px-2.5 py-1 rounded-[6px] flex items-center gap-1 tabular-nums",
                          isNeoBrutalist
                            ? "bg-[#fcfaf2] text-black border-2 border-black font-black shadow-[1.5px_1.5px_0_#000]"
                            : "font-bold text-text-primary bg-surface-raised rounded-sm border border-border-subtle"
                        )}
                      >
                        <Users size={13} className={isNeoBrutalist ? "text-black" : "text-text-muted"} />
                        {formatNumber(entry.referralCount)} Refs
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance sub-bar */}
                <div
                  className={cn(
                    "flex items-center justify-between pt-2 text-xs font-mono",
                    isNeoBrutalist
                      ? "border-t-[1.5px] border-black text-black/80 font-bold"
                      : "border-t border-border-subtle text-text-muted"
                  )}
                >
                  <div>
                    <span className={cn(isNeoBrutalist ? "text-[#008833] font-black" : "text-semantic-win font-bold")}>
                      {entry.wins}W
                    </span>
                    <span className={isNeoBrutalist ? "text-black/40 mx-1" : "text-border-strong mx-1"}>/</span>
                    <span className={cn(isNeoBrutalist ? "text-[#ff3366] font-black" : "text-semantic-loss font-bold")}>
                      {Math.max(0, entry.totalBets - entry.wins)}L
                    </span>
                    <span className={isNeoBrutalist ? "text-black/40 mx-1.5" : "text-border-strong mx-1.5"}>•</span>
                    <span>{entry.totalBets} Matches</span>
                  </div>
                  <div>
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
                <div
                  className={cn(
                    "p-3 w-full max-w-xl pointer-events-auto flex items-center justify-between gap-4 animate-slide-up transition-colors",
                    isNeoBrutalist
                      ? "bg-[#ffe600] text-black border-2 sm:border-[2.5px] border-black rounded-[10px] shadow-[4px_4px_0_#000]"
                      : "bg-surface-panel text-text-primary rounded-md shadow-modal border border-accent"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-9 h-9 flex items-center justify-center font-mono shrink-0",
                        isNeoBrutalist
                          ? "bg-white text-black border-2 border-black rounded-[6px] font-black shadow-[1.5px_1.5px_0_#000]"
                          : "rounded-sm bg-accent text-surface-page font-bold"
                      )}
                    >
                      #{personalRank}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "text-xs uppercase tracking-wider",
                          isNeoBrutalist ? "text-black font-black" : "text-accent font-bold"
                        )}
                      >
                        YOUR RANK
                      </div>
                      <div
                        className={cn(
                          "text-xs sm:text-sm font-bold truncate uppercase",
                          isNeoBrutalist ? "text-black font-black" : "text-text-primary"
                        )}
                      >
                        {currentUserStatsFromAPI.username}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div
                        className={cn(
                          "text-xs uppercase",
                          isNeoBrutalist ? "text-black/80 font-black" : "text-text-muted font-semibold"
                        )}
                      >
                        Standing
                      </div>
                      <div
                        className={cn(
                          "text-xs font-bold font-mono tabular-nums",
                          isNeoBrutalist ? "text-black font-black" : "text-semantic-reward"
                        )}
                      >
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
                      className={cn(
                        "px-3 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all",
                        isNeoBrutalist
                          ? "bg-white text-black border-2 border-black rounded-[6px] font-black shadow-[2px_2px_0_#000] hover:bg-black hover:text-white active:translate-x-[1px] active:translate-y-[1px]"
                          : "bg-accent text-surface-page rounded-sm font-bold hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-accent"
                      )}
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

