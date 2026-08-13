export const SESSION_TYPES = ["work", "break", "long-break"] as const;

// Timer durations in seconds
export const DEFAULT_WORK_DURATION = 25 * 60;
export const DEFAULT_BREAK_DURATION = 5 * 60;
export const DEFAULT_LONG_BREAK_DURATION = 15 * 60;

export type SessionType = (typeof SESSION_TYPES)[number];

export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: DEFAULT_WORK_DURATION,
  breakDuration: DEFAULT_BREAK_DURATION,
  longBreakDuration: DEFAULT_LONG_BREAK_DURATION,
  soundEnabled: true,
  notificationsEnabled: true,
};

export const WORK_SESSIONS_PER_CYCLE = 4;

export const MIN_SESSION_DURATION_MINUTES = 1;
export const MAX_SESSION_DURATION_MINUTES = 180;
