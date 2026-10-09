import { useState } from "react";
import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import {
  IconChevronRight,
  IconChevronLeft,
  IconCheck,
  IconFootball,
  IconTrophy,
  IconCoins,
  IconUsers,
  IconZap,
} from "./Icons";
import { soundFx } from "../lib/soundFx";

interface OnboardingProps {
  onFinish: (username: string) => void;
}

interface OnboardingStep {
  id: number;
  badge: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const infoSteps: OnboardingStep[] = [
  {
    id: 1,
    badge: "MATCHDAY SIMULATION",
    title: "Continuous 35-Second Rounds",
    description:
      "Predict continuous matchdays with 35-second compressed radar pitch simulations, dynamic 1X2 and GG/NoGG odds, and instant settlements.",
    icon: <IconFootball className="w-8 h-8 text-emerald-400" />,
    features: [
      "Real-time 2D radar pitch with ball and event telemetry",
      "Dynamic 1X2 and Both Teams to Score (GG/NG) markets",
      "Automatic settlement as referee sounds full-time",
    ],
  },
  {
    id: 2,
    badge: "REWARD ECONOMY",
    title: "Game Coins & KOR Tokens",
    description:
      "Win predictions to collect KOR token winnings. Claim 4-hourly stadium grants and swap KOR into Coins anytime at fixed 1:10 rates.",
    icon: <IconCoins className="w-8 h-8 text-amber-400" />,
    features: [
      "5,000 Coins + 1,000 KOR Starter Grant",
      "4-Hourly Free Stadium Bonus Grants",
      "Instant 1 KOR = 10 Coins conversion tool",
    ],
  },
  {
    id: 3,
    badge: "CLUB ALLIANCES",
    title: "Represent Your Club Alliance",
    description:
      "Choose your favorite squad in Premier Division, La Liga, or UCL. Earn collaborative alliance bonuses when your team wins on the pitch.",
    icon: <IconUsers className="w-8 h-8 text-emerald-400" />,
    features: [
      "Premier European division rosters",
      "Collaborative alliance ranking and score bonuses",
      "Climb league table standings alongside fellow managers",
    ],
  },
  {
    id: 4,
    badge: "DAILY OBJECTIVES",
    title: "Quests & Passports",
    description:
      "Complete matchday missions, accumulator combinations, and referral targets to unlock bonus coins and level up your Manager Passport.",
    icon: <IconTrophy className="w-8 h-8 text-amber-400" />,
    features: [
      "Daily prediction and winning streak objectives",
      "Accumulator multiplier combo challenges",
      "Referral bonuses for manager invitations",
    ],
  },
];

const TOTAL_STEPS = infoSteps.length + 1; // Last step is Manager Name input

export function Onboarding({ onFinish }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const isUsernameStep = currentStep === infoSteps.length;
  const isFirstStep = currentStep === 0;
  const step = isUsernameStep ? null : infoSteps[currentStep];

  const validateUsername = (value: string): string | null => {
    const v = value.trim();
    if (v.length < 3) return "Username must be at least 3 characters";
    if (v.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(v))
      return "Only letters, numbers, and underscores allowed";
    return null;
  };

  const handleNext = () => {
    soundFx.playClick();
    if (isUsernameStep) {
      const err = validateUsername(username);
      if (err) {
        setUsernameError(err);
        return;
      }
      soundFx.playWhistle();
      onFinish(username.trim());
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    soundFx.playClick();
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    soundFx.playClick();
    setCurrentStep(infoSteps.length);
  };

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
            <span>STEP 3 OF 4: {isUsernameStep ? "MANAGER NICKNAME" : `OVERVIEW (${currentStep + 1}/${TOTAL_STEPS})`}</span>
          </div>
          {!isUsernameStep && (
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-[4px] border border-[#222938] bg-[#1B212D] hover:bg-[#222938] transition-colors"
            >
              Skip Intro
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-[#13171F] rounded-[6px] p-6 sm:p-7 border border-[#222938] shadow-2xl space-y-5">
            {/* Step Indicators */}
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex-1 h-1 rounded-[2px] transition-colors",
                    idx <= currentStep ? "bg-emerald-500" : "bg-[#222938]"
                  )}
                />
              ))}
            </div>

            {/* Feature Walkthrough Step */}
            {!isUsernameStep && step && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                      {step.badge}
                    </span>
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                      {step.title}
                    </h2>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.description}
                </p>

                <div className="bg-[#0A0D12] rounded-[4px] p-3 border border-[#222938] space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Key Features:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {step.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <IconCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Final Nickname Input Step */}
            {isUsernameStep && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-emerald-400 mx-auto mb-2">
                    <IconTrophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                    Manager Identity
                  </span>
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                    Choose Squad Nickname
                  </h2>
                  <p className="text-xs text-slate-400">
                    Your manager name will appear on the leaderboard and matchday dockets.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="onboarding-username-input"
                    className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5"
                  >
                    Manager Nickname
                  </label>
                  <input
                    id="onboarding-username-input"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setUsernameError(null);
                    }}
                    placeholder="e.g. MasterTactician"
                    maxLength={20}
                    className={cn(
                      "w-full h-10 px-3 bg-[#0A0D12] border rounded-[4px] text-xs font-bold text-white focus:outline-none",
                      usernameError ? "border-red-500" : "border-[#222938] focus:border-emerald-500"
                    )}
                  />
                  {usernameError ? (
                    <p className="text-xs text-red-400 mt-1 font-medium">{usernameError}</p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">3–20 characters (letters, numbers, underscore)</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex gap-2 pt-2 border-t border-[#222938]">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="h-10 px-4 rounded-[4px] bg-[#1B212D] border border-[#222938] hover:bg-[#222938] text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <IconChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 h-10 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{isUsernameStep ? "Confirm & Choose Alliance" : "Continue"}</span>
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3.5 text-center text-slate-500 text-xs border-t border-[#222938] bg-[#0A0D12]">
        KickOff Rivals • Manager Registration Flow
      </footer>
    </div>
  );
}

export default Onboarding;
