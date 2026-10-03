import { useState } from "react";
import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import {
  IconWallet,
  IconChevronRight,
  IconCheck,
  IconZap,
  IconShield,
  IconUser,
  IconTrophy,
  IconSparkles,
} from "./Icons";
import { soundFx } from "../lib/soundFx";

interface ConnectWalletProps {
  onConnected: (address: string) => void;
}

const DUMMY_ACCOUNTS = [
  {
    id: "account-1",
    name: "Alex_Striker (Champion)",
    address: "0x65bc46df99bc2385128c8a67752d7cd3922de740",
    role: "Verified Pro Manager",
    coins: "5,000",
    kor: "1,000",
    badge: "VIP Tier",
    tagColor: "from-amber-400 to-yellow-300 text-slate-950",
  },
  {
    id: "account-2",
    name: "Midfield_Maestro",
    address: "0x84bc46df99bc2385128c8a67752d7cd3922de888",
    role: "Tactical Analyst",
    coins: "10,000",
    kor: "2,500",
    badge: "Top 10%",
    tagColor: "from-emerald-400 to-teal-300 text-slate-950",
  },
  {
    id: "account-3",
    name: "Rookie_Challenger",
    address: "0x992385128c8a67752d7cd3922de74065bc46df99",
    role: "New Rookie",
    coins: "3,000",
    kor: "500",
    badge: "Starter",
    tagColor: "from-blue-400 to-cyan-300 text-slate-950",
  },
];

export function ConnectWallet({ onConnected }: ConnectWalletProps) {
  const [customName, setCustomName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [connectingAddr, setConnectingAddr] = useState<string | null>(null);

  const handleSelectAccount = (address: string) => {
    soundFx.playCashout();
    setConnectingAddr(address);
    setTimeout(() => {
      onConnected(address);
    }, 250);
  };

  const handleCreateCustom = () => {
    const cleanName = customName.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`;
    const randomHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const generatedAddr = `0x${randomHex}`;
    
    // Save nickname in localStorage for local profile matching
    if (typeof window !== "undefined") {
      localStorage.setItem(`custom_player_name_${generatedAddr.toLowerCase()}`, cleanName);
    }
    
    handleSelectAccount(generatedAddr);
  };

  return (
    <div className="min-h-screen stadium-bg text-white flex flex-col justify-between relative overflow-hidden">
      {/* Stadium floodlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-blue-500/10 blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between border-b border-white/5">
        <RivalsLogo size="md" variant="full" className="text-white" />
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          MOCK WALLET MODE ACTIVE
        </div>
      </header>

      {/* Main Connect Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          <div className="broadcast-card rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden backdrop-blur-2xl shadow-2xl shadow-black/80">
            {/* Ambient Aura */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Shield Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 p-[2px] shadow-2xl shadow-emerald-500/30 animate-float">
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-emerald-400">
                  <IconZap className="w-9 h-9" />
                </div>
              </div>
            </div>

            {/* Broadcast Heading */}
            <div className="text-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 block">
                INSTANT TEST ACCOUNT
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight mt-1">
                CHOOSE PLAYER PROFILE
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No external browser extension required. Select an instant test wallet below to start playing immediately.
              </p>
            </div>

            {/* Quick Play Main Button */}
            <button
              onClick={() => handleSelectAccount(DUMMY_ACCOUNTS[0].address)}
              className={cn(
                "w-full p-4 mb-4 rounded-2xl border transition-all duration-300",
                "flex items-center justify-between group",
                "border-emerald-400 bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-transparent",
                "hover:border-emerald-300 hover:scale-[1.02] active:scale-98 shadow-xl shadow-emerald-500/15"
              )}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                  <IconSparkles className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white uppercase tracking-wider">
                      Quick Play (Default Account)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-slate-950">
                      RECOMMENDED
                    </span>
                  </div>
                  <div className="text-emerald-400 text-xs font-mono font-bold mt-0.5">
                    0x65bc...e740 • 5,000 Coins Preloaded
                  </div>
                </div>
              </div>
              <IconChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Account List */}
            <div className="space-y-2.5 mb-5">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                Or Select Alternate Test Profile:
              </div>

              {DUMMY_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleSelectAccount(acc.address)}
                  className={cn(
                    "w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left",
                    connectingAddr === acc.address
                      ? "border-emerald-400 bg-emerald-500/20"
                      : "border-white/10 bg-slate-900/60 hover:border-emerald-500/30 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-300 shrink-0">
                      <IconUser className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white truncate">
                          {acc.name}
                        </span>
                        <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-gradient-to-r", acc.tagColor)}>
                          {acc.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {acc.address.slice(0, 6)}...{acc.address.slice(-4)} • <span className="text-amber-400 font-bold">{acc.coins} Coins</span>
                      </div>
                    </div>
                  </div>
                  <IconChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </button>
              ))}
            </div>

            {/* Custom Account Creator Option */}
            <div className="pt-2 border-t border-white/5">
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full py-2.5 rounded-xl border border-white/5 hover:border-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>+ Create Custom Test Profile</span>
                </button>
              ) : (
                <div className="space-y-2 pt-2 animate-slide-up">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Enter custom player name..."
                      className="flex-1 h-11 bg-slate-950 border border-white/10 rounded-xl px-3 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      onClick={handleCreateCustom}
                      className="px-4 h-11 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info Capsule */}
            <div className="mt-5 flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-white/5">
              <IconShield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Test mode uses isolated browser storage and persistent state. All match bets, quests, and rewards work without requiring gas fees.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Broadcast Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-slate-500 text-xs border-t border-white/5 bg-slate-950/60 backdrop-blur-md">
        KickOff Rivals Demo Environment • Instant Matchday Simulator
      </footer>
    </div>
  );
}

export default ConnectWallet;
