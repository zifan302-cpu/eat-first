import {
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
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: PropsWithChildren): JSX.Element {
  const [state, setState] = useState<AppStateEnvelope>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      setState,
      replaceState(nextState) {
        setState(nextState);
      }
    }),
    [state]
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
