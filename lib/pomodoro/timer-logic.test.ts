import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS, type PomodoroSettings } from "./constants";
import {
  formatTime,
  getNextSession,
  getSessionDuration,
  playChirpSound,
  playNotificationSound,
  resetAudioContextForTests,
  unlockAudio,
} from "./timer-logic";

describe("timer logic", () => {
  const customSettings: PomodoroSettings = {
    ...DEFAULT_SETTINGS,
    workDuration: 10,
    breakDuration: 20,
    longBreakDuration: 30,
  };

  it("formats seconds as mm:ss", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(1500)).toBe("25:00");
  });

  it("reads session durations from settings", () => {
    expect(getSessionDuration("work", customSettings)).toBe(10);
    expect(getSessionDuration("break", customSettings)).toBe(20);
    expect(getSessionDuration("long-break", customSettings)).toBe(30);
  });

  it("moves from work to short breaks and every fourth work session to a long break", () => {
    expect(getNextSession("work", 0, customSettings)).toEqual({
      next: "break",
      duration: 20,
      sessionsCompleted: 1,
    });
    expect(getNextSession("work", 3, customSettings)).toEqual({
      next: "long-break",
      duration: 30,
      sessionsCompleted: 4,
    });
    expect(getNextSession("break", 1, customSettings)).toEqual({
      next: "work",
      duration: 10,
      sessionsCompleted: 1,
    });
  });

  it("reuses an unlocked audio context for start and completion sounds", () => {
    const start = vi.fn();
    const stop = vi.fn();
    const connect = vi.fn();
    const resume = vi.fn().mockResolvedValue(undefined);

    class FakeAudioContext {
      currentTime = 0;
      state = "suspended";
      destination = {};
      resume = resume;
      createOscillator = vi.fn(() => ({
        connect,
        frequency: {
          value: 0,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
        },
        start,
        stop,
        type: "sine",
      }));
      createGain = vi.fn(() => ({
        connect,
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      }));
    }

    resetAudioContextForTests();
    vi.stubGlobal("AudioContext", FakeAudioContext);

    unlockAudio();
    playChirpSound();
    playNotificationSound();

    expect(resume).toHaveBeenCalled();
    expect(start).toHaveBeenCalledTimes(2);
    expect(stop).toHaveBeenCalledTimes(2);
  });
});

