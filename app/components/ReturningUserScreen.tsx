import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { RivalsLogo } from "./RivalsLogo";
import { IconTrophy, IconChevronRight, IconTrendingUp } from "./Icons";

interface ReturningUserScreenProps {
    username: string;
    onProceed: () => void;
    // We can add optional props for stats if available immediately,
    // or fetch them/use context within the component.
    // For now, let's assume we might pass basic stats or fetch them.
    // Let's keep it simple for the initial structure.
    coins?: number;
    korBalance?: number;
}

export function ReturningUserScreen({
    username,
    onProceed,
    coins = 0,
    korBalance = 0,
}: ReturningUserScreenProps) {
    const [showStats, setShowStats] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => setShowStats(true), 500);
        const timer2 = setTimeout(() => setAnimationComplete(true), 1200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            {/* Subtle animated background (calmer than new user screen) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            {/* Header */}
            <header className="relative z-10 p-6">
                <RivalsLogo size="md" variant="full" className="text-white" />
            </header>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="max-w-md w-full text-center">
                    {/* Welcome Back Icon */}
                    <div className="flex justify-center mb-6 animate-bounce-subtle">
                        <div className="p-6 rounded-full bg-slate-800/80 shadow-lg shadow-primary/20 border border-slate-700">
                            <IconTrophy className="w-16 h-16 text-primary" />
                        </div>
                    </div>

                    {/* Welcome Message */}
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 animate-fade-in">
                        Welcome Back!
                    </h1>

                    <p className="text-xl text-slate-300 mb-2 animate-fade-in">
                        {username}
                    </p>

                    <p className="text-slate-400 mb-8 animate-fade-in">
                        Ready to jump back into the action?
                    </p>

                    {/* User Snapshot / Quick Stats */}
                    {showStats && (
                        <div className="bg-slate-800/60 border border-slate-700 backdrop-blur-sm rounded-xl p-6 mb-8 animate-slide-up transform transition-all duration-500 hover:border-slate-600">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <IconTrendingUp className="w-4 h-4 text-emerald-400" />
                                    Your Current Balance
                                </h3>
                            </div>

                            <div className="text-center py-2">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coins</span>
                                    <span className="px-1.5 py-0.5 rounded-[4px] bg-[#ff3366] text-white text-[10px] font-black leading-none">
                                        KOR
                                    </span>
                                </div>
                                <p className="text-4xl font-black font-mono text-amber-400 tabular-nums">
                                    {(korBalance || coins || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider mt-1">
                                    Unified Platform Balance
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CTA Button */}
                    {animationComplete && (
                        <button
                            onClick={onProceed}
                            className={cn(
                                "btn btn-primary w-full h-14 font-semibold text-lg",
                                "hover:scale-[1.02] transition-all duration-300",
                                "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
                                "animate-fade-in"
                            )}
                        >
                            Continue to Dashboard
                            <IconChevronRight className="w-5 h-5 ml-2" />
                        </button>
                    )}

                    {/* Quick Tip */}
                    <div className="mt-8 text-slate-500 text-sm animate-fade-in delay-200">
                        <p>New events are live! Check the quests tab.</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 p-6 text-center text-slate-600 text-xs">
                Play responsibly. Virtual currency only.
            </footer>
        </div>
    );
}
