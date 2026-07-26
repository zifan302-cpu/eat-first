import { BellRing, CheckCircle2, Clock3, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import type { Messages } from "../i18n/en-GB";

interface HabitLoopCardProps {
  reminderEnabled: boolean;
  reminderTime: string;
  missionComplete: boolean;
  t: Messages;
}

export function HabitLoopCard({
  reminderEnabled,
  reminderTime,
  missionComplete,
  t
}: HabitLoopCardProps): JSX.Element {
  return (
    <section className="fresh-card overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700">
          {missionComplete ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          ) : (
            <BellRing className="h-5 w-5" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="fresh-eyebrow">{t.habit.eyebrow}</p>
          <h2 className="mt-1 font-editorial text-lg font-black text-ink">
            {missionComplete ? t.habit.completeTitle : t.habit.title}
          </h2>
          <p className="mt-1 text-sm font-medium leading-5 text-ink-muted">
            {missionComplete ? t.habit.completeBody : t.habit.body}
          </p>
          {reminderEnabled ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-black text-leaf-700">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              {t.habit.reminderAt.replace("{time}", reminderTime)}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-2 border-t border-paper-line">
        <Link
          to="/settings#habit"
          className="flex min-h-12 items-center justify-center gap-2 border-r border-paper-line text-xs font-black text-leaf-700"
        >
          <BellRing className="h-4 w-4" aria-hidden />
          {reminderEnabled ? t.habit.adjustReminder : t.habit.addReminder}
        </Link>
        <Link
          to="/feedback"
          className="flex min-h-12 items-center justify-center gap-2 text-xs font-black text-leaf-700"
        >
          <MessageSquareText className="h-4 w-4" aria-hidden />
          {t.habit.feedbackAction}
        </Link>
      </div>
    </section>
  );
}
