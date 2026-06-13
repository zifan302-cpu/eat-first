import { BarChart3, Home, List, Plus, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { Messages } from "../i18n/en-GB";
import { cx } from "../lib/ui";

const links = [
  { to: "/", labelKey: "home", icon: Home },
  { to: "/add", labelKey: "add", icon: Plus },
  { to: "/fridge", labelKey: "fridge", icon: List },
  { to: "/stats", labelKey: "stats", icon: BarChart3 },
  { to: "/settings", labelKey: "settings", icon: Settings }
] as const;

interface BottomNavProps {
  t: Messages;
}

export function BottomNav({ t }: BottomNavProps): JSX.Element {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {links.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cx(
                "flex min-h-14 flex-col items-center justify-center rounded-md text-[0.72rem] font-semibold transition",
                isActive ? "bg-leaf-50 text-leaf-700" : "text-stone-500"
              )
            }
          >
            <Icon aria-hidden className="mb-1 h-5 w-5" />
            <span>{t.nav[labelKey]}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
