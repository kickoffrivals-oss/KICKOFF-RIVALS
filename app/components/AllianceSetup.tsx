import { useState } from "react";
import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import { LEAGUES, TEAMS } from "../constants";
import {
  IconChevronRight,
  IconChevronLeft,
  IconCheck,
  IconUsers,
  IconTrophy,
  IconStar,
} from "./Icons";
import { soundFx } from "../lib/soundFx";

interface AllianceSetupProps {
  apiUrl: string;
  initialUsername?: string;
  onComplete: (data: {
    username: string;
    leagueId: string;
    teamId: string;
  }) => void;
}

export function AllianceSetup({
  apiUrl,
  initialUsername,
  onComplete,
}: AllianceSetupProps) {
  const [step, setStep] = useState<"league" | "team">("league");
  const [username] = useState(initialUsername ?? "");
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const handleLeagueSelect = (leagueId: string) => {
    soundFx.playClick();
    setSelectedLeague(leagueId);
    setSelectedTeam(null);
    setStep("team");
  };

  const handleTeamSelect = (teamId: string) => {
    soundFx.playClick();
    setSelectedTeam(teamId);
  };

  const handleComplete = () => {
    if (selectedLeague && selectedTeam) {
      soundFx.playCashout();
      onComplete({
        username: username.trim(),
        leagueId: selectedLeague,
        teamId: selectedTeam,
      });
    }
  };

  const handleBack = () => {
    soundFx.playClick();
    if (step === "team") {
      setStep("league");
    }
  };

  const teams = selectedLeague ? TEAMS[selectedLeague] || [] : [];
  const selectedTeamData = teams.find((t) => t.id === selectedTeam);
  const selectedLeagueData = LEAGUES.find((l) => l.id === selectedLeague);

  return (
    <div className="min-h-screen stadium-bg text-white overflow-x-hidden flex flex-col justify-between relative">
      {/* Stadium floodlights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-blue-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between border-b border-white/5">
        <RivalsLogo size="md" variant="full" className="text-white" />
        {step === "team" && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
          >
            <IconChevronLeft className="w-4 h-4" />
            <span>Switch League</span>
          </button>
        )}
      </header>

      {/* Progress Line */}
      <div className="relative z-10 px-6 pt-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          {["league", "team"].map((s, index) => (
            <div
              key={s}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all duration-300",
                step === s
                  ? "bg-gradient-to-r from-emerald-400 to-teal-300 shadow-md shadow-emerald-500/30"
                  : index < ["league", "team"].indexOf(step)
                    ? "bg-emerald-500/40"
                    : "bg-slate-800",
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto w-full">
        {/* LEAGUE SELECT STEP */}
        {step === "league" && (
          <div className="broadcast-card rounded-3xl p-6 sm:p-8 border border-white/10 w-full shadow-2xl relative overflow-hidden animate-slide-up text-center">
            <div className="w-18 h-18 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-xl shadow-emerald-500/20 flex items-center justify-center animate-float">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-emerald-400">
                <IconTrophy className="w-9 h-9" />
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 block mb-1">
              COMPETITION DRAFT
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight mb-2">
              CHOOSE YOUR LEAGUE
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed mb-6 max-w-sm mx-auto">
              Select the primary league where you will represent your squad and compete for season-end bounties.
            </p>

            <div className="space-y-2.5">
              {LEAGUES.map((league) => (
                <button
                  key={league.id}
                  onClick={() => handleLeagueSelect(league.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all flex items-center justify-between group",
                    selectedLeague === league.id
                      ? "border-emerald-400 bg-emerald-500/20"
                      : "border-white/10 bg-slate-950/70 hover:border-emerald-500/40 hover:bg-white/5",
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    {league.logo ? (
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 p-1.5 flex items-center justify-center">
                        <img
                          src={league.logo}
                          alt={`${league.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-emerald-400 text-sm">
                        {league.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-left">
                      <div className="font-extrabold text-sm text-white uppercase tracking-wider group-hover:text-emerald-300 transition-colors">
                        {league.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {TEAMS[league.id]?.length || 0} Premier Clubs Available
                      </div>
                    </div>
                  </div>
                  <IconChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TEAM SELECT STEP */}
        {step === "team" && selectedLeague && (
          <div className="broadcast-card rounded-3xl p-6 sm:p-8 border border-white/10 w-full shadow-2xl relative overflow-hidden animate-slide-up text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 block mb-1">
              {selectedLeagueData?.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight mb-2">
              DRAFT YOUR CLUB
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              You will receive special alliance rewards and multiplier bonuses whenever your club wins!
            </p>

            <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1 mb-6">
              {teams.map((team) => {
                const isSelected = selectedTeam === team.id;
                return (
                  <button
                    key={team.id}
                    onClick={() => handleTeamSelect(team.id)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-2.5 relative group",
                      isSelected
                        ? "border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                        : "border-white/10 bg-slate-950/70 hover:border-white/25 hover:bg-white/5",
                    )}
                  >
                    {/* Club Crest */}
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/10 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: team.color || "#1e293b" }}
                    >
                      {team.logo ? (
                        <img
                          src={team.logo}
                          alt={`${team.name} logo`}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="font-black text-base text-white">
                          {team.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-white text-center truncate w-full uppercase tracking-wider">
                      {team.name}
                    </span>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                        <IconCheck className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedTeam && (
              <button
                onClick={handleComplete}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider italic hover:scale-[1.02] active:scale-98 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <span>JOIN {selectedTeamData?.name.toUpperCase()} ALLIANCE</span>
                <IconChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-slate-500 text-xs border-t border-white/5 bg-slate-950/60 backdrop-blur-md">
        {step === "league" ? "Step 1 of 2: Competition Selection" : "Step 2 of 2: Squad Alignment"} • KickOff Rivals
      </footer>
    </div>
  );
}

export default AllianceSetup;
