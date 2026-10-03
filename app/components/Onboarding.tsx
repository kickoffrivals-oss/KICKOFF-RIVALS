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
    badge: "ARENA OVERVIEW",
    title: "The Ultimate Matchday Engine",
    description:
      "Predict continuous 3-phase matchdays with compressed 90-minute live radar pitch simulations, dynamic combo multipliers, and instant settlements.",
    icon: <IconFootball className="w-14 h-14 text-emerald-400" />,
    features: [
      "Real-time 2D radar pitch with ball & player telemetry",
      "Dynamic 1X2 & Both Teams Score (GG/NG) markets",
      "Non-stop round cycles running 24/7",
    ],
  },
  {
    id: 2,
    badge: "REWARD ECONOMY",
    title: "Earn Coins & KOR Tokens",
    description:
      "Win predictions to collect KOR token rewards. Complete daily 4-hour check-in grants and convert coins for competitive staking.",
    icon: <IconCoins className="w-14 h-14 text-amber-400" />,
    features: [
      "5,000 Coins + 1,000 KOR Starter Grant",
      "4-Hourly Free Stadium Bonus Grants",
      "Transparent decentralized balance management",
    ],
  },
  {
    id: 3,
    badge: "TEAM ALLIANCES",
    title: "Draft Your Club Alliance",
    description:
      "Choose your favorite club in the Premier Division, La Liga, Serie A, or European Champions League. Earn alliance bonuses when your squad wins!",
    icon: <IconUsers className="w-14 h-14 text-blue-400" />,
    features: [
      "Support premier European clubs",
      "Earn collaborative alliance points & bonuses",
      "Climb the global club league standings",
    ],
  },
  {
    id: 4,
    badge: "OBJECTIVES & PASS",
    title: "Daily & Weekly Quests",
    description:
      "Complete matchday missions, referral targets, and community tasks to unlock coin bounties and level up your Manager Passport.",
    icon: <IconTrophy className="w-14 h-14 text-yellow-400" />,
    features: [
      "Daily betting & victory quests",
      "Weekly accumulator combo challenges",
      "Direct referral reward multipliers",
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
    <div className="min-h-screen stadium-bg text-white overflow-x-hidden flex flex-col justify-between relative">
      {/* Floodlights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-blue-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-amber-500/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between border-b border-white/5">
        <RivalsLogo size="md" variant="full" className="text-white" />
        {!isUsernameStep && (
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
          >
            Skip Intro
          </button>
        )}
      </header>

      {/* Progress Dots */}
      <div className="relative z-10 flex items-center justify-center gap-2 pt-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === currentStep
                ? "w-8 bg-gradient-to-r from-emerald-400 to-teal-300 shadow-md shadow-emerald-500/40"
                : index < currentStep
                  ? "w-3 bg-emerald-500/40"
                  : "w-3 bg-slate-800",
            )}
          />
        ))}
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto w-full">
        {/* Info Slide Card */}
        {step && (
          <div className="broadcast-card rounded-3xl p-7 sm:p-8 border border-white/10 text-center w-full shadow-2xl relative overflow-hidden animate-slide-up" key={step.id}>
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-emerald-500/30 via-slate-900 to-slate-950 p-[2px] border border-white/10 flex items-center justify-center shadow-xl shadow-emerald-500/10 animate-float">
              {step.icon}
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 block mb-1">
              {step.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight mb-3">
              {step.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-medium">
              {step.description}
            </p>

            {/* Features Checkpoints */}
            <div className="space-y-2.5 mb-6 text-left">
              {step.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-950/70 border border-white/5 rounded-xl p-3">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <IconCheck className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs text-slate-300 font-semibold">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Username Setup Card */}
        {isUsernameStep && (
          <div className="broadcast-card rounded-3xl p-7 sm:p-8 border border-white/10 text-center w-full shadow-2xl relative overflow-hidden animate-slide-up">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-[2px] shadow-xl shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-amber-400">
                <IconZap className="w-10 h-10" />
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 block mb-1">
              MANAGER CALL-SIGN
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight mb-2">
              DRAFT YOUR IDENTITY
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Choose your public manager name to appear on global leaderboards and matchday telemetry.
            </p>

            <div className="space-y-3 mb-6">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) setUsernameError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                placeholder="e.g. Tactician_99"
                maxLength={20}
                autoFocus
                className={cn(
                  "w-full h-14 px-4 rounded-2xl border bg-slate-950 text-white text-base font-bold",
                  "placeholder:text-slate-500 outline-none transition-all",
                  usernameError
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-emerald-400"
                )}
              />

              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500">3–20 characters • Letters/Numbers/Underscore</span>
                <span className="text-slate-400 font-mono font-bold">{username.length}/20</span>
              </div>

              {usernameError && (
                <p className="text-red-400 text-xs text-left font-semibold">{usernameError}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full mt-6">
          {!isFirstStep && (
            <button
              onClick={handlePrev}
              className="h-13 px-5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
            >
              <IconChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={isUsernameStep && username.trim().length < 3}
            className={cn(
              "h-13 flex-1 rounded-2xl font-black text-xs uppercase tracking-wider italic transition-all duration-300",
              "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-slate-950",
              "hover:from-emerald-400 hover:to-teal-300 hover:scale-[1.02] active:scale-98 shadow-xl shadow-emerald-500/25",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2",
            )}
          >
            {isUsernameStep ? (
              <>
                <span>PROCEED TO CLUB DRAFT</span>
                <IconZap className="w-4 h-4 fill-slate-950" />
              </>
            ) : (
              <>
                <span>CONTINUE</span>
                <IconChevronRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-slate-500 text-xs border-t border-white/5 bg-slate-950/60 backdrop-blur-md">
        Step {currentStep + 1} of {TOTAL_STEPS} • KickOff Rivals Manager Academy
      </footer>
    </div>
  );
}

export default Onboarding;
