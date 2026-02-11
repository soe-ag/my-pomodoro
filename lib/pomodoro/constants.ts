// Timer durations in seconds
export const DEFAULT_WORK_DURATION = 25 * 60; // 25 minutes
export const DEFAULT_BREAK_DURATION = 5 * 60; // 5 minutes
export const DEFAULT_LONG_BREAK_DURATION = 15 * 60; // 15 minutes

export type SessionType = "work" | "break" | "long-break";

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
