"use client";

import {
  createContext,
  createElement,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { DEFAULT_SETTINGS, type PomodoroSettings, type SessionType } from "./constants";
import {
  POMODORO_EVENT,
  addSessionRecord,
  getDailyStats,
  getToday,
  loadSettings,
  requestNotificationPermission,
} from "./storage";
import {
  getNextSession,
  getSessionDuration,
  playChirpSound,
  playNotificationSound,
  sendBrowserNotification,
  unlockAudio,
} from "./timer-logic";

export interface PomodoroController {
  settings: PomodoroSettings;
  timeRemaining: number;
  isRunning: boolean;
  sessionType: SessionType;
  sessionsCompleted: number;
  currentDuration: number;
  selectSession: (sessionType: SessionType) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

interface PomodoroState {
  settings: PomodoroSettings;
  timeRemaining: number;
  isRunning: boolean;
  sessionType: SessionType;
  sessionsCompleted: number;
  deadlineAt: number | null;
}

const PomodoroContext = createContext<PomodoroController | null>(null);
// The visible timer changes once a second. A faster interval only creates
// redundant React renders; deadline reconciliation keeps it accurate.
const TIMER_SYNC_INTERVAL_MS = 1_000;

const createInitialState = (): PomodoroState => ({
  settings: DEFAULT_SETTINGS,
  timeRemaining: DEFAULT_SETTINGS.workDuration,
  isRunning: false,
  sessionType: "work",
  sessionsCompleted: 0,
  deadlineAt: null,
});

const getSessionName = (sessionType: SessionType): string => {
  switch (sessionType) {
    case "work":
      return "focus session";
    case "break":
      return "short break";
    case "long-break":
      return "long break";
  }
};

const confirmSessionReset = (
  currentSessionType: SessionType,
  nextSessionType: SessionType,
): boolean => {
  if (typeof window === "undefined") {
    return true;
  }

  return window.confirm(
    `Switching to ${getSessionName(nextSessionType)} will reset your current ${getSessionName(currentSessionType)}. Continue?`,
  );
};

const getRemainingFromDeadline = (deadlineAt: number | null): number | null => {
  if (deadlineAt === null) {
    return null;
  }

  return Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000));
};

const syncRunningState = (current: PomodoroState): PomodoroState => {
  if (!current.isRunning || current.deadlineAt === null) {
    return current;
  }

  const timeRemaining = getRemainingFromDeadline(current.deadlineAt) ?? current.timeRemaining;

  if (timeRemaining <= 0) {
    return {
      ...current,
      isRunning: false,
      timeRemaining: 0,
      deadlineAt: null,
    };
  }

  if (timeRemaining === current.timeRemaining) {
    return current;
  }

  return {
    ...current,
    timeRemaining,
  };
};

const usePomodoroController = (): PomodoroController => {
  const [state, setState] = useState<PomodoroState>(createInitialState);
  const completedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const settings = loadSettings();
      const dailyStats = getDailyStats();

      setState((current) => ({
        ...current,
        settings,
        sessionsCompleted: dailyStats.sessionsCompleted,
        timeRemaining: getSessionDuration(current.sessionType, settings),
      }));
    });

    const handleSettingsSaved = (event: Event) => {
      const customEvent = event as CustomEvent<PomodoroSettings>;
      const nextSettings = customEvent.detail ?? loadSettings();

      setState((current) => {
        const synced = syncRunningState(current);
        const previousDuration = getSessionDuration(synced.sessionType, synced.settings);
        const nextDuration = getSessionDuration(synced.sessionType, nextSettings);
        const hasProgress = synced.timeRemaining < previousDuration;
        const timeRemaining = hasProgress
          ? Math.min(synced.timeRemaining, nextDuration)
          : nextDuration;

        return {
          ...synced,
          settings: nextSettings,
          timeRemaining,
          deadlineAt: synced.isRunning ? Date.now() + timeRemaining * 1000 : null,
        };
      });
    };

    window.addEventListener(POMODORO_EVENT.settingsSaved, handleSettingsSaved);

    return () => {
      window.removeEventListener(POMODORO_EVENT.settingsSaved, handleSettingsSaved);
    };
  }, []);

  useEffect(() => {
    if (state.settings.notificationsEnabled) {
      requestNotificationPermission();
    }
  }, [state.settings.notificationsEnabled]);

  useEffect(() => {
    const reconcile = () => setState(syncRunningState);

    document.addEventListener("visibilitychange", reconcile);
    window.addEventListener("focus", reconcile);
    window.addEventListener("pageshow", reconcile);

    return () => {
      document.removeEventListener("visibilitychange", reconcile);
      window.removeEventListener("focus", reconcile);
      window.removeEventListener("pageshow", reconcile);
    };
  }, []);

  useEffect(() => {
    if (!state.isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setState(syncRunningState);
    }, TIMER_SYNC_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state.isRunning]);

  useEffect(() => {
    if (state.timeRemaining > 0 || state.isRunning) {
      completedSessionRef.current = null;
      return;
    }

    const completionKey = `${state.sessionType}:${state.sessionsCompleted}`;
    if (completedSessionRef.current === completionKey) {
      return;
    }

    completedSessionRef.current = completionKey;

    const duration = getSessionDuration(state.sessionType, state.settings);
    const message =
      state.sessionType === "work"
        ? "Focus session complete. Take a break."
        : "Break complete. Ready for the next focus block.";

    if (state.settings.soundEnabled) {
      playNotificationSound();
    }

    toast.success(message);
    sendBrowserNotification("Pomodoro Timer", { body: message });

    addSessionRecord({
      date: getToday(),
      type: state.sessionType,
      duration,
      completed: true,
      timestamp: Date.now(),
    });

    const nextSession = getNextSession(
      state.sessionType,
      state.sessionsCompleted,
      state.settings,
    );

    queueMicrotask(() => {
      setState((current) => ({
        ...current,
        isRunning: false,
        sessionType: nextSession.next,
        timeRemaining: nextSession.duration,
        sessionsCompleted: nextSession.sessionsCompleted,
        deadlineAt: null,
      }));
    });
  }, [state.isRunning, state.sessionsCompleted, state.sessionType, state.settings, state.timeRemaining]);

  const selectSession = useCallback((nextSessionType: SessionType) => {
    setState((current) => {
      const synced = syncRunningState(current);
      const currentDuration = getSessionDuration(synced.sessionType, synced.settings);
      const hasProgress = synced.timeRemaining < currentDuration;

      if (nextSessionType === synced.sessionType) {
        return synced;
      }

      if (hasProgress && !confirmSessionReset(synced.sessionType, nextSessionType)) {
        return synced;
      }

      return {
        ...synced,
        isRunning: false,
        sessionType: nextSessionType,
        timeRemaining: getSessionDuration(nextSessionType, synced.settings),
        deadlineAt: null,
      };
    });
  }, []);

  const start = useCallback(() => {
    unlockAudio();

    setState((current) => {
      const synced = syncRunningState(current);

      if (synced.isRunning) {
        return synced;
      }

      return {
        ...synced,
        isRunning: true,
        deadlineAt: Date.now() + synced.timeRemaining * 1000,
      };
    });

    if (state.settings.soundEnabled && !state.isRunning) {
      playChirpSound();
    }
  }, [state.isRunning, state.settings.soundEnabled]);

  const pause = useCallback(() => {
    setState((current) => {
      const synced = syncRunningState(current);

      return {
        ...synced,
        isRunning: false,
        deadlineAt: null,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState((current) => ({
      ...current,
      isRunning: false,
      timeRemaining: getSessionDuration(current.sessionType, current.settings),
      deadlineAt: null,
    }));
  }, []);

  return useMemo(() => ({
    settings: state.settings,
    timeRemaining: state.timeRemaining,
    isRunning: state.isRunning,
    sessionType: state.sessionType,
    sessionsCompleted: state.sessionsCompleted,
    currentDuration: getSessionDuration(state.sessionType, state.settings),
    selectSession,
    start,
    pause,
    reset,
  }), [state, selectSession, start, pause, reset]);
};

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const controller = usePomodoroController();

  return createElement(PomodoroContext.Provider, { value: controller }, children);
}

export const usePomodoro = (): PomodoroController => {
  const context = use(PomodoroContext);

  if (!context) {
    throw new Error("usePomodoro must be used within PomodoroProvider");
  }

  return context;
};
