
import React, { useEffect, useState, useMemo } from 'react';
import { GameStatus } from '../types';

interface GameCanvasProps {
  status: GameStatus;
  multiplier: number;
  countdown: number;
  width: number;
  height: number;
}

const CloudPath = "M25,60 Q35,50 50,55 Q60,40 80,45 Q95,40 110,60 Q120,65 115,80 Q110,95 90,90 Q80,100 60,95 Q45,100 30,90 Q10,95 15,75 Q10,65 25,60 Z";

const GameCanvas: React.FC<GameCanvasProps> = ({ status, multiplier, countdown, width, height }) => {
  const [dots, setDots] = useState<{x: number, y: number}[]>([]);
  const [particles, setParticles] = useState<{id: number, x: number, y: number, vx: number, vy: number, size: number}[]>([]);
  
  const clouds = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      xStart: Math.random() * 100,
      y: 5 + Math.random() * 50,
      scale: 0.8 + Math.random() * 1.2,
      opacity: 0.2 + Math.random() * 0.3,
      duration: 25 + Math.random() * 30,
      delay: -Math.random() * 60
    }));
  }, []);

  const getPosition = (m: number) => {
    const startX = width * 0.1;
    const startY = height * 0.75;

    if (m <= 1.0) return { x: startX, y: startY };
    
    const maxX = width * 0.88;
    const minX = startX;
    
    const xProgress = 1 - (1 / (Math.log(m) + 1));
    const x = minX + (maxX - minX) * xProgress;
    
    const maxY = startY;
    const minY = height * 0.12;
    
    const yProgress = 1 - (1 / m);
    const y = maxY - (maxY - minY) * yProgress;

    return { x, y };
  };

  const pos = getPosition(multiplier);

  // Handle Crash Particles
  useEffect(() => {
    if (status === GameStatus.CRASHED) {
      const newParticles = Array.from({ length: 25 }).map((_, i) => ({
        id: Date.now() + i,
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        size: 2 + Math.random() * 6
      }));
      setParticles(newParticles);
      
      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [status]);

  useEffect(() => {
    if (status === GameStatus.IDLE) {
      setDots([]);
    }
  }, [status]);

  useEffect(() => {
    if (status === GameStatus.FLYING) {
      setDots(prev => {
        const last = prev[prev.length - 1];
        // Ensure smooth but distinct dots for performance
        if (!last || Math.hypot(last.x - pos.x, last.y - pos.y) > 6) {
          return [...prev, pos];
        }
        return prev;
      });
    }
  }, [multiplier, pos.x, pos.y, status]);

  const trajectoryPath = useMemo(() => {
    if (dots.length === 0) return "";
    let d = `M ${dots[0].x},${dots[0].y}`;
    for (let i = 1; i < dots.length; i++) {
        d += ` L ${dots[i].x},${dots[i].y}`;
    }
    if (status === GameStatus.FLYING) {
        d += ` L ${pos.x},${pos.y}`;
    }
    return d;
  }, [dots, pos, status]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#f9f7f1] select-none ${status === GameStatus.CRASHED ? 'animate-shake' : ''}`}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-2px, -1px); }
          20%, 40%, 60%, 80% { transform: translate(2px, 1px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out both; }
        
        @keyframes strobe {
          0% { background-color: rgba(185, 28, 28, 0.4); }
          100% { background-color: transparent; }
        }
        .crash-strobe { animation: strobe 0.6s ease-out forwards; position: absolute; inset: 0; pointer-events: none; z-index: 40; }

        @keyframes burst {
          from { transform: translate(0,0) scale(1); opacity: 1; }
          to { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        .particle { animation: burst 1.2s cubic-bezier(0, 0, 0.2, 1) forwards; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        .animate-float { animation: float 1.8s ease-in-out infinite; }
        
        @keyframes drift {
          from { transform: translateX(120%); }
          to { transform: translateX(-120%); }
        }
        .animate-drift { animation: drift linear infinite; }

        @media (max-width: 768px) {
          .plane-wrapper { transform: scale(1.6); }
          .axis-text { font-size: 16px !important; }
        }
        @media (min-width: 769px) {
          .plane-wrapper { transform: scale(1.0); }
        }
      `}</style>

      {status === GameStatus.CRASHED && <div className="crash-strobe" />}

      {/* Grid Layer */}
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Clouds */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        {clouds.map((cloud) => (
             <div key={cloud.id} className="absolute animate-drift" style={{
                    top: `${cloud.y}%`,
                    left: 0,
                    width: '100px',
                    height: '60px',
                    animationDuration: `${cloud.duration}s`,
                    animationDelay: `${cloud.delay}s`,
                    opacity: cloud.opacity,
                    transform: `scale(${cloud.scale})`
                }}>
                <svg viewBox="0 0 150 120" width="100%" height="100%"><path d={CloudPath} fill="#fff" stroke="#ccc" strokeWidth="2" /></svg>
             </div>
        ))}
      </div>

      {/* Main Game Elements */}
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="xMidYMid meet">
        {/* Trait Path */}
        <path 
          d={trajectoryPath} 
          fill="none" 
          stroke="#1c1917" 
          strokeWidth="3" 
          strokeDasharray="10,8" 
          strokeLinecap="round" 
          className="opacity-40" 
        />
        
        {/* Particles */}
        {particles.map((p) => (
          <rect
            key={p.id}
            x={p.x}
            y={p.y}
            width={p.size}
            height={p.size}
            fill="#b91c1c"
            className="particle"
            style={{ 
              '--tx': `${p.vx * 18}px`, 
              '--ty': `${p.vy * 18}px` 
            } as React.CSSProperties}
          />
        ))}

        {/* Match the uploaded red prop aircraft aesthetic */}
        <g transform={`translate(${pos.x}, ${pos.y}) rotate(${-15}) scale(0.92)`}>
          <defs>
            <linearGradient id="planeBodyRed" x1="0" x2="1">
              <stop offset="0%" stopColor="#ec2b2b" />
              <stop offset="45%" stopColor="#d40d1c" />
              <stop offset="100%" stopColor="#a10011" />
            </linearGradient>
            <linearGradient id="planeTopRed" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ff7a66" />
              <stop offset="100%" stopColor="#d61a1a" />
            </linearGradient>
            <linearGradient id="planeMetal" x1="0" x2="1">
              <stop offset="0%" stopColor="#d9dee4" />
              <stop offset="100%" stopColor="#7a7f87" />
            </linearGradient>
          </defs>
          <g className="plane-wrapper">
            <g className={status === GameStatus.FLYING ? "animate-float" : ""}>
              <ellipse cx="18" cy="34" rx="130" ry="26" fill="rgba(0,0,0,0.16)" />

              <g transform="translate(0,0)">
                <path d="M-124 22 L-70 8 L24 0 L170 12 L214 28 L190 46 L36 50 L-54 42 L-124 22 Z" fill="url(#planeBodyRed)" stroke="#130d13" strokeWidth="4" strokeLinejoin="round" />
                <path d="M-54 16 L-38 7 L68 -6 L178 8 L168 24 L66 28 L-34 27 L-54 16 Z" fill="url(#planeTopRed)" opacity="0.9" />

                <path d="M-32 24 L-170 70 L-92 90 L28 52 Z" fill="url(#planeBodyRed)" stroke="#130d13" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M24 22 L118 72 L212 42 L92 10 Z" fill="url(#planeBodyRed)" stroke="#130d13" strokeWidth="4" strokeLinejoin="round"/>

                <path d="M-96 14 L-148 -46 L-86 -20 L-26 12 Z" fill="url(#planeBodyRed)" stroke="#130d13" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M-72 22 L-100 48" stroke="#3d1a1a" strokeWidth="4" strokeLinecap="round" opacity="0.65"/>

                <path d="M138 17 L190 24 L180 34 L134 28 Z" fill="#f5f2ea" opacity="0.8"/>
                <path d="M108 20 L134 22 L124 48 L96 46 Z" fill="#f0efe9" opacity="0.8"/>
                <path d="M136 12 L166 16 L152 38 L126 34 Z" fill="#d8d6d2" opacity="0.6"/>

                <circle cx="167" cy="20" r="20" fill="#0f1115" stroke="#2d2d2d" strokeWidth="4"/>
                <circle cx="167" cy="20" r="9" fill="#2f2f34"/>

                <path d="M160 20 L116 -18 L140 -5 L167 20 Z" fill="#e9edef" stroke="#1b1d20" strokeWidth="2"/>
                <path d="M160 20 L98 58 L130 38 L167 20 Z" fill="#e9edef" stroke="#1b1d20" strokeWidth="2"/>
                <path d="M160 20 L204 -6 L176 16 L167 20 Z" fill="#eaf0f5" stroke="#1b1d20" strokeWidth="2"/>
                <path d="M160 20 L206 58 L182 40 L167 20 Z" fill="#eaf0f5" stroke="#1b1d20" strokeWidth="2"/>

                <path d="M25 46 L10 90" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
                <path d="M28 48 L96 90" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
                <path d="M-50 38 L-70 92" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
                <path d="M-44 39 L20 92" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>

                <g transform="translate(18,93)">
                  <circle r="15" fill="#140f12" stroke="#2a2a2a" strokeWidth="3"/>
                  <circle r="7" fill="#d11f23" stroke="#5a0d10" strokeWidth="3"/>
                </g>
                <g transform="translate(-62,96)">
                  <circle r="15" fill="#140f12" stroke="#2a2a2a" strokeWidth="3"/>
                  <circle r="7" fill="#d11f23" stroke="#5a0d10" strokeWidth="3"/>
                </g>

                <path d="M-20 20 L-8 9" stroke="#1d1d1d" strokeWidth="3" strokeLinecap="round"/>
                <path d="M-52 18 L-40 11" stroke="#1d1d1d" strokeWidth="3" strokeLinecap="round"/>

                <path d="M-160 14 L-176 6" stroke="#1d1d1d" strokeWidth="3" strokeLinecap="round"/>
              </g>

              {status === GameStatus.CRASHED && (
                <g>
                  <path d="M-20 -10 L120 110 M120 -10 L-20 110" stroke="#b91c1c" strokeWidth="10" strokeLinecap="round" />
                </g>
              )}
            </g>
          </g>
        </g>
        
        {/* Axes Labels */}
        <text x="15" y={height - 15} className="font-typewriter axis-text fill-stone-400 font-bold uppercase">1.0X</text>
        <text x={width - 70} y={height - 15} className="font-typewriter axis-text fill-stone-400 font-bold uppercase tracking-tighter">Distance</text>
      </svg>

      {/* UI Overlays */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        {status === GameStatus.IDLE && (
           <div className="text-center bg-[#f4f1ea]/95 p-4 rounded-lg border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] scale-75 md:scale-100">
             <div className="font-newspaper text-stone-900 text-sm md:text-base mb-1 uppercase font-black border-b border-stone-900 pb-0.5 tracking-tight">Daily Prep</div>
             <div className="font-doodle text-5xl md:text-7xl text-stone-900">{countdown}</div>
             <div className="bg-stone-900 text-stone-100 px-3 py-1 font-typewriter rounded mt-2 uppercase text-[8px] tracking-widest">Awaiting Launch</div>
           </div>
        )}
        {status === GameStatus.FLYING && (
          <div className="font-newspaper font-black text-stone-900 drop-shadow-xl z-10 tabular-nums text-5xl md:text-8xl">
             {multiplier.toFixed(2)}<span className="text-lg md:text-2xl text-stone-400 italic ml-1">x</span>
          </div>
        )}
        {status === GameStatus.CRASHED && (
          <div className="text-center transform rotate-[-2deg] z-20">
             <div className="font-doodle text-5xl md:text-7xl text-[#b91c1c] border-4 border-[#b91c1c] p-2 bg-[#f4f1ea] shadow-[4px_4px_0px_0px_rgba(185,28,28,0.15)]">CRASHED</div>
             <div className="mt-2 inline-block bg-stone-900 text-[#f4f1ea] px-4 py-1 font-newspaper text-xl font-bold rounded uppercase tracking-tighter italic">Result: {multiplier.toFixed(2)}x</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;
