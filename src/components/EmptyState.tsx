import { Link } from "react-router-dom";
import type { CharacterId } from "../lib/characters";
import { CHARACTERS } from "../lib/characters";

interface EmptyStateProps {
  title: string;
  action?: JSX.Element;
  character?: CharacterId;
}

export function EmptyState({
  title,
  action,
  character = "broccoli"
}: EmptyStateProps): JSX.Element {
  const profile = CHARACTERS[character];
  return (
    <div className="fresh-card flex min-h-56 flex-col items-center justify-center px-5 py-7 text-center">
      <div
        className="grid h-28 w-28 place-items-end overflow-hidden rounded-[1.4rem] border border-paper-line"
        style={{ backgroundColor: profile.soft }}
      >
        <img src={profile.asset} alt="" className="h-[112%] w-[112%] object-contain object-bottom" />
      </div>
      <p className="mt-4 max-w-xs font-editorial text-lg font-black tracking-tight text-ink">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
      {!action ? (
        <Link to="/add" className="mt-4 text-sm font-black text-leaf-700">
          +
        </Link>
      ) : null}
    </div>
  );
}
