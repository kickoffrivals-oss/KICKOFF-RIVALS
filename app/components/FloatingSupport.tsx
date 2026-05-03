import { useState, useRef, useEffect } from "react";
import { IconMessage } from "./Icons";

export function FloatingSupport() {
  const supportUrl = "https://forms.gle/RHdMToAjVWAgxpB96"; // Production Support Link
  const [isMounted, setIsMounted] = useState(false);
  
  // Position state (defaults to a neutral initial value for SSR)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // Initialize position on mount (avoid SSR hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
    setPosition({
      x: window.innerWidth - 65,
      y: window.innerHeight - 65
    });
  }, []);

  // Define event handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Only proceed if mounted (should always be true when interacting)
    if (!isMounted) return;
    
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    });
    setIsDragging(false); // Reset dragging state on start
  };

  useEffect(() => {
    if (!isMounted) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      const dx = clientX - dragStart.x;
      const dy = clientY - dragStart.y;
      
      // If we move more than a few pixels, consider it a drag
      if (!isDragging && (Math.abs(dx - position.x) > 5 || Math.abs(dy - position.y) > 5)) {
        setIsDragging(true);
      }

      if (isDragging) {
        // Keep within bounds
        const x = Math.max(10, Math.min(window.innerWidth - 60, dx));
        const y = Math.max(10, Math.min(window.innerHeight - 60, dy));
        setPosition({ x, y });
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

  // HYDRATION & HOOK RULES: 
  // All hooks MUST be called before this conditional return.
  if (!isMounted) return null;

  return (
    <div 
      ref={buttonRef}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }}
      className="fixed z-[4000] touch-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <a
        href={supportUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="group relative flex items-center justify-center w-11 h-11 bg-foreground text-background rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-transform border border-background/10 cursor-move"
      >
        <IconMessage className="w-5 h-5 pointer-events-none" />
        
        {/* Tooltip Label */}
        <span className="absolute right-full mr-4 px-3 py-1.5 rounded-xl bg-foreground text-background text-[9px] font-black uppercase tracking-widest italic opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-2xl border border-background/10">
          Support & Bugs
        </span>

        {/* Pulsing Notification Dot */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
        </span>
      </a>
    </div>
  );
}
