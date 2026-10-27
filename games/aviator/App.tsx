
import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import Controls from './components/Controls';
import { GameStatus, HistoryItem, Mission, DailyTasks } from './types';
import { INITIAL_BALANCE } from './constants';
import { generateHeadlines } from './services/geminiService';
import { engine, EngineState } from './GameEngine';

type ViewState = 'game' | 'wallet';
type ConnectionStep = 'idle' | 'connect' | 'sign';

const getTodayUTC = () => new Date().toISOString().split('T')[0];

const INITIAL_MISSIONS: Mission[] = [
  { id: 'ace_pilot', title: 'The Ace Pilot', description: 'Cash out at 5.00x or higher', reward: 1500, isCompleted: false, progress: 0, target: 1, isClaimed: false },
  { id: 'stable_wings', title: 'Stable Wings', description: 'Win 3 rounds in a single day', reward: 750, isCompleted: false, progress: 0, target: 3, isClaimed: false },
  { id: 'high_volume', title: 'High Volume', description: 'Bet a total of 500 $BOA', reward: 1000, isCompleted: false, progress: 0, target: 500, isClaimed: false },
];

const INITIAL_DAILY_TASKS: DailyTasks = {
  hasFollowedX: false,
  hasRetweeted: false,
  hasSpreadWord: false,
  hasReadBriefing: false,
  lastReset: getTodayUTC()
};

interface AviatorAppProps {
  onBackToArena?: () => void;
}

const App: React.FC<AviatorAppProps> = ({ onBackToArena }) => {
  const [gameState, setGameState] = useState<EngineState>(() => engine.getState());
  const [balance, setBalance] = useState<number>(() => {
    if (typeof window === 'undefined') return INITIAL_BALANCE;
    const saved = localStorage.getItem('boa_balance');
    return saved ? parseFloat(saved) : INITIAL_BALANCE;
  });

  const [betAmount, setBetAmount] = useState<number>(10.00);
  const [nextRoundBet, setNextRoundBet] = useState<number>(0);
  const [isBetting, setIsBetting] = useState<boolean>(false);
  const [cashedOut, setCashedOut] = useState<boolean>(false);
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [latestHeadline, setLatestHeadline] = useState<string>("THE FLIGHT OF THE CENTURY BEGINS!");
  const [countdown, setCountdown] = useState<number>(0);
  const [currentView, setCurrentView] = useState<ViewState>('game');
  
  // Wallet & Identity
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletRefId, setWalletRefId] = useState<string>("");
  const [signMessageId, setSignMessageId] = useState<number>(0);
  const [connectionStep, setConnectionStep] = useState<ConnectionStep>('idle');

  // Task & Mission States
  const [dailyTasks, setDailyTasks] = useState<DailyTasks>(() => {
    if (typeof window === 'undefined') return INITIAL_DAILY_TASKS;
    const saved = localStorage.getItem('daily_tasks_v2');
    const today = getTodayUTC();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lastReset === today) return parsed;
      } catch {
        // ignore parse error
      }
    }
    return { ...INITIAL_DAILY_TASKS, lastReset: today };
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    if (typeof window === 'undefined') return INITIAL_MISSIONS;
    const saved = localStorage.getItem('missions_progress_v2');
    const today = getTodayUTC();
    const lastReset = localStorage.getItem('mission_last_reset');
    if (saved && lastReset === today) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore parse error
      }
    }
    return INITIAL_MISSIONS;
  });

  const [isReadingBriefing, setIsReadingBriefing] = useState(false);
  const [briefingTimer, setBriefingTimer] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const [lastClaimDate, setLastClaimDate] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('last_claim_date');
  });
  const hasClaimedToday = lastClaimDate === getTodayUTC();

  const requestRef = useRef<number>(0);

  // Persistence & Reset Logic
  useEffect(() => {
    const today = getTodayUTC();
    localStorage.setItem('boa_balance', balance.toString());
    localStorage.setItem('daily_tasks_v2', JSON.stringify(dailyTasks));
    localStorage.setItem('missions_progress_v2', JSON.stringify(missions));
    localStorage.setItem('mission_last_reset', today);
  }, [balance, dailyTasks, missions]);

  // Main Loop
  const animate = () => {
    const currentState = engine.getState();
    if (currentState.status === GameStatus.IDLE) {
      const remaining = Math.max(0, Math.ceil((currentState.nextStartTime - Date.now()) / 1000));
      setCountdown(remaining);
    }
    setGameState(currentState);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    const unsubscribe = engine.subscribe((newState) => {
      if (newState.status === GameStatus.IDLE) {
        setCashedOut(false);
        setCashedOutMultiplier(0);
      } 
      if (newState.status === GameStatus.CRASHED) {
         handleRoundEnd(newState);
      }
    });
    return () => {
      unsubscribe();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, []);

  const handleRoundEnd = (finalState: EngineState) => {
    setIsBetting(false); 
    const newItem: HistoryItem = {
      multiplier: finalState.multiplier,
      timestamp: Date.now(),
      roundId: finalState.roundId,
      reveal: finalState.reveal || "",
      nonce: finalState.nonce
    };
    setHistory(prev => [newItem, ...prev].slice(0, 10));
    generateHeadlines(finalState.multiplier).then(setLatestHeadline);
  };

  const updateMission = (id: string, increment: number, absolute: boolean = false) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id && !m.isCompleted) {
        const newProgress = absolute ? increment : m.progress + increment;
        const completed = newProgress >= m.target;
        if (completed) showNotification(`Mission Complete: ${m.title}!`);
        return { ...m, progress: Math.min(newProgress, m.target), isCompleted: completed };
      }
      return m;
    }));
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const startBriefing = () => {
    setIsReadingBriefing(true);
    setBriefingTimer(5);
  };

  useEffect(() => {
    let interval: any;
    if (isReadingBriefing && briefingTimer > 0) {
      interval = setInterval(() => setBriefingTimer(t => t - 1), 1000);
    } else if (briefingTimer === 0 && isReadingBriefing) {
      setDailyTasks(prev => ({ ...prev, hasReadBriefing: true }));
      setIsReadingBriefing(false);
      showNotification("Intelligence report processed.");
    }
    return () => clearInterval(interval);
  }, [isReadingBriefing, briefingTimer]);

  const handleSocialAction = (type: 'x' | 'rt' | 'spread') => {
    // Open links in new tab to simulate real actions
    const links = {
      x: 'https://x.com/intent/follow?screen_name=aviator',
      rt: 'https://x.com/intent/retweet?tweet_id=12345',
      spread: 'https://x.com/intent/tweet?text=Join%20the%20flight%20on%20The%20Daily%20Aviator!'
    };
    window.open(links[type], '_blank');

    // Artificial delay to "verify"
    setTimeout(() => {
      setDailyTasks(prev => ({
        ...prev,
        hasFollowedX: type === 'x' ? true : prev.hasFollowedX,
        hasRetweeted: type === 'rt' ? true : prev.hasRetweeted,
        hasSpreadWord: type === 'spread' ? true : prev.hasSpreadWord,
      }));
      showNotification(`Task verified: ${type.toUpperCase()}`);
    }, 1500);
  };

  const isStipendUnlocked = dailyTasks.hasFollowedX && dailyTasks.hasRetweeted && dailyTasks.hasSpreadWord && dailyTasks.hasReadBriefing;

  const handleClaimTokens = () => {
    if (!hasClaimedToday && isStipendUnlocked) {
      setBalance(prev => prev + 1000.00);
      const today = getTodayUTC();
      setLastClaimDate(today);
      localStorage.setItem('last_claim_date', today);
      showNotification("1,000 $BOA tokens received.");
    }
  };

  const handleClaimMissionReward = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (mission && mission.isCompleted && !mission.isClaimed) {
      setBalance(prev => prev + mission.reward);
      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, isClaimed: true } : m));
      showNotification(`Reward Claimed: ${mission.reward} $BOA`);
    }
  };

  const handlePlaceBet = () => {
      if (!isWalletConnected) {
          setConnectionStep('connect');
          return;
      }
      const amountToBet = betAmount;
      if (gameState.status === GameStatus.IDLE) {
          if (balance >= amountToBet) {
              setIsBetting(true);
              setBalance(prev => prev - amountToBet);
              updateMission('high_volume', amountToBet);
          }
      } else if (nextRoundBet === 0) {
          if (balance >= amountToBet) {
              setNextRoundBet(amountToBet);
              setBalance(prev => prev - amountToBet);
              updateMission('high_volume', amountToBet);
          }
      }
  };

  const handleCancelBet = () => {
      if (gameState.status === GameStatus.IDLE && isBetting) {
          setBalance(prev => prev + betAmount);
          setIsBetting(false);
          updateMission('high_volume', -betAmount);
      } else if (nextRoundBet > 0) {
          setBalance(prev => prev + nextRoundBet);
          setNextRoundBet(0);
          updateMission('high_volume', -nextRoundBet);
      }
  };

  const handleCashOut = () => {
      if (gameState.status === GameStatus.CRASHED || !isBetting || cashedOut) return;
      const currentMult = gameState.multiplier;
      const winAmount = betAmount * currentMult;
      setBalance(prev => prev + winAmount);
      setCashedOut(true);
      setCashedOutMultiplier(currentMult);

      if (currentMult >= 5.00) updateMission('ace_pilot', 1);
      updateMission('stable_wings', 1);
  };

  const handleWalletConnect = () => {
    setConnectionStep('sign');
    setSignMessageId(Math.floor(Math.random() * 88888) + 11111);
  };

  const handleSignTransaction = () => {
    setIsWalletConnected(true);
    setConnectionStep('idle');
    setWalletRefId("PILOT-" + Math.random().toString(36).slice(2, 7).toUpperCase());
    setCurrentView('wallet');
  };

  return (
    <div className="h-[100dvh] bg-[#e3e0cf] flex flex-col font-sans text-stone-900 overflow-hidden relative">
      {/* Global Notifications */}
      {notification && (
        <div className="fixed top-20 right-4 z-[200] bg-stone-900 text-white font-newspaper px-4 py-3 border-2 border-stone-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-right duration-300">
            <div className="text-[10px] font-typewriter uppercase text-amber-400 font-bold mb-1 tracking-widest">Dispatch Received</div>
            {notification}
        </div>
      )}

      {/* Daily Briefing Overlay */}
      {isReadingBriefing && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-stone-900/80 backdrop-blur-md">
           <div className="w-full max-w-2xl bg-[#f4f1ea] border-4 border-stone-900 p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto relative animate-in zoom-in">
              <div className="text-center mb-6">
                <div className="font-typewriter text-xs uppercase text-stone-400 mb-1">Morning Intelligence • UTC {getTodayUTC()}</div>
                <h2 className="font-newspaper text-3xl md:text-4xl font-black italic uppercase leading-none border-b-2 border-stone-900 pb-2">Flight Intelligence</h2>
              </div>
              <div className="font-serif text-sm md:text-base leading-relaxed space-y-4 text-stone-700 italic">
                <p>"High-altitude surveillance confirms clear skies for the daily maneuvers. All pilots are required to register their digital ledger signatures before receiving their operational stipends."</p>
                <p>"The X-force (formerly Twitter-Division) is watching. Ensure your communications are amplified. Retweet the official orders. Follow the command center."</p>
                <p>"Field missions are now live. High performance in the cockpit results in substantial $BOA bonuses. Keep your ink flowing."</p>
              </div>
              <div className="mt-8 flex justify-between items-center border-t border-stone-300 pt-4">
                <span className="font-typewriter text-[10px] text-stone-400 uppercase">Analyzing Briefing...</span>
                <div className="bg-stone-900 text-white font-doodle px-6 py-2 text-xl">
                  {briefingTimer}s
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#f4f1ea] border-b-2 border-double border-stone-900 px-4 py-1.5 text-center shadow-sm relative z-50 shrink-0 flex items-center justify-between">
            <div className="w-1/4 text-left flex items-center gap-2">
                {onBackToArena ? (
                  <button
                    onClick={onBackToArena}
                    title="Return to KickOff Rivals Arena Selection"
                    className="font-typewriter text-[9px] md:text-xs font-bold text-stone-900 hover:text-white hover:bg-stone-900 uppercase border-2 border-stone-900 px-2 md:px-2.5 py-1 bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1"
                  >
                    <span>←</span>
                    <span className="hidden sm:inline">ARENA</span>
                  </button>
                ) : (
                  <div className="hidden md:block font-typewriter text-[9px] text-stone-500 uppercase tracking-tighter">
                    EST. 1924 • VOL. C
                  </div>
                )}
            </div>
            <div className="text-center flex-1">
                <h1 className="font-newspaper text-sm md:text-3xl font-black tracking-tighter uppercase cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setCurrentView('game')}>
                    The Daily Aviator
                </h1>
            </div>
            <div className="w-auto md:w-1/4 flex flex-col items-end">
                {isWalletConnected ? (
                    <div onClick={() => setCurrentView(currentView === 'game' ? 'wallet' : 'game')} className="bg-stone-800 text-[#f4f1ea] px-2 py-1 rounded border border-stone-600 text-[9px] md:text-xs cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-inner">
                        <span className="font-bold hidden sm:inline">WALLET:</span> 
                        <span className="font-bold text-green-400">{balance.toFixed(2)} $BOA</span>
                    </div>
                 ) : (
                    <button onClick={() => setConnectionStep('connect')} className="bg-stone-900 text-white font-doodle px-3 py-1 text-[10px] md:text-xs border-2 border-dashed border-stone-500 active:scale-95 hover:bg-stone-800">
                        ENLIST PILOT
                    </button>
                 )}
            </div>
      </header>

      {/* Connection Flow Modals */}
      {connectionStep !== 'idle' && (
         <div className="absolute inset-0 z-[150] flex items-center justify-center bg-stone-900/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-[#f4f1ea] border-4 border-stone-900 p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in" onClick={e => e.stopPropagation()}>
               <div className="text-center mb-6">
                  <div className="font-typewriter text-[10px] text-stone-500 uppercase mb-2">Registry Office</div>
                  <h3 className="font-newspaper text-2xl font-black italic uppercase leading-tight">
                    {connectionStep === 'connect' ? "Connect Wallet" : "Sign Ledger"}
                  </h3>
               </div>
               
               {connectionStep === 'connect' ? (
                 <div className="space-y-4">
                    <p className="font-serif text-sm italic text-stone-600 text-center">"Provide your credentials to access the operational sector."</p>
                    <button onClick={handleWalletConnect} className="w-full bg-stone-900 text-white font-newspaper font-bold py-4 px-6 uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-y-0.5 active:translate-y-1 transition-all">
                      Connect Now
                    </button>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <div className="p-3 bg-white border border-stone-300 border-dashed text-left">
                       <code className="text-[10px] font-typewriter text-stone-600 block leading-tight">
                         MESSAGE: AUTH_PILOT_SESSION_{signMessageId}<br/>
                         NONCE: {signMessageId + 1234}<br/>
                         ACTION: GRANT_DAILY_ACCESS
                       </code>
                    </div>
                    <button onClick={handleSignTransaction} className="w-full bg-white border-4 border-stone-900 text-stone-900 font-doodle py-3 px-6 text-xl uppercase transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:rotate-0 active:translate-y-1 transition-all">
                      Sign Transaction
                    </button>
                 </div>
               )}
               
               <button onClick={() => setConnectionStep('idle')} className="mt-6 w-full font-typewriter text-[9px] uppercase text-stone-400 hover:text-stone-900 underline">Cancel Registration</button>
            </div>
         </div>
      )}

      {currentView === 'game' ? (
        <>
          <main className="flex-1 flex flex-col md:flex-row gap-0 md:gap-3 p-0 md:p-3 overflow-hidden bg-[#e8e4d9]">
            <aside className="order-2 md:order-1 flex flex-col w-full md:w-48 bg-[#f4f1ea] border-t md:border-2 border-stone-800 p-2 shrink-0 md:h-full overflow-hidden">
                <h2 className="font-newspaper font-bold text-xs md:text-sm border-b border-stone-900 mb-1.5 pb-0.5 uppercase tracking-tighter">Live Dispatch</h2>
                <div
                  className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto flex-1 no-scrollbar scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
                >
                    {history.map((h, i) => (
                        <div key={i} className="flex flex-col md:flex-row justify-between items-center border-b border-stone-200 border-dashed min-w-[70px] md:min-w-0 pb-1">
                            <span className="font-typewriter text-[8px] text-stone-400">FLIGHT {h.roundId}</span>
                            <span className={`font-bold font-typewriter text-[10px] ${h.multiplier >= 2.0 ? 'text-green-700' : 'text-stone-500'}`}>
                                {h.multiplier.toFixed(2)}x
                            </span>
                        </div>
                    ))}
                    {history.length === 0 && <div className="text-[8px] font-typewriter text-stone-400 italic py-2">Waiting for first flight...</div>}
                </div>
            </aside>

            <div className="order-1 md:order-2 flex-1 flex flex-col border-b md:border-2 border-stone-800 bg-white h-full relative overflow-hidden">
                <GameCanvas status={gameState.status} multiplier={gameState.multiplier} countdown={countdown} width={800} height={500} />
            </div>
          </main>

          <Controls balance={balance} betAmount={betAmount} setBetAmount={setBetAmount} nextRoundBet={nextRoundBet} setNextRoundBet={setNextRoundBet} gameStatus={gameState.status} isBetting={isBetting} cashedOut={cashedOut} onPlaceBet={handlePlaceBet} onCancelBet={handleCancelBet} onCashOut={handleCashOut} multiplier={gameState.multiplier} />
        </>
      ) : (
        /* Redesigned Ledger / Assignments View - Gated by Wallet Connection */
        <main className="flex-1 bg-[#e3e0cf] p-4 md:p-6 flex items-center justify-center overflow-y-auto">
          {!isWalletConnected ? (
             <div className="w-full max-w-md bg-[#f4f1ea] border-4 border-stone-900 p-10 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-6 font-doodle text-5xl text-stone-300">?</div>
                <h2 className="font-newspaper text-2xl font-black uppercase mb-4 italic">Classified Information</h2>
                <p className="font-serif text-sm italic text-stone-600 mb-8 leading-relaxed">
                  "Only registered and signed pilots may view the operational ledger and field missions. Please enlist at the command desk above."
                </p>
                <button onClick={() => setConnectionStep('connect')} className="bg-stone-900 text-white font-newspaper font-bold py-3 px-8 uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">
                   Register to View
                </button>
             </div>
          ) : (
            <div className="w-full max-w-4xl bg-[#f4f1ea] border-2 border-stone-900 p-4 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
              <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                
                {/* Left Column: Daily Assignments */}
                <div className="flex-1 space-y-6">
                  <div className="border-b-2 border-stone-900 pb-2">
                    <h2 className="font-newspaper text-3xl font-black uppercase tracking-tighter italic">Daily Assignments</h2>
                    <div className="flex justify-between items-center mt-1">
                       <p className="font-typewriter text-[10px] text-stone-500 uppercase font-bold">Resets at 00:00 UTC</p>
                       <span className="font-typewriter text-[9px] text-stone-400">REF: {walletRefId}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Task 1: Briefing */}
                    <div className="flex items-center gap-4 p-3 border border-stone-200 bg-white/50">
                      <div className={`w-8 h-8 border-2 border-stone-900 flex items-center justify-center shrink-0 ${dailyTasks.hasReadBriefing ? 'bg-stone-900' : 'bg-white'}`}>
                        {dailyTasks.hasReadBriefing && <span className="text-white font-doodle text-xl">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className="font-newspaper font-bold text-sm uppercase leading-none mb-1">Morning Intelligence</div>
                        <p className="font-serif text-[10px] text-stone-500 italic">Process the daily operational brief.</p>
                      </div>
                      {!dailyTasks.hasReadBriefing && (
                        <button onClick={startBriefing} className="bg-stone-800 text-white px-3 py-1.5 text-[9px] font-bold font-typewriter uppercase active:scale-95">Read</button>
                      )}
                    </div>

                    {/* Task 2: Follow on X */}
                    <div className="flex items-center gap-4 p-3 border border-stone-200 bg-white/50">
                      <div className={`w-8 h-8 border-2 border-stone-900 flex items-center justify-center shrink-0 ${dailyTasks.hasFollowedX ? 'bg-stone-900' : 'bg-white'}`}>
                        {dailyTasks.hasFollowedX && <span className="text-white font-doodle text-xl">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className="font-newspaper font-bold text-sm uppercase leading-none mb-1">Follow Aviator on X</div>
                        <p className="font-serif text-[10px] text-stone-500 italic">Stay connected with command.</p>
                      </div>
                      {!dailyTasks.hasFollowedX && (
                        <button onClick={() => handleSocialAction('x')} className="bg-sky-500 text-white px-3 py-1.5 text-[9px] font-bold font-typewriter uppercase active:scale-95">Follow</button>
                      )}
                    </div>

                    {/* Task 3: Retweet */}
                    <div className="flex items-center gap-4 p-3 border border-stone-200 bg-white/50">
                      <div className={`w-8 h-8 border-2 border-stone-900 flex items-center justify-center shrink-0 ${dailyTasks.hasRetweeted ? 'bg-stone-900' : 'bg-white'}`}>
                        {dailyTasks.hasRetweeted && <span className="text-white font-doodle text-xl">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className="font-newspaper font-bold text-sm uppercase leading-none mb-1">Retweet Orders</div>
                        <p className="font-serif text-[10px] text-stone-500 italic">Amplify the message.</p>
                      </div>
                      {!dailyTasks.hasRetweeted && (
                        <button onClick={() => handleSocialAction('rt')} className="bg-green-600 text-white px-3 py-1.5 text-[9px] font-bold font-typewriter uppercase active:scale-95">Retweet</button>
                      )}
                    </div>

                    {/* Task 4: Spread Word */}
                    <div className="flex items-center gap-4 p-3 border border-stone-200 bg-white/50">
                      <div className={`w-8 h-8 border-2 border-stone-900 flex items-center justify-center shrink-0 ${dailyTasks.hasSpreadWord ? 'bg-stone-900' : 'bg-white'}`}>
                        {dailyTasks.hasSpreadWord && <span className="text-white font-doodle text-xl">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className="font-newspaper font-bold text-sm uppercase leading-none mb-1">Spread The Word</div>
                        <p className="font-serif text-[10px] text-stone-500 italic">Enlist new recruits via X.</p>
                      </div>
                      {!dailyTasks.hasSpreadWord && (
                        <button onClick={() => handleSocialAction('spread')} className="bg-amber-600 text-white px-3 py-1.5 text-[9px] font-bold font-typewriter uppercase active:scale-95">Post</button>
                      )}
                    </div>

                    {/* Claim Area */}
                    <div className="mt-6 pt-6 border-t-4 border-stone-900 border-double">
                      {!hasClaimedToday ? (
                        <button 
                          disabled={!isStipendUnlocked} 
                          onClick={handleClaimTokens}
                          className={`w-full py-4 font-newspaper font-black text-lg uppercase tracking-[0.2em] border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${isStipendUnlocked ? 'bg-amber-400 hover:bg-amber-300 active:translate-x-1 active:translate-y-1 active:shadow-none' : 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-50'}`}
                        >
                          Claim 1,000 $BOA Stipend
                        </button>
                      ) : (
                        <div className="bg-stone-100 border-2 border-stone-900 p-4 text-center">
                           <div className="font-newspaper text-2xl font-black text-red-800 uppercase tracking-widest italic opacity-40">Stipend Received</div>
                           <div className="font-typewriter text-[10px] text-stone-500 uppercase mt-1">Next available in 00:00 UTC</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Field Missions */}
                <div className="flex-1 bg-white/40 border-l-0 md:border-l-2 border-stone-900 pl-0 md:pl-8 pt-8 md:pt-0">
                   <div className="border-b-2 border-stone-900 pb-2 mb-6">
                      <h2 className="font-newspaper text-3xl font-black uppercase tracking-tighter italic">Field Missions</h2>
                      <p className="font-typewriter text-[10px] text-stone-500 uppercase font-bold mt-1">Operational Performance Bonuses</p>
                   </div>

                   <div className="space-y-8">
                      {missions.map(m => (
                        <div key={m.id} className="relative">
                          <div className="flex justify-between items-end mb-1">
                             <h4 className={`font-newspaper font-bold text-base uppercase ${m.isCompleted ? 'line-through text-stone-400' : ''}`}>{m.title}</h4>
                             <span className="font-typewriter text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 border border-amber-200">+{m.reward} $BOA</span>
                          </div>
                          <p className="font-serif text-xs text-stone-500 italic mb-3 leading-tight">{m.description}</p>
                          
                          <div className="w-full h-3 bg-stone-200 rounded-none border-2 border-stone-900 p-[2px]">
                             <div className="h-full bg-stone-900 transition-all duration-700" style={{ width: `${(m.progress / m.target) * 100}%` }} />
                          </div>
                          <div className="flex justify-between mt-1">
                             <span className="font-typewriter text-[9px] text-stone-400 uppercase">Progress</span>
                             <span className="font-typewriter text-[9px] font-bold">{m.progress} / {m.target}</span>
                          </div>
                          
                          {m.isCompleted && !m.isClaimed && (
                            <button onClick={() => handleClaimMissionReward(m.id)} className="absolute -top-3 -right-3 bg-green-600 text-white text-[10px] font-black px-3 py-1 uppercase shadow-lg animate-bounce z-10">
                               CLAIM REWARD
                            </button>
                          )}
                          {m.isClaimed && (
                            <div className="absolute top-0 right-0 font-doodle text-green-700 text-xl rotate-12 opacity-60">STAMPED!</div>
                          )}
                        </div>
                      ))}
                   </div>

                   <div className="mt-12 bg-stone-900 text-[#f4f1ea] p-4 text-center shadow-lg">
                       <div className="font-newspaper text-[10px] text-stone-400 uppercase font-bold mb-1 tracking-widest">Available Reserves</div>
                       <div className="font-doodle text-4xl">{balance.toFixed(2)} $BOA</div>
                   </div>
                </div>
              </div>

              <div className="mt-12 pt-6 border-t-2 border-double border-stone-900 text-center">
                <button onClick={() => setCurrentView('game')} className="font-newspaper text-xs font-black uppercase tracking-[0.4em] hover:text-stone-500 transition-colors border-2 border-stone-900 px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                   ← Return to Cockpit
                </button>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default App;
