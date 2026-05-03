import { useState, useEffect } from "react";
import { cn, formatNumber, truncateAddress } from "../lib/utils";
import { IconTrophy, IconUser, IconZap, IconCoins, IconShare, IconTrendingUp, IconTrendingDown, IconTarget, IconAward, IconRefresh } from "./Icons";
import { useGame } from "../contexts/GameContext";

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

  // Toggle this to show/hide the maintenance notice
  const SHOW_RESET_NOTICE = false;

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
      <div className="flex flex-col items-center justify-center p-10 h-64 text-slate-400">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading Leaderboard...</p>
      </div>
    );
  }

  const currentEntries = activeTab === "kor" ? entriesKor : entriesReferral;

  return (
    <div className="space-y-4 pb-10 max-w-md mx-auto w-full">

      {/* Banner Header */}
      <div className="bg-white rounded-[2rem] p-8 text-center shadow-xl shadow-black/5 border border-border/50 relative overflow-hidden group">
        {/* Animated Background Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

        <IconTrophy className="mx-auto w-12 h-12 text-primary mb-4 animate-bounce-slow" />

        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 leading-none">
          GLOBAL STANDINGS
        </h2>
        <div className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-none">
          LEADERBOARD
        </div>
      </div>

      {/* Weekly Contest Card - Ultra Compact */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-3 text-white shadow-lg shadow-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <IconZap className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <h3 className="text-[8px] font-black uppercase tracking-widest opacity-70 whitespace-nowrap">Coming Soon</h3>
            <p className="text-sm font-black italic uppercase leading-none truncate">Weekly Contest</p>
          </div>
          <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full border border-white/20 whitespace-nowrap">
            <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
            <span className="text-[7px] font-black uppercase tracking-widest">SEASON 2</span>
          </div>
        </div>
      </div>

      {/* Economy Reset Notice */}
      {SHOW_RESET_NOTICE && (
        <div className="bg-muted/50 rounded-3xl p-6 border border-border/50 space-y-3 relative overflow-hidden text-left">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 mb-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <IconRefresh className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Notice: Reset in Progress</span>
          </div>
          <p className="text-sm font-bold text-foreground leading-relaxed">
            The leaderboard will be reset due to ongoing fixes and balance adjustments.
            We appreciate your patience as we optimize the economy.
          </p>
          <div className="pt-2">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-border shadow-sm">
              <IconTarget className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] font-black text-muted-foreground uppercase">Next Re-Calculations: Monday</span>
            </div> */}
          </div>
        </div>
      )}


      <div className="flex bg-gray-200 p-1 rounded-xl overflow-hidden shadow-inner mt-4 mb-2">
        <button
          onClick={() => setActiveTab("kor")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "kor"
            ? "bg-white text-brand shadow-sm"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Highest KOR
        </button>
        <button
          onClick={() => setActiveTab("referral")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "referral"
            ? "bg-white text-brand shadow-sm"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Most Referrals
        </button>
      </div>

      {currentEntries.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm">No players found on the leaderboard yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentEntries.map((entry, index) => {
            const isTop3 = index < 3;
            return (
              <div
                key={entry.walletAddress}
                id={`user-rank-${entry.walletAddress}`}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 group hover:border-brand/30 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-dark text-sm truncate italic">
                      {entry.username.toLowerCase()}
                      {index === 0 && <IconAward className="w-4 h-4 text-yellow-500 shadow-sm" />}
                      {index === 1 && <IconAward className="w-4 h-4 text-slate-400 shadow-sm" />}
                      {index === 2 && <IconAward className="w-4 h-4 text-amber-600 shadow-sm" />}
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {truncateAddress(entry.walletAddress)}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shadow-md transition-all",
                      index === 0 ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-white border-yellow-200 shadow-yellow-500/20 scale-110" :
                        index === 1 ? "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-700 border-slate-100 shadow-slate-400/10 scale-105" :
                          index === 2 ? "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white border-amber-400 shadow-amber-600/10 scale-105" :
                            "bg-gray-50 text-gray-700 border-gray-200"
                    )}
                  >
                    #{index + 1}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                  <div className="font-mono text-[10px] font-bold text-gray-500">
                    <span className="text-dark">{entry.wins}W/{entry.totalBets - entry.wins}L</span>
                    <span className="mx-1.5 text-gray-300">|</span>
                    <span className="text-brand uppercase">{entry.totalBets} Games</span>
                  </div>
                  <div className="text-right">
                    {activeTab === "kor" ? (
                      <div className="font-mono font-bold text-brand bg-brand/5 px-2 py-0.5 rounded text-[10px] border border-brand/10 inline-flex items-center gap-1">
                        <IconZap className="w-2.5 h-2.5" />
                        {formatNumber(entry.doodlBalance)}
                      </div>
                    ) : (
                      <div className="font-mono font-bold text-dark bg-gray-50 px-2 py-0.5 rounded text-[10px] border border-gray-200 inline-flex items-center gap-1">
                        <IconUser className="w-2.5 h-2.5" />
                        {formatNumber(entry.referralCount)}
                      </div>
                    )}
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
              <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none flex justify-center">
                <div className="bg-foreground text-background rounded-2xl p-3 shadow-2xl border border-white/10 w-full max-w-md pointer-events-auto flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black italic text-background shadow-lg shadow-primary/20 flex-shrink-0">
                      #{personalRank}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-black opacity-50 uppercase tracking-widest leading-none mb-1">Your Rank</div>
                      <div className="text-sm font-black truncate italic leading-none">{currentUserStatsFromAPI.username.toLowerCase()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-black opacity-50 uppercase tracking-widest leading-none mb-1">Balance</div>
                      <div className="text-sm font-black tabular-nums leading-none">
                        {activeTab === "kor" ? formatNumber(currentUserStatsFromAPI.doodlBalance) : formatNumber(currentUserStatsFromAPI.referralCount)}
                        <span className="text-[8px] ml-1 uppercase opacity-70">{activeTab === "kor" ? "KOR" : "Refs"}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const el = document.getElementById(`user-rank-${currentUserStatsFromAPI.walletAddress}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          el.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
                          setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 2000);
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="bg-primary text-background px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest italic hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                      Locate Me
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
