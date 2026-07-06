import {
  DEFAULT_SETTINGS,
  PomodoroSettings,
  SessionType,
} from "./constants";

const SETTINGS_KEY = "pomodoro-settings";
const STATS_KEY = "pomodoro-stats-";

export const POMODORO_EVENT = {
  sessionAdded: "pomodoro:session-added",
  settingsSaved: "pomodoro:settings-saved",
  statsUpdated: "pomodoro:stats-updated",
} as const;

export interface SessionRecord {
  date: string;
  type: SessionType;
  duration: number;
  completed: boolean;
  timestamp: number;
}

export interface DailyStats {
  date: string;
  sessions: SessionRecord[];
  totalWorkTime: number;
  sessionsCompleted: number;
}

const isBrowser = typeof window !== "undefined";

const createEmptyDailyStats = (date: string): DailyStats => ({
  date,
  sessions: [],
  totalWorkTime: 0,
  sessionsCompleted: 0,
});

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const dispatchPomodoroEvent = <T>(name: string, detail: T) => {
  if (!isBrowser) {
    return;
  }

  window.dispatchEvent(new CustomEvent(name, { detail }));
};

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const loadSettings = (): PomodoroSettings => {
  if (!isBrowser) {
    return DEFAULT_SETTINGS;
  }

  return safeParse(localStorage.getItem(SETTINGS_KEY), DEFAULT_SETTINGS);
};

export const saveSettings = (settings: PomodoroSettings): void => {
  if (!isBrowser) {
    return;
  }

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const requestNotificationPermission = (): void => {
  if (!isBrowser || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
};

export const getToday = (): string => formatLocalDate(new Date());

export const getDailyStats = (date: string = getToday()): DailyStats => {
  if (!isBrowser) {
    return createEmptyDailyStats(date);
  }

  return safeParse(localStorage.getItem(`${STATS_KEY}${date}`), createEmptyDailyStats(date));
};

export const saveDailyStats = (stats: DailyStats): void => {
  if (!isBrowser) {
    return;
  }

  localStorage.setItem(`${STATS_KEY}${stats.date}`, JSON.stringify(stats));
  dispatchPomodoroEvent(POMODORO_EVENT.statsUpdated, stats);
};

export const addSessionRecord = (
  record: SessionRecord,
  date: string = getToday(),
): DailyStats => {
  const stats = getDailyStats(date);
  const nextStats: DailyStats = {
    ...stats,
    sessions: [...stats.sessions, record],
    totalWorkTime:
      record.type === "work" && record.completed
        ? stats.totalWorkTime + record.duration
        : stats.totalWorkTime,
    sessionsCompleted:
      record.type === "work" && record.completed
        ? stats.sessionsCompleted + 1
        : stats.sessionsCompleted,
  };

  saveDailyStats(nextStats);
  dispatchPomodoroEvent(POMODORO_EVENT.sessionAdded, record);

  return nextStats;
};

export const saveSettingsAndNotify = (settings: PomodoroSettings): void => {
  saveSettings(settings);
  dispatchPomodoroEvent(POMODORO_EVENT.settingsSaved, settings);
};

export const getWeeklyStats = (): DailyStats[] => {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return getDailyStats(formatLocalDate(date));
  });
};
