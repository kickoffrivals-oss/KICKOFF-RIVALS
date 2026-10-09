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
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-between">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#222938] bg-[#13171F]">
        <div className="flex items-center gap-3">
          <RivalsLogo size="md" variant="full" className="text-white" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#1B212D] border border-[#222938] text-xs font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>STEP 3 OF 4: {step === "league" ? "SELECT DIVISION" : "SELECT CLUB"}</span>
          </div>
          {step === "team" && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-[4px] border border-[#222938] bg-[#1B212D] hover:bg-[#222938] transition-colors"
            >
              <IconChevronLeft className="w-4 h-4" />
              <span>Change League</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full">
        <div className="w-full space-y-5">
          {/* Header Title */}
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              Alliance Loyalty
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">
              {step === "league" ? "Choose Competition Division" : `Draft ${selectedLeagueData?.name || "League"} Club`}
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {step === "league"
                ? "Select the primary league where your manager reputation will be tracked."
                : "Select the team you wish to support. Alliance victories yield bonus points on the leaderboard."}
            </p>
          </div>

          {/* League Selection Grid */}
          {step === "league" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LEAGUES.map((league) => (
                <button
                  key={league.id}
                  onClick={() => handleLeagueSelect(league.id)}
                  className="bg-[#13171F] rounded-[6px] p-4 text-left border border-[#222938] hover:border-emerald-500 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-lg font-bold font-mono text-emerald-400">
                      {league.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                        {league.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {TEAMS[league.id]?.length || 4} Competing Clubs
                      </p>
                    </div>
                  </div>
                  <IconChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          )}

          {/* Team Selection Grid */}
          {step === "team" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {teams.map((team) => {
                  const isSelected = selectedTeam === team.id;
                  return (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team.id)}
                      className={cn(
                        "rounded-[4px] p-3 text-center border transition-colors flex flex-col items-center justify-between min-h-[120px]",
                        isSelected
                          ? "bg-[#1B212D] border-emerald-500"
                          : "bg-[#13171F] border-[#222938] hover:border-[#323C50]"
                      )}
                    >
                      <div className="w-10 h-10 rounded-[4px] bg-[#0A0D12] border border-[#222938] flex items-center justify-center font-bold font-mono text-xs text-white uppercase mb-2">
                        {team.shortName || team.name.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white uppercase tracking-wider">
                          {team.name}
                        </p>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          Rating {team.strength}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Complete Confirmation Button */}
              <button
                disabled={!selectedTeam}
                onClick={handleComplete}
                className={cn(
                  "w-full h-11 rounded-[4px] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors",
                  selectedTeam
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    : "bg-[#1B212D] text-slate-500 cursor-not-allowed border border-[#222938]"
                )}
              >
                <span>Confirm {selectedTeamData?.name || "Team"} Alliance</span>
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3.5 text-center text-slate-500 text-xs border-t border-[#222938] bg-[#0A0D12]">
        KickOff Rivals • Team Alliance Roster
      </footer>
    </div>
  );
}

export default AllianceSetup;
