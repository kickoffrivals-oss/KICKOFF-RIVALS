import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { IconArrowLeft } from "../components/Icons";

export const Route = createFileRoute("/concepts")({
  component: ConceptsGalleryRoute,
});

const CONCEPTS = [
  {
    id: "concept-1",
    title: "Concept 1: Cyber-Stadium Arcade",
    subtitle: "Futuristic Esports Arena & Telemetry Pods",
    theme: "Cyberpunk / Esports Stadium",
    palette: ["#07070f", "#00f0ff", "#00ff66", "#ff007f"],
    tags: ["Neon Holograms", "Live Broadcast Ticker", "Esports Pods"],
    svgFile: "/concepts/lobby_concept1_cyber_stadium.svg",
    description:
      "Deep obsidian backdrop with electric cyan and lime neon glows. Live broadcast ticker across the top with 3D holographic pods for Virtual Football Pro and Daily Aviator.",
  },
  {
    id: "concept-2",
    title: "Concept 2: Retro-Arcade 80s Lounge",
    subtitle: "Nostalgic 16-Bit Synthwave & Mini Cabinets",
    theme: "80s/90s Synthwave Arcade",
    palette: ["#120524", "#ff007f", "#00f5d4", "#ffb703"],
    tags: ["Mini Arcade Cabinets", "CRT Scanlines", "Insert Coin"],
    svgFile: "/concepts/lobby_concept2_retro_arcade.svg",
    description:
      "Transforms the game selection into miniature nostalgic arcade cabinets with glowing marquees, pixel-art pitch markings, vector flight curves, and authentic 1P PLAY push buttons.",
  },
  {
    id: "concept-3",
    title: "Concept 3: Monaco Luxury VIP Lounge",
    subtitle: "Stealth Titanium & Satin Gold Foil",
    theme: "Monte Carlo Private VIP Suite",
    palette: ["#0a0b0e", "#d4af37", "#0b231a", "#9ca3af"],
    tags: ["Titanium Cards", "Gold Foil Emblems", "VIP Concierge"],
    svgFile: "/concepts/lobby_concept3_luxury_vip.svg",
    description:
      "High-roller luxury salon aesthetic. Games are styled as weighted titanium VIP access cards with embossed gold foil crests, refined odds ribbons, and velvet textures.",
  },
  {
    id: "concept-4",
    title: "Concept 4: Neo-Brutalist Streetwear Pop",
    subtitle: "Bold Manga Energy & Offset Drop Shadows",
    theme: "Neo-Brutalism / Web3 Streetwear",
    palette: ["#ffe600", "#ff3366", "#000000", "#ffffff"],
    tags: ["Chunky 3.5px Outlines", "5px Hard Shadows", "Manga Speed Lines"],
    svgFile: "/concepts/lobby_concept4_neobrutalist_pop.svg",
    description:
      "High-voltage pop art streetwear design. Stark white and electric canary yellow cards with solid 3.5px black outlines, 5px offset hard shadows, and physical tactile buttons.",
  },
];

function ConceptsGalleryRoute() {
  const navigate = useNavigate();
  const [selectedConcept, setSelectedConcept] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"grid" | "focus">("grid");

  const current = CONCEPTS[selectedConcept];

  return (
    <div className="min-h-screen bg-[#070512] text-white flex flex-col font-sans selection:bg-[#00f0ff] selection:text-slate-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0e0c22]/90 backdrop-blur-md border-b border-[#231f47] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/play" })}
            className="px-2.5 py-1 rounded bg-[#161233] hover:bg-[#201a47] border border-[#2c2459] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
          >
            <IconArrowLeft className="w-3.5 h-3.5" />
            <span>Back to /play</span>
          </button>
          <div className="h-4 w-px bg-[#26204d]" />
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
              Root (/) &amp; /play — 4 UI/UX Design Concepts
            </h1>
            <p className="text-[11px] font-mono text-slate-400">
              High-fidelity visual design mockups to replace the generic lobby
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-[#13102a] p-1 rounded-[8px] border border-[#26204d] text-xs font-mono">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 rounded-[6px] transition-colors cursor-pointer font-bold ${
              viewMode === "grid"
                ? "bg-[#3b82f6] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Quad Grid View
          </button>
          <button
            onClick={() => setViewMode("focus")}
            className={`px-3 py-1 rounded-[6px] transition-colors cursor-pointer font-bold ${
              viewMode === "focus"
                ? "bg-[#3b82f6] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Single Focus View
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {viewMode === "grid" ? (
          /* 4-Concept Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {CONCEPTS.map((concept, index) => (
              <div
                key={concept.id}
                onClick={() => {
                  setSelectedConcept(index);
                  setViewMode("focus");
                }}
                className="group bg-[#110e28] border-2 border-[#26204d] hover:border-[#00f0ff] rounded-[20px] p-3 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] hover:-translate-y-1 cursor-pointer"
              >
                {/* Concept Header */}
                <div className="mb-3 px-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      {concept.theme}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                  </div>
                  <h3 className="text-base font-black text-white group-hover:text-[#00f0ff] transition-colors">
                    {concept.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{concept.subtitle}</p>
                </div>

                {/* Scalable SVG Mockup Display */}
                <div className="w-full aspect-[450/920] bg-[#080712] rounded-[14px] overflow-hidden border border-[#1f1a3d] shadow-inner mb-3">
                  <img
                    src={concept.svgFile}
                    alt={concept.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Tags & Action */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-1">
                    {concept.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#181438] text-slate-300 border border-[#2b245e]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConcept(index);
                      setViewMode("focus");
                    }}
                    className="w-full py-2 rounded-[8px] bg-[#1a1638] hover:bg-[#00f0ff] hover:text-slate-950 text-white border border-[#2a2357] text-xs font-mono font-bold transition-all text-center"
                  >
                    Inspect Full Design 🔍
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single Focus View with Detail Sidebar */
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Left: Interactive Tab Switcher & Specs */}
            <div className="w-full lg:w-[380px] bg-[#110e28] border border-[#26204d] rounded-[20px] p-5 space-y-5 shrink-0">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#00f0ff]">
                  Select Concept to Inspect:
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {CONCEPTS.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConcept(idx)}
                      className={`p-2.5 rounded-[10px] border text-left text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedConcept === idx
                          ? "bg-[#3b82f6] text-white border-[#60a5fa] shadow-lg"
                          : "bg-[#181438] text-slate-400 hover:text-white border-[#2b245e]"
                      }`}
                    >
                      <div>Concept #{idx + 1}</div>
                      <div className="text-[10px] opacity-80 truncate">{c.theme}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#26204d] space-y-3">
                <div>
                  <h2 className="text-xl font-black text-white">{current.title}</h2>
                  <p className="text-sm font-semibold text-[#00f0ff] mt-0.5">{current.subtitle}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{current.description}</p>

                {/* Color Palette Swatches */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Color Palette:
                  </span>
                  <div className="flex items-center gap-2">
                    {current.palette.map((hex, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div
                          className="w-7 h-7 rounded-[6px] border border-white/20 shadow-md"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-[9px] font-mono text-slate-400">{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Key Features:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {current.tags.map((tag, i) => (
                      <li key={i}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right: High-Res Scalable Mockup Canvas */}
            <div className="flex-1 flex flex-col items-center justify-center bg-[#070512] rounded-[24px] border border-[#231f47] p-4 sm:p-8 shadow-2xl">
              <div className="w-full max-w-[420px] aspect-[450/920] bg-[#0c0a1d] rounded-[38px] border-4 border-[#231f47] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden">
                <img
                  src={current.svgFile}
                  alt={current.title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ConceptsGalleryRoute;
