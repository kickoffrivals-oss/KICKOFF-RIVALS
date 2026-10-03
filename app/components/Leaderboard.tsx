import { useState, useEffect } from "react";
import { cn, formatNumber, truncateAddress } from "../lib/utils";
import { IconTrophy, IconUser, IconZap, IconAward, IconRefresh, IconCoins } from "./Icons";
import { useGame } from "../contexts/GameContext";
import { soundFx } from "../lib/soundFx";

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
      <div className="flex flex-col items-center justify-center p-12 h-64 text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest font-black text-slate-400">Loading Global Standings...</p>
      </div>
    );
  }

  const currentEntries = activeTab === "kor" ? entriesKor : entriesReferral;

  return (
    <div className="space-y-4 pb-16 max-w-xl mx-auto w-full">
      {/* Broadcast Standings Banner */}
      <div className="broadcast-card rounded-2xl p-6 text-center border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-[2px] shadow-lg shadow-amber-500/20 animate-float">
          <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-amber-400">
            <IconTrophy className="w-7 h-7" />
          </div>
        </div>

        <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] block">
          OFFICIAL HALL OF FAME
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase italic mt-0.5">
          GLOBAL LEADERBOARD
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
          Top managers and prediction analysts competing for season-end KOR grants.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab("kor");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === "kor"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <IconZap className="w-3.5 h-3.5" />
          Highest KOR
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab("referral");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === "referral"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <IconUser className="w-3.5 h-3.5" />
          Most Referrals
        </button>
      </div>

      {/* Entries List */}
      {currentEntries.length === 0 ? (
        <div className="broadcast-card rounded-2xl p-12 text-center border border-white/10">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">No players found on the leaderboard yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentEntries.map((entry, index) => {
            const isTop3 = index < 3;
            const isUser = entry.walletAddress.toLowerCase() === profile?.walletAddress?.toLowerCase();

            return (
              <div
                key={entry.walletAddress}
                id={`user-rank-${entry.walletAddress}`}
                className={cn(
                  "broadcast-card rounded-2xl p-3.5 border transition-all duration-300 relative overflow-hidden",
                  isUser ? "border-emerald-400/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/10" :
                  index === 0 ? "border-amber-400/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900" :
                  index === 1 ? "border-slate-300/30 bg-gradient-to-r from-slate-800/30 via-slate-900 to-slate-900" :
                  index === 2 ? "border-amber-600/30 bg-gradient-to-r from-amber-900/20 via-slate-900 to-slate-900" :
                  "border-white/5 bg-slate-900/80 hover:border-white/20"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-md",
                        index === 0 ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 shadow-amber-500/30" :
                        index === 1 ? "bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-950 shadow-slate-400/20" :
                        index === 2 ? "bg-gradient-to-tr from-amber-600 to-amber-700 text-white shadow-amber-600/20" :
                        "bg-slate-800 text-slate-400"
                      )}
                    >
                      #{index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-white text-sm uppercase italic truncate">
                          {entry.username}
                        </span>
                        {isUser && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-emerald-500 text-slate-950 rounded">
                            YOU
                          </span>
                        )}
                        {index === 0 && <IconAward className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {truncateAddress(entry.walletAddress)}
                      </div>
                    </div>
                  </div>

                  {/* Value Pill */}
                  <div className="text-right">
                    {activeTab === "kor" ? (
                      <div className="font-black text-emerald-400 text-xs bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 flex items-center gap-1 led-number">
                        <IconZap className="w-3.5 h-3.5" />
                        {formatNumber(entry.doodlBalance)} KOR
                      </div>
                    ) : (
                      <div className="font-black text-amber-400 text-xs bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 flex items-center gap-1 led-number">
                        <IconUser className="w-3.5 h-3.5" />
                        {formatNumber(entry.referralCount)} Refs
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance sub-bar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-400 font-mono">
                  <div>
                    <span className="text-emerald-400 font-bold">{entry.wins}W</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-red-400 font-bold">{Math.max(0, entry.totalBets - entry.wins)}L</span>
                    <span className="text-slate-600 mx-1.5">•</span>
                    <span>{entry.totalBets} Matches</span>
                  </div>
                  <div className="text-slate-500 font-bold">
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
              <div className="fixed bottom-3 left-0 right-0 z-40 p-4 pointer-events-none flex justify-center">
                <div className="broadcast-card bg-slate-950/95 text-white rounded-2xl p-3 shadow-2xl border border-emerald-500/40 w-full max-w-xl pointer-events-auto flex items-center justify-between gap-4 backdrop-blur-xl animate-slide-up">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black italic text-slate-950 shadow-lg shadow-emerald-500/30 shrink-0">
                      #{personalRank}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">
                        YOUR RANK
                      </div>
                      <div className="text-sm font-black truncate uppercase italic">
                        {currentUserStatsFromAPI.username}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                        Standing Balance
                      </div>
                      <div className="text-xs font-black text-amber-400 led-number">
                        {activeTab === "kor" ? `${formatNumber(currentUserStatsFromAPI.doodlBalance)} KOR` : `${formatNumber(currentUserStatsFromAPI.referralCount)} Refs`}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        soundFx.playClick();
                        const el = document.getElementById(`user-rank-${currentUserStatsFromAPI.walletAddress}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          el.classList.add('ring-2', 'ring-emerald-400');
                          setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-400'), 2000);
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="bg-emerald-500 text-slate-950 px-3.5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider italic hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
                    >
                      Locate
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
