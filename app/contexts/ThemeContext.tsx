import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type UITheme = "neobrutalist" | "classic";

interface ThemeContextType {
  theme: UITheme;
  setTheme: (theme: UITheme) => void;
  toggleTheme: () => void;
  isNeoBrutalist: boolean;
  isClassic: boolean;
}

const THEME_STORAGE_KEY = "app_ui_theme";

const ThemeContext = createContext<ThemeContextType>({
  theme: "neobrutalist",
  setTheme: () => {},
  toggleTheme: () => {},
  isNeoBrutalist: true,
  isClassic: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<UITheme>("neobrutalist");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as UITheme | null;
      if (saved === "classic" || saved === "neobrutalist") {
        setThemeState(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        // Default to Neo-Brutalist as requested
        setThemeState("neobrutalist");
        localStorage.setItem(THEME_STORAGE_KEY, "neobrutalist");
        document.documentElement.setAttribute("data-theme", "neobrutalist");
      }

      // Listen for custom cross-component theme events
      const handleThemeEvent = (e: Event) => {
        const customEvent = e as CustomEvent<UITheme>;
        if (customEvent.detail && (customEvent.detail === "classic" || customEvent.detail === "neobrutalist")) {
          setThemeState(customEvent.detail);
        }
      };

      window.addEventListener("ui-theme-changed", handleThemeEvent);
      return () => window.removeEventListener("ui-theme-changed", handleThemeEvent);
    }
  }, []);

  const setTheme = useCallback((newTheme: UITheme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      window.dispatchEvent(new CustomEvent("ui-theme-changed", { detail: newTheme }));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: UITheme = prev === "neobrutalist" ? "classic" : "neobrutalist";
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, next);
        document.documentElement.setAttribute("data-theme", next);
        window.dispatchEvent(new CustomEvent("ui-theme-changed", { detail: next }));
      }
      return next;
    });
  }, []);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isNeoBrutalist: theme === "neobrutalist",
    isClassic: theme === "classic",
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
