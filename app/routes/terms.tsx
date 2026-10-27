import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LEGAL_DOCS } from "../components/legal/legalContent";
import { LegalFooter } from "../components/legal/LegalFooter";

export const Route = createFileRoute("/terms")({
  component: TermsRoute,
});

function TermsRoute() {
  const navigate = useNavigate();
  const doc = LEGAL_DOCS.terms;

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans flex flex-col justify-between selection:bg-[#ffe600] selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b-[3.5px] border-black px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#ffe600] border-[2.5px] border-black font-mono font-black text-xs uppercase shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        >
          <span>← BACK TO HOME</span>
        </button>
        <span className="font-mono font-black text-xs uppercase tracking-wider text-slate-700">
          LEGAL REPOSITORY
        </span>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1">
        <div className="bg-white border-[3.5px] border-black rounded-[20px] p-6 sm:p-10 shadow-[8px_8px_0_#000] space-y-6">
          <div className="border-b-3 border-black pb-4">
            <span className="px-2.5 py-0.5 rounded-[6px] bg-[#ff3366] text-white border-[2px] border-black text-[11px] font-mono font-black uppercase shadow-[1.5px_1.5px_0_#000]">
              {doc.badge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-2 text-black">
              {doc.title}
            </h1>
            <p className="text-xs font-mono font-bold text-slate-500 mt-1">
              Last Updated: {doc.lastUpdated} • KickOff Rivals Protocol
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
            {doc.content.split("\n\n").map((paragraph, idx) => {
              if (paragraph.startsWith("### ")) {
                return (
                  <h2
                    key={idx}
                    className="font-black text-base sm:text-lg text-black pt-3 uppercase tracking-wide border-l-4 border-black pl-3"
                  >
                    {paragraph.replace("### ", "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("* ")) {
                return (
                  <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2">
                    {paragraph.split("\n").map((line, lidx) => (
                      <li key={lidx}>
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
                <p key={idx}>
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
      </main>

      <LegalFooter variant="neobrutalist" />
    </div>
  );
}
