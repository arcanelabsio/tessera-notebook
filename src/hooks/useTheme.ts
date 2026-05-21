import { useEffect } from "react";
import { usePersisted } from "../state/usePersisted";

export type Theme = "light" | "dark";

export const THEME_KEY = "tessera:theme:v1";

// Reader-controlled theme. Editorial sites default to light (the
// canonical reading surface) and let the reader explicitly opt into
// dark — OS preference is intentionally not honored, because reading
// environment matters more than system chrome here. The initial
// attribute is set by an inline script in index.html to avoid FOUC;
// this hook only handles updates after React boots.
export function useTheme(): {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
} {
  const [theme, setTheme] = usePersisted<Theme>(THEME_KEY, "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => setTheme(theme === "light" ? "dark" : "light");
  return { theme, setTheme, toggle };
}
