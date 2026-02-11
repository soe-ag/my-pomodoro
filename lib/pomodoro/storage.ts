import { PomodoroSettings, DEFAULT_SETTINGS } from "./constants";

const SETTINGS_KEY = "pomodoro-settings";
const STATS_KEY = "pomodoro-stats-";

export interface SessionRecord {
  date: string;
  type: "work" | "break" | "long-break";
  duration: number; // in seconds
  completed: boolean;
  timestamp: number;
}

export interface DailyStats {
  date: string;
  sessions: SessionRecord[];
  totalWorkTime: number; // in seconds
  sessionsCompleted: number;
}

export const loadSettings = (): PomodoroSettings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: PomodoroSettings): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
};

export const getToday = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const getDailyStats = (date: string = getToday()): DailyStats => {
  if (typeof window === "undefined") {
    return { date, sessions: [], totalWorkTime: 0, sessionsCompleted: 0 };
  }

  try {
    const stored = localStorage.getItem(STATS_KEY + date);
    return stored
      ? JSON.parse(stored)
      : { date, sessions: [], totalWorkTime: 0, sessionsCompleted: 0 };
  } catch {
    return { date, sessions: [], totalWorkTime: 0, sessionsCompleted: 0 };
  }
};

export const saveDailyStats = (stats: DailyStats): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STATS_KEY + stats.date, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to save daily stats:", error);
  }
};

export const addSessionRecord = (
  record: SessionRecord,
  date: string = getToday()
): DailyStats => {
  const stats = getDailyStats(date);
  stats.sessions.push(record);

  if (record.type === "work" && record.completed) {
    stats.sessionsCompleted++;
    stats.totalWorkTime += record.duration;
  }

  saveDailyStats(stats);
  return stats;
};

export const getWeeklyStats = (): DailyStats[] => {
  const stats: DailyStats[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    stats.push(getDailyStats(dateStr));
  }

  return stats.reverse();
};
