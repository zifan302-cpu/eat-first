import {
  useCallback,
  createContext,
  createElement,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { AppStateEnvelope } from "../types/food";
import { loadState, saveState } from "../lib/storage";

interface AppStateContextValue {
  state: AppStateEnvelope;
  setState: Dispatch<SetStateAction<AppStateEnvelope>>;
  replaceState(nextState: AppStateEnvelope): void;
  commitState(
    updater: SetStateAction<AppStateEnvelope>,
    notice: UndoNotice
  ): void;
  undoEntry: UndoEntry | null;
  undoState(): void;
  dismissUndo(): void;
}

export interface UndoNotice {
  action: "added" | "partial" | "eaten" | "frozen" | "discarded" | "deleted" | "later";
  name: string;
}

interface UndoEntry {
  snapshot: AppStateEnvelope;
  notice: UndoNotice;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: PropsWithChildren): JSX.Element {
  const [state, setState] = useState<AppStateEnvelope>(() => loadState());
  const [undoEntry, setUndoEntry] = useState<UndoEntry | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const commitState = useCallback(
    (updater: SetStateAction<AppStateEnvelope>, notice: UndoNotice) => {
      const nextState =
        typeof updater === "function"
          ? (updater as (current: AppStateEnvelope) => AppStateEnvelope)(state)
          : updater;
      setUndoEntry({ snapshot: state, notice });
      setState(nextState);
    },
    [state]
  );

  const undoState = useCallback(() => {
    if (!undoEntry) {
      return;
    }
    setState(undoEntry.snapshot);
    setUndoEntry(null);
  }, [undoEntry]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      setState,
      commitState,
      undoEntry,
      undoState,
      dismissUndo() {
        setUndoEntry(null);
      },
      replaceState(nextState) {
        setUndoEntry(null);
        setState(nextState);
      }
    }),
    [commitState, state, undoEntry, undoState]
  );

  return createElement(AppStateContext.Provider, { value }, children);
}

export function useAppState(): AppStateContextValue {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return value;
}
