import { useState, useEffect } from "react";
import { openLegalModal } from "./LegalModal";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Do not display on pure in-game views
      const path = window.location.pathname;
      if (path.startsWith("/games/")) {
        return;
      }

      const consent = localStorage.getItem("cookie_consent_status");
      if (!consent) {
        // Show after a gentle 1 second delay
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie_consent_status", "all");
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem("cookie_consent_status", "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-120 animate-in slide-in-from-bottom duration-300"
    >
      <div className="bg-white border-[3.5px] border-black rounded-[16px] p-4 shadow-[6px_6px_0_#000] text-black">
        <div className="flex items-start gap-2.5 mb-2">
          <span className="text-2xl shrink-0">🍪</span>
          <div>
            <h4 className="font-black text-sm uppercase tracking-tight">
              COOKIE & PRIVACY PREFERENCES
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
              We use essential cookies and local storage to store your UI theme preference (Neo-Brutalist vs Classic), preserve your active session, and ensure provably fair simulation mechanics.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t-2 border-slate-200">
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-1.5 px-3 rounded-[8px] bg-[#00ff66] hover:bg-[#05f062] border-[2px] border-black font-black text-xs uppercase tracking-wider text-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            ACCEPT ALL
          </button>
          <button
            onClick={handleEssentialOnly}
            className="py-1.5 px-3 rounded-[8px] bg-white hover:bg-slate-100 border-[2px] border-black font-black text-xs uppercase text-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            ESSENTIAL ONLY
          </button>
          <button
            onClick={() => openLegalModal("cookies")}
            className="text-[11px] font-mono font-bold text-slate-600 underline hover:text-black ml-auto cursor-pointer"
          >
            Settings
          </button>
        </div>
      </div>
    </aside>
  );
}
