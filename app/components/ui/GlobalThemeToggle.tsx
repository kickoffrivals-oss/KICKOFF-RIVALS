import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { soundFx } from "../../lib/soundFx";

export function GlobalThemeToggle() {
  const { toggleTheme, isNeoBrutalist } = useTheme();

  const asideRef = useRef<HTMLElement>(null);
  const [topPos, setTopPos] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartYRef = useRef(0);
  const dragStartElementTopRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  // Restore saved vertical position on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kor_theme_toggle_y");
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed)) {
          const maxTop = window.innerHeight - 70;
          setTopPos(Math.max(55, Math.min(parsed, maxTop)));
        }
      }
    } catch {}
  }, []);

  // Re-clamp position on window resize or orientation changes
  useEffect(() => {
    const handleResize = () => {
      setTopPos((prev) => {
        if (prev === null) return null;
        const maxTop = window.innerHeight - 70;
        return Math.max(55, Math.min(prev, maxTop));
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only accept primary button (touch or left mouse click)
    if (e.button !== 0) return;

    const el = asideRef.current;
    if (!el) return;

    dragStartYRef.current = e.clientY;
    dragStartElementTopRef.current = el.getBoundingClientRect().top;
    isDraggingRef.current = true;
    hasMovedRef.current = false;

    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaY = e.clientY - dragStartYRef.current;

    // Movement threshold before treating gesture as a drag
    if (Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
      if (!isDragging) {
        setIsDragging(true);
      }
    }

    if (hasMovedRef.current) {
      const elHeight = asideRef.current?.offsetHeight || 44;
      const minTop = 55; // Keep below header / top status bar
      const maxTop = Math.max(minTop, window.innerHeight - elHeight - 16); // Keep above bottom bar
      const newTop = Math.max(minTop, Math.min(dragStartElementTopRef.current + deltaY, maxTop));
      setTopPos(newTop);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      asideRef.current?.releasePointerCapture(e.pointerId);
    } catch {}

    // Persist position if moved
    if (hasMovedRef.current && topPos !== null) {
      try {
        localStorage.setItem("kor_theme_toggle_y", String(topPos));
      } catch {}
    }

    // Delay resetting hasMovedRef so any subsequent synthetic click event is caught and blocked
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 120);
  };

  const handleToggle = () => {
    if (hasMovedRef.current) return;
    try {
      soundFx.playClick();
    } catch {}
    toggleTheme();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    handleToggle();
  };

  return (
    <aside
      ref={asideRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="Theme switcher (draggable up or down)"
      style={
        topPos !== null
          ? { top: `${topPos}px`, bottom: "auto" }
          : undefined
      }
      className={`fixed ${
        topPos === null ? "bottom-4 sm:bottom-6" : ""
      } left-3 sm:left-6 z-[9999] print:hidden select-none touch-none ${
        isDragging ? "cursor-grabbing opacity-95 scale-105 transition-none" : "cursor-grab"
      } max-w-[calc(100vw-85px)] sm:max-w-none pb-[env(safe-area-inset-bottom)]`}
    >
      {isNeoBrutalist ? (
        <>
          {/* ====================================================================
             MOBILE VIEW: BUTTON ONLY (< sm)
             Draggable up/down with subtle vertical grip indicator
          ==================================================================== */}
          <button
            type="button"
            onClick={handleClick}
            className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#ffe600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-grab active:cursor-grabbing select-none"
            title="Tap to switch UI • Drag up/down to adjust position"
          >
            <span className="text-[10px] opacity-45 font-mono tracking-tighter" aria-hidden="true">
              ⋮⋮
            </span>
            <span>Classic</span>
            <span className="text-xs">🏛️</span>
          </button>

          {/* ====================================================================
             DESKTOP VIEW: FULL PILL BANNER (>= sm)
             Includes grip handle, icon, theme name, active badge, and action button
          ==================================================================== */}
          <div
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggle();
              }
            }}
            className="hidden sm:flex items-center gap-2.5 p-2 pr-3 rounded-[14px] bg-[#ffe600] text-black border-[3px] border-black shadow-[4px_4px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#000] transition-all cursor-grab active:cursor-grabbing font-sans select-none"
          >
            {/* Grip handle */}
            <span className="text-xs opacity-40 font-mono tracking-tighter pl-0.5" aria-hidden="true" title="Drag to adjust">
              ⋮⋮
            </span>

            {/* 1. Icon */}
            <div className="w-9 h-9 rounded-[10px] bg-white border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0_#000] shrink-0 text-lg">
              <span className="transform group-hover:scale-110 transition-transform">⚡</span>
            </div>

            {/* 2. Text */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-black tracking-tight uppercase leading-tight truncate">
                  Neo-Brutalist
                </span>
                <span className="text-[10px] font-mono font-black bg-black text-[#ffe600] px-1.5 py-0.2 rounded border border-black leading-none">
                  ACTIVE
                </span>
              </div>
              <span className="text-[10px] font-bold text-black/75 leading-tight">
                Streetwear Pop Theme
              </span>
            </div>

            {/* 3. Action Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              className="px-2.5 py-1 rounded-[8px] bg-black text-white hover:bg-slate-900 border-2 border-black font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0_#fff] active:scale-95 transition-all cursor-pointer shrink-0 ml-1"
              title="Switch to Classic UI"
            >
              <span>Classic</span>
              <span className="text-xs">🏛️</span>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ====================================================================
             MOBILE VIEW: BUTTON ONLY (< sm)
             Draggable up/down with subtle vertical grip indicator
          ==================================================================== */}
          <button
            type="button"
            onClick={handleClick}
            className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-[#10B981] hover:bg-[#059669] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#10B981]/25 border border-[#10B981] active:scale-95 transition-transform cursor-grab active:cursor-grabbing select-none"
            title="Tap to switch UI • Drag up/down to adjust position"
          >
            <span className="text-[10px] opacity-60 font-mono tracking-tighter" aria-hidden="true">
              ⋮⋮
            </span>
            <span>NEO</span>
            <span className="text-xs">⚡</span>
          </button>

          {/* ====================================================================
             DESKTOP VIEW: FULL PILL BANNER (>= sm)
             Includes grip handle, icon, theme name, active badge, and action button
          ==================================================================== */}
          <div
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggle();
              }
            }}
            className="hidden sm:flex items-center gap-2.5 p-2 pr-3 rounded-[12px] bg-[#181F2C]/95 backdrop-blur-md text-white border border-[#2E384D] hover:border-[#10B981] shadow-2xl transition-all cursor-grab active:cursor-grabbing font-sans select-none"
          >
            {/* Grip handle */}
            <span className="text-xs opacity-40 font-mono tracking-tighter pl-0.5 text-slate-400" aria-hidden="true" title="Drag to adjust">
              ⋮⋮
            </span>

            {/* 1. Icon */}
            <div className="w-9 h-9 rounded-[8px] bg-[#0E131F] border border-[#2A3449] flex items-center justify-center text-emerald-400 shrink-0 text-lg">
              <span className="transform group-hover:scale-110 transition-transform">🏛️</span>
            </div>

            {/* 2. Text */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                  Classic UI
                </span>
                <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded border border-[#10B981]/30 leading-none">
                  ACTIVE
                </span>
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">
                Standard Sportsbook
              </span>
            </div>

            {/* 3. Action Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              className="px-2.5 py-1 rounded-[6px] bg-[#10B981] hover:bg-[#059669] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-[#10B981]/20 active:scale-95 transition-all cursor-pointer shrink-0 ml-1"
              title="Switch to Neo-Brutalist"
            >
              <span>Neo</span>
              <span className="text-xs">⚡</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

export default GlobalThemeToggle;
