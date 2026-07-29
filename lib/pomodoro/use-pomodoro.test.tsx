import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "./constants";
import { getDailyStats, saveSettingsAndNotify } from "./storage";
import { resetAudioContextForTests } from "./timer-logic";
import { PomodoroProvider, usePomodoro } from "./use-pomodoro";

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(PomodoroProvider, null, children);

const flushEffects = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

const installAudioStub = () => {
  const start = vi.fn();
  const stop = vi.fn();
  const resume = vi.fn().mockResolvedValue(undefined);

  class FakeAudioContext {
    currentTime = 0;
    state = "suspended";
    destination = {};
    resume = resume;
    createOscillator = vi.fn(() => ({
      connect: vi.fn(),
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
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }));
  }

  resetAudioContextForTests();
  vi.stubGlobal("AudioContext", FakeAudioContext);
  return { start, stop };
};

describe("usePomodoro", () => {
  it("updates live timer duration when settings are saved", async () => {
    const { result } = renderHook(() => usePomodoro(), { wrapper });

    expect(result.current.currentDuration).toBe(DEFAULT_SETTINGS.workDuration);

    act(() => {
      saveSettingsAndNotify({
        ...DEFAULT_SETTINGS,
        workDuration: 60,
      });
    });

    await flushEffects();

    expect(result.current.currentDuration).toBe(60);
    expect(result.current.timeRemaining).toBe(60);
  });

  it("asks before resetting a paused session with progress", async () => {
    vi.useFakeTimers();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    installAudioStub();

    const { result } = renderHook(() => usePomodoro(), { wrapper });

    act(() => {
      saveSettingsAndNotify({
        ...DEFAULT_SETTINGS,
        workDuration: 10,
      });
    });

    expect(result.current.timeRemaining).toBe(10);

    act(() => {
      result.current.start();
    });
    await flushEffects();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await flushEffects();

    act(() => {
      result.current.pause();
    });

    expect(result.current.timeRemaining).toBe(9);

    act(() => {
      result.current.selectSession("break");
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(result.current.sessionType).toBe("work");
    expect(result.current.timeRemaining).toBe(9);

    vi.useRealTimers();
  });

  it("records a finished work session and plays the completion sound", async () => {
    vi.useFakeTimers();
    const audio = installAudioStub();

    const { result } = renderHook(() => usePomodoro(), { wrapper });

    act(() => {
      saveSettingsAndNotify({
        ...DEFAULT_SETTINGS,
        workDuration: 1,
        breakDuration: 5,
        soundEnabled: true,
      });
    });

    expect(result.current.timeRemaining).toBe(1);

    act(() => {
      result.current.start();
    });
    await flushEffects();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await flushEffects();

    expect(getDailyStats().sessionsCompleted).toBe(1);
    expect(result.current.sessionType).toBe("break");
    expect(result.current.timeRemaining).toBe(5);
    expect(audio.start).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("uses elapsed wall-clock time when interval ticks are delayed", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    installAudioStub();

    const { result } = renderHook(() => usePomodoro(), { wrapper });

    act(() => {
      saveSettingsAndNotify({
        ...DEFAULT_SETTINGS,
        workDuration: 10,
      });
    });

    act(() => {
      result.current.start();
    });
    await flushEffects();

    vi.setSystemTime(4000);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await flushEffects();

    expect(result.current.timeRemaining).toBe(5);

    vi.useRealTimers();
  });

  it("finishes short break and long break sessions through the shared countdown path", async () => {
    vi.useFakeTimers();
    installAudioStub();

    const { result } = renderHook(() => usePomodoro(), { wrapper });

    act(() => {
      saveSettingsAndNotify({
        ...DEFAULT_SETTINGS,
        breakDuration: 1,
        longBreakDuration: 1,
      });
    });

    act(() => {
      result.current.selectSession("break");
      result.current.start();
    });
    await flushEffects();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await flushEffects();

    expect(result.current.sessionType).toBe("work");
    expect(getDailyStats().sessions.at(-1)?.type).toBe("break");

    act(() => {
      result.current.selectSession("long-break");
      result.current.start();
    });
    await flushEffects();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await flushEffects();

    expect(result.current.sessionType).toBe("work");
    expect(getDailyStats().sessions.at(-1)?.type).toBe("long-break");

    vi.useRealTimers();
  });

  it("reconciles from the deadline when the tab becomes visible", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    installAudioStub();

    const { result } = renderHook(() => usePomodoro(), { wrapper });

    act(() => {
      saveSettingsAndNotify({
        ...DEFAULT_SETTINGS,
        workDuration: 10,
        breakDuration: 5,
      });
    });

    act(() => {
      result.current.start();
    });
    await flushEffects();

    vi.setSystemTime(12_000);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await flushEffects();
    await flushEffects();

    expect(getDailyStats().sessionsCompleted).toBe(1);
    expect(result.current.sessionType).toBe("break");
    expect(result.current.timeRemaining).toBe(5);

    vi.useRealTimers();
  });

  it("does not get stuck at one second when the next tick happens after the deadline", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    installAudioStub();

    const { result } = renderHook(() => usePomodoro(), { wrapper });

    act(() => {
      saveSettingsAndNotify({
        ...DEFAULT_SETTINGS,
        workDuration: 2,
        breakDuration: 5,
      });
    });

    act(() => {
      result.current.start();
    });
    await flushEffects();

    vi.setSystemTime(2_500);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await flushEffects();
    await flushEffects();

    expect(getDailyStats().sessionsCompleted).toBe(1);
    expect(result.current.sessionType).toBe("break");
    expect(result.current.timeRemaining).toBe(5);

    vi.useRealTimers();
  });});



