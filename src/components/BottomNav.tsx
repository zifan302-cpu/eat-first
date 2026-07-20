import { House, Refrigerator, Plus, Settings, Sprout } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { Messages } from "../i18n/en-GB";
import { cx } from "../lib/ui";

const links = [
  { to: "/", labelKey: "home", icon: House },
  { to: "/add", labelKey: "add", icon: Plus },
  { to: "/fridge", labelKey: "fridge", icon: Refrigerator },
  { to: "/squad", labelKey: "squad", icon: Sprout },
  { to: "/settings", labelKey: "settings", icon: Settings }
] as const;

interface BottomNavProps {
  t: Messages;
}

export function BottomNav({ t }: BottomNavProps): JSX.Element {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-paper-line bg-paper-soft/96 px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.55rem)] shadow-[0_-5px_0_rgba(32,61,46,0.035)]">
      <div className="grid grid-cols-5 gap-0.5">
        {links.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cx(
                "relative flex min-h-14 flex-col items-center justify-center rounded-[0.95rem] text-[0.68rem] font-extrabold transition",
                isActive
                  ? "bg-leaf-100 text-leaf-700"
                  : "text-ink-muted hover:bg-paper"
              )
            }
          >
            <Icon aria-hidden className="mb-1 h-[1.15rem] w-[1.15rem]" strokeWidth={2.2} />
            <span>{t.nav[labelKey]}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
