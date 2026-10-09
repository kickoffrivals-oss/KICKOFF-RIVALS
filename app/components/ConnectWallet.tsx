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

const DEMO_ACCOUNTS = [
  {
    id: "demo-account-1",
    name: "Alex_Striker",
    address: "0x65bc46df99bc2385128c8a67752d7cd3922de740",
    role: "Demo Account (Starter)",
    coins: "5,000",
    kor: "1,000",
    badge: "Demo Account",
  },
  {
    id: "demo-account-2",
    name: "Midfield_Maestro",
    address: "0x84bc46df99bc2385128c8a67752d7cd3922de888",
    role: "Demo Account (High Roller)",
    coins: "10,000",
    kor: "2,500",
    badge: "Demo Account",
  },
  {
    id: "demo-account-3",
    name: "Rookie_Challenger",
    address: "0x992385128c8a67752d7cd3922de74065bc46df99",
    role: "Demo Account (Rookie)",
    coins: "3,000",
    kor: "500",
    badge: "Demo Account",
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
    }, 200);
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
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-between">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#222938] bg-[#13171F]">
        <div className="flex items-center gap-3">
          <RivalsLogo size="md" variant="full" className="text-white" />
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#1B212D] border border-[#222938] text-xs font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>STEP 2 OF 4: SESSION ACCOUNT</span>
        </div>
      </header>

      {/* Main Connect Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          <div className="bg-[#13171F] rounded-[6px] p-6 sm:p-7 border border-[#222938] shadow-2xl space-y-5">
            {/* Header Icon & Title */}
            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-[4px] bg-[#1B212D] border border-[#222938] flex items-center justify-center text-emerald-400 mx-auto mb-2">
                <IconZap className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Instant In-Memory Session
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
                Select Demo Account
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No external Web3 wallet required for demo play. Select an instant account below.
              </p>
            </div>

            {/* Quick Play Main Button */}
            <button
              onClick={() => handleSelectAccount(DEMO_ACCOUNTS[0].address)}
              className={cn(
                "w-full p-3.5 rounded-[4px] border transition-colors flex items-center justify-between group",
                connectingAddr === DEMO_ACCOUNTS[0].address
                  ? "border-emerald-500 bg-[#1B212D]"
                  : "border-emerald-500/60 bg-[#13171F] hover:bg-[#1B212D]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#0A0D12] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <IconSparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white uppercase tracking-wider">
                      Quick Demo (Default Account)
                    </span>
                    <span className="px-1.5 py-0.2 rounded-[2px] text-[10px] font-bold uppercase bg-emerald-500 text-slate-950">
                      Recommended
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs font-mono tabular-nums mt-0.5">
                    0x65bc...e740 • 5,000 Coins Preloaded
                  </div>
                </div>
              </div>

              <IconChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* List of Demo Accounts */}
            <div className="space-y-1.5 pt-2 border-t border-[#222938]">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase pb-1">
                <span>Available Demo Accounts</span>
                <span className="font-mono text-slate-500">Instant</span>
              </div>

              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSelectAccount(account.address)}
                  className={cn(
                    "w-full p-2.5 rounded-[4px] border transition-colors flex items-center justify-between text-left",
                    connectingAddr === account.address
                      ? "border-emerald-500 bg-[#1B212D]"
                      : "border-[#222938] bg-[#0A0D12] hover:bg-[#1B212D] hover:border-[#323C50]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[4px] bg-[#13171F] border border-[#222938] flex items-center justify-center text-slate-400">
                      <IconUser className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white uppercase tracking-wider">
                        {account.name}
                      </p>
                      <p className="text-xs text-slate-400 font-mono tabular-nums">
                        {account.coins} Coins • {account.kor} KOR
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-[2px] bg-[#1B212D] border border-[#222938] text-xs font-mono font-bold text-slate-400">
                    Demo
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Account Drawer */}
            <div className="pt-2 border-t border-[#222938]">
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full h-9 rounded-[4px] bg-[#1B212D] border border-[#222938] hover:bg-[#222938] text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  + Create Custom Manager Name
                </button>
              ) : (
                <div className="space-y-2 bg-[#0A0D12] p-3 rounded-[4px] border border-[#222938]">
                  <label htmlFor="custom-manager-input" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Enter Custom Manager Nickname
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="custom-manager-input"
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. MasterTactician"
                      maxLength={20}
                      className="flex-1 h-9 bg-[#13171F] border border-[#222938] rounded-[4px] px-3 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleCreateCustom}
                      className="px-4 h-9 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      Initialize
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3.5 text-center text-slate-500 text-xs border-t border-[#222938] bg-[#0A0D12]">
        KickOff Rivals • Demo Account Verification Session
      </footer>
    </div>
  );
}

export default ConnectWallet;
