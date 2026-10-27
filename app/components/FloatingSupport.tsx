import { useState, useRef, useEffect } from "react";
import { IconMessage } from "./Icons";
import { useTheme } from "../contexts/ThemeContext";

export function FloatingSupport() {
  const supportUrl = "https://forms.gle/RHdMToAjVWAgxpB96"; // Production Support Link
  const { isNeoBrutalist } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  
  // Custom drag position (null means default responsive CSS corner position)
  const [hasCustomPosition, setHasCustomPosition] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Define event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMounted) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Get current bounding box
    if (buttonRef.current && !hasCustomPosition) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top });
      setHasCustomPosition(true);
      setDragStart({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    } else {
      setDragStart({
        x: clientX - position.x,
        y: clientY - position.y,
      });
    }
    
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isMounted) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      const dx = clientX - dragStart.x;
      const dy = clientY - dragStart.y;
      
      if (!isDragging && (Math.abs(dx - position.x) > 5 || Math.abs(dy - position.y) > 5)) {
        setIsDragging(true);
      }

      if (isDragging) {
        const x = Math.max(10, Math.min(window.innerWidth - 60, dx));
        const y = Math.max(10, Math.min(window.innerHeight - 60, dy));
        setPosition({ x, y });
        setHasCustomPosition(true);
      }
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };

    if (dragStart.x !== 0 || dragStart.y !== 0) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [dragStart, isDragging, position.x, position.y, isMounted]);

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
    }
  };

  if (!isMounted) return null;

  return (
    <div 
      ref={buttonRef}
      style={
        hasCustomPosition
          ? { left: `${position.x}px`, top: `${position.y}px`, right: 'auto', bottom: 'auto' }
          : undefined
      }
      className={`fixed z-[4000] touch-none select-none ${
        !hasCustomPosition ? "bottom-4 right-3 sm:bottom-6 sm:right-6" : ""
      }`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <a
        href={supportUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        title="Support & Feedback"
        className={`group relative flex items-center justify-center transition-all cursor-move ${
          isNeoBrutalist
            ? "w-11 h-11 sm:w-12 sm:h-12 bg-[#ffe600] text-black rounded-full border-[3px] border-black shadow-[3.5px_3.5px_0_#000] hover:bg-[#fed600] hover:shadow-[4.5px_4.5px_0_#000] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#000]"
            : "w-11 h-11 bg-[#181F2C] text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 border border-[#2E384D] hover:border-[#10B981]"
        }`}
      >
        <IconMessage className="w-5 h-5 sm:w-5.5 sm:h-5.5 pointer-events-none" />
        
        {/* Tooltip Label */}
        <span
          className={`absolute right-full mr-3 px-2.5 sm:px-3 py-1 sm:py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap ${
            isNeoBrutalist
              ? "rounded-[8px] bg-white text-black text-[10px] sm:text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0_#000]"
              : "rounded-[6px] bg-[#0E131F] text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-[#2E384D] shadow-xl"
          }`}
        >
          Support & Bugs
        </span>

        {/* Pulsing Notification Dot */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isNeoBrutalist ? "bg-[#ff0055]" : "bg-emerald-500"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              isNeoBrutalist
                ? "bg-[#ff0055] border-2 border-black"
                : "bg-emerald-500"
            }`}
          />
        </span>
      </a>
    </div>
  );
}
