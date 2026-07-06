import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "./constants";
import {
  POMODORO_EVENT,
  addSessionRecord,
  getDailyStats,
  getToday,
  getWeeklyStats,
  loadSettings,
  saveSettingsAndNotify,
} from "./storage";

describe("pomodoro storage", () => {
  it("saves settings and dispatches the saved settings event", () => {
    const listener = vi.fn();
    const settings = {
      ...DEFAULT_SETTINGS,
      workDuration: 60,
      breakDuration: 30,
    };

    window.addEventListener(POMODORO_EVENT.settingsSaved, listener);
    saveSettingsAndNotify(settings);

    expect(loadSettings()).toEqual(settings);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual(settings);
  });

  it("records completed work sessions in today's stats and emits update events", () => {
    const statsListener = vi.fn();
    const sessionListener = vi.fn();
    const today = getToday();

    window.addEventListener(POMODORO_EVENT.statsUpdated, statsListener);
    window.addEventListener(POMODORO_EVENT.sessionAdded, sessionListener);

    const stats = addSessionRecord({
      date: today,
      type: "work",
      duration: 1500,
      completed: true,
      timestamp: 1,
    });

    expect(stats.sessionsCompleted).toBe(1);
    expect(stats.totalWorkTime).toBe(1500);
    expect(getDailyStats(today)).toEqual(stats);
    expect(statsListener).toHaveBeenCalledTimes(1);
    expect(sessionListener).toHaveBeenCalledTimes(1);
  });

  it("does not count breaks as completed work sessions", () => {
    addSessionRecord({
      date: getToday(),
      type: "break",
      duration: 300,
      completed: true,
      timestamp: 1,
    });

    const stats = getDailyStats();
    expect(stats.sessions).toHaveLength(1);
    expect(stats.sessionsCompleted).toBe(0);
    expect(stats.totalWorkTime).toBe(0);
  });

  it("returns seven daily stat buckets in chronological order", () => {
    expect(getWeeklyStats()).toHaveLength(7);
    expect(getWeeklyStats().at(-1)?.date).toBe(getToday());
  });
});
