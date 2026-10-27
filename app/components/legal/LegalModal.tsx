import { useState, useEffect } from "react";
import { LEGAL_DOCS, LegalSection } from "./legalContent";

export function LegalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof typeof LEGAL_DOCS>("terms");

  useEffect(() => {
    const handleOpen = (e: CustomEvent<{ tab?: keyof typeof LEGAL_DOCS }>) => {
      if (e.detail?.tab && LEGAL_DOCS[e.detail.tab]) {
        setActiveTab(e.detail.tab);
      }
      setIsOpen(true);
    };

    window.addEventListener("open-legal-modal" as any, handleOpen as any);
    return () => {
      window.removeEventListener("open-legal-modal" as any, handleOpen as any);
    };
  }, []);

  if (!isOpen) return null;

  const currentDoc: LegalSection = LEGAL_DOCS[activeTab] || LEGAL_DOCS.terms;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-[3.5px] border-black rounded-[20px] shadow-[8px_8px_0_#000] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-black font-sans">
        {/* Top Header */}
        <div className="bg-[#ffe600] border-b-[3.5px] border-black px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <div>
              <h2 className="font-black text-base sm:text-lg tracking-tight uppercase leading-tight">
                LEGAL & COMPLIANCE
              </h2>
              <p className="text-[10px] font-mono font-bold text-slate-800">
                KICKOFF RIVALS PROTOCOL • SIMULATION GOVERNANCE
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-[8px] bg-white hover:bg-slate-100 border-[2px] border-black font-black text-black text-sm flex items-center justify-center shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Bar */}
        <div
          className="bg-slate-100 border-b-[2.5px] border-black px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-hide shrink-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {[
            { id: "terms", label: "Terms of Service" },
            { id: "privacy", label: "Privacy Policy" },
            { id: "cookies", label: "Cookie Policy" },
            { id: "responsible", label: "Responsible 18+" },
            { id: "fairness", label: "Provably Fair" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-mono font-black uppercase whitespace-nowrap transition-all border-[2px] cursor-pointer ${
                activeTab === tab.id
                  ? "bg-black text-white border-black shadow-[2px_2px_0_#ffe600]"
                  : "bg-white text-slate-700 border-black hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Document Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
            <div>
              <span className="px-2.5 py-0.5 rounded-[6px] bg-[#ff3366] text-white border-[1.5px] border-black font-mono font-black text-[10px] uppercase">
                {currentDoc.badge}
              </span>
              <h3 className="font-black text-lg sm:text-xl text-black mt-1">
                {currentDoc.title}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-bold">
              Updated: {currentDoc.lastUpdated}
            </span>
          </div>

          <div className="space-y-4 text-slate-800 font-sans">
            {currentDoc.content.split("\n\n").map((paragraph, idx) => {
              if (paragraph.startsWith("### ")) {
                return (
                  <h4
                    key={idx}
                    className="font-black text-sm sm:text-base text-black pt-2 uppercase tracking-wide border-l-4 border-black pl-2.5"
                  >
                    {paragraph.replace("### ", "")}
                  </h4>
                );
              }
              if (paragraph.startsWith("* ")) {
                return (
                  <ul key={idx} className="list-disc list-inside space-y-1 pl-2">
                    {paragraph.split("\n").map((line, lidx) => (
                      <li key={lidx} className="leading-relaxed">
                        {line.replace("* ", "").split("**").map((part, pidx) =>
                          pidx % 2 === 1 ? (
                            <strong key={pidx} className="font-bold text-black">
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="leading-relaxed">
                  {paragraph.split("**").map((part, pidx) =>
                    pidx % 2 === 1 ? (
                      <strong key={pidx} className="font-bold text-black">
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t-[3.5px] border-black p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] font-mono text-slate-600 font-bold text-center sm:text-left">
            Simulation Gaming Disclaimer • Virtual Coins KOR have no fiat monetary value.
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto px-5 py-2 rounded-[10px] bg-[#00ff66] hover:bg-[#05f062] border-[2.5px] border-black text-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            I UNDERSTAND & AGREE
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper to dispatch open event from anywhere in the app
 */
export function openLegalModal(tab: "terms" | "privacy" | "cookies" | "responsible" | "fairness" = "terms") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-legal-modal", { detail: { tab } })
    );
  }
}
