
import React from 'react';
import { GameStatus } from '../types';
import { MIN_BET, MAX_BET } from '../constants';

interface ControlsProps {
  balance: number;
  betAmount: number;
  setBetAmount: (val: number) => void;
  nextRoundBet: number;
  setNextRoundBet: (val: number) => void;
  gameStatus: GameStatus;
  isBetting: boolean;
  cashedOut: boolean;
  onPlaceBet: () => void;
  onCancelBet: () => void;
  onCashOut: () => void;
  multiplier: number;
}

const Controls: React.FC<ControlsProps> = ({
  balance,
  betAmount,
  setBetAmount,
  nextRoundBet,
  setNextRoundBet,
  gameStatus,
  isBetting,
  cashedOut,
  onPlaceBet,
  onCancelBet,
  onCashOut,
  multiplier,
}) => {
  
  const currentDisplayAmount = gameStatus === GameStatus.IDLE ? betAmount : nextRoundBet || betAmount;

  const handleIncrement = () => {
    const newVal = Math.min(MAX_BET, currentDisplayAmount + 1);
    if (gameStatus === GameStatus.IDLE) {
      setBetAmount(newVal);
    } else {
      setNextRoundBet(newVal);
    }
  };

  const handleDecrement = () => {
    const newVal = Math.max(MIN_BET, currentDisplayAmount - 1);
    if (gameStatus === GameStatus.IDLE) {
      setBetAmount(newVal);
    } else {
      setNextRoundBet(newVal);
    }
  };

  const handleQuickAdd = (amt: number) => {
    const newVal = Math.min(MAX_BET, currentDisplayAmount + amt);
    if (gameStatus === GameStatus.IDLE) {
      setBetAmount(newVal);
    } else {
      setNextRoundBet(newVal);
    }
  };

  const handleClear = () => {
    if (gameStatus === GameStatus.IDLE) {
      setBetAmount(MIN_BET);
    } else {
      setNextRoundBet(MIN_BET);
    }
  };

  const quickBets = [1, 5, 10, 50, 100];

  const renderButton = () => {
    const btnBaseClass = "w-full h-14 md:h-16 rounded-lg shadow-lg active:translate-y-1 active:shadow-none transition-all flex flex-col items-center justify-center";
    
    if (gameStatus === GameStatus.FLYING && isBetting && !cashedOut) {
      return (
        <button 
          onClick={onCashOut}
          className={`${btnBaseClass} bg-green-600 hover:bg-green-500 text-white font-newspaper font-black border-b-4 border-green-800 transform active:scale-95`}
        >
           <span className="text-lg md:text-xl uppercase tracking-tighter">CASH OUT</span>
           <span className="text-[8px] md:text-[9px] font-typewriter text-green-100 bg-green-800/30 px-1.5 rounded mt-0.5">
             WIN: ${(betAmount * multiplier).toFixed(2)}
           </span>
        </button>
      );
    }

    if (gameStatus === GameStatus.IDLE) {
        if (isBetting) {
            return (
                <button 
                  onClick={onCancelBet}
                  className={`${btnBaseClass} bg-red-600 hover:bg-red-500 text-white font-newspaper font-bold border-b-4 border-red-800`}
                >
                  <span className="text-base md:text-lg">CANCEL</span>
                  <div className="text-[8px] opacity-80 font-typewriter uppercase">Waiting...</div>
                </button>
              );
        }

        if (balance < betAmount) {
            return (
                <button 
                  disabled
                  className={`${btnBaseClass} bg-stone-400 text-stone-200 font-newspaper font-bold border-b-4 border-stone-500 cursor-not-allowed`}
                >
                  <span className="text-base md:text-lg uppercase tracking-tight">INSUFFICIENT</span>
                  <div className="text-[8px] font-typewriter text-stone-300 uppercase">Check Ledger</div>
                </button>
            );
        }

        return (
            <button 
              onClick={onPlaceBet}
              className={`${btnBaseClass} bg-stone-800 hover:bg-stone-700 text-[#f4f1ea] font-newspaper font-bold border-b-4 border-stone-950 group`}
            >
              <span className="text-base md:text-lg uppercase tracking-tight">BET <span className="text-green-400 font-black">${betAmount.toFixed(0)}</span></span>
              <div className="text-[8px] font-typewriter text-stone-400 group-hover:text-stone-300 uppercase">Click to start</div>
            </button>
        );
    }
    
    if (nextRoundBet > 0) {
         return (
             <div className={`${btnBaseClass} bg-amber-50 text-amber-900 font-newspaper font-bold border border-amber-300 border-dashed opacity-80 cursor-default`}>
                 <span className="text-[8px] uppercase">Queued</span>
                 <span className="text-base text-stone-900 tracking-tighter font-black">${nextRoundBet.toFixed(0)}</span>
             </div>
         )
    }

    if (balance < betAmount) {
        return (
            <button 
              disabled
              className={`${btnBaseClass} bg-stone-400 text-stone-200 font-newspaper font-bold border-b-4 border-stone-500 cursor-not-allowed`}
            >
              <span className="text-sm md:text-base uppercase">INSUFFICIENT</span>
              <div className="text-[8px] font-typewriter text-stone-300 opacity-90 uppercase">Check Ledger</div>
            </button>
        );
    }

    return (
        <button 
          onClick={onPlaceBet}
          className={`${btnBaseClass} bg-amber-500 hover:bg-amber-400 text-white font-newspaper font-bold border-b-4 border-amber-700`}
        >
          <span className="text-sm md:text-base uppercase">Bet Next</span>
          <div className="text-[8px] font-typewriter opacity-90">${betAmount.toFixed(0)}</div>
        </button>
    );
  };

  return (
    <div className="bg-[#e8e4d9] border-t-2 border-stone-800 p-2 md:p-3 shadow-md">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-2 md:gap-3 items-center">
        
        {/* Betting Panel */}
        <div className="w-full md:flex-1 bg-[#f4f1ea] p-2 border border-stone-400 rounded-md shadow-inner flex flex-col">
            <div className="flex justify-between items-center mb-0.5 px-1">
                <label className="text-[8px] font-bold font-typewriter text-stone-400 uppercase tracking-wider">Stake Control</label>
                <div className="text-[8px] font-typewriter text-stone-400">Bal: {balance.toFixed(2)} $BOA</div>
            </div>
            
            <div className="flex items-center gap-1">
                {/* Decrement Button */}
                <button 
                    onClick={handleDecrement}
                    className="w-10 h-8 md:h-10 bg-stone-200 border border-stone-400 rounded flex items-center justify-center hover:bg-stone-300 active:translate-y-0.5 transition-all"
                >
                    <span className="font-bold text-lg">-</span>
                </button>

                {/* Amount Display (Styled as Input) */}
                <div className="flex-1 flex items-center border-2 border-stone-800 bg-white rounded px-2 h-8 md:h-10 cursor-default select-none">
                    <span className="text-stone-400 font-bold mr-1 text-xs">$</span>
                    <div className="w-full font-typewriter text-sm md:text-lg font-bold text-stone-900">
                        {currentDisplayAmount.toFixed(2)}
                    </div>
                </div>

                {/* Increment Button */}
                <button 
                    onClick={handleIncrement}
                    className="w-10 h-8 md:h-10 bg-stone-200 border border-stone-400 rounded flex items-center justify-center hover:bg-stone-300 active:translate-y-0.5 transition-all"
                >
                    <span className="font-bold text-lg">+</span>
                </button>
            </div>
            
            <div
                className="flex gap-1 mt-1.5 overflow-x-auto no-scrollbar scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
            >
                <button 
                    onClick={handleClear}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 rounded text-[8px] font-bold font-typewriter py-1 active:bg-red-200 transition-colors whitespace-nowrap px-2 text-red-700"
                >
                    CLR
                </button>
                {quickBets.map(amt => (
                    <button 
                        key={amt}
                        onClick={() => handleQuickAdd(amt)}
                        className="flex-1 bg-stone-200 hover:bg-stone-300 border border-stone-300 rounded text-[8px] font-bold font-typewriter py-1 active:bg-stone-400 transition-colors whitespace-nowrap px-2"
                    >
                        + {amt}
                    </button>
                ))}
            </div>
        </div>

        {/* Action Button Area */}
        <div className="w-full md:w-1/3 flex flex-col justify-end">
            {renderButton()}
        </div>
      </div>
    </div>
  );
};

export default Controls;
