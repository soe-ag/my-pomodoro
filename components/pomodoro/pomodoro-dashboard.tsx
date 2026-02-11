"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { TimerDisplay } from "./timer-display";
import { TimerControls } from "./timer-controls";
import { Stats } from "./stats";
import {
  DEFAULT_WORK_DURATION,
  SessionType,
  DEFAULT_SETTINGS,
} from "@/lib/pomodoro/constants";
import {
  playNotificationSound,
  playChirpSound,
  sendBrowserNotification,
  getNextSession,
  getSessionDuration,
} from "@/lib/pomodoro/timer-logic";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  getDailyStats,
  addSessionRecord,
  loadSettings,
} from "@/lib/pomodoro/storage";

export function PomodoroDashboard() {
  const [settings, setSettings] = useState(() => DEFAULT_SETTINGS);
  const [timeRemaining, setTimeRemaining] = useState(
    () => DEFAULT_WORK_DURATION,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Load initial stats and settings
  useEffect(() => {
    const s = loadSettings();
    Promise.resolve().then(() => {
      setSettings(s);
      const stats = getDailyStats();
      setSessionsCompleted(stats.sessionsCompleted);
      setTimeRemaining(getSessionDuration("work", s));
    });
  }, []);

  // Request browser notification permission if needed
  useEffect(() => {
    const settings = loadSettings();
    if (typeof window !== "undefined" && settings.notificationsEnabled) {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  const handleSessionComplete = useCallback(() => {
    const s = loadSettings();

    // Play sound
    if (s.soundEnabled) {
      playNotificationSound();
    }

    // Prepare message and show sonner toast
    const message =
      sessionType === "work"
        ? "Work session completed! Time for a break."
        : "Break time is over! Ready for another session?";

    toast(message, { duration: 5000 });

    // Browser notification
    if (s.notificationsEnabled) {
      sendBrowserNotification("Pomodoro Timer", {
        body: message,
        icon: "/images/sample-products/default.png",
      });
    }

    // Record session
    const duration = getSessionDuration(sessionType, s);
    addSessionRecord({
      date: new Date().toISOString().split("T")[0],
      type: sessionType,
      duration,
      completed: true,
      timestamp: Date.now(),
    });

    // Compute next session
    const next = getNextSession(sessionType, sessionsCompleted, s);
    setSessionType(next.next);
    setTimeRemaining(next.duration);
    setSessionsCompleted(next.sessionsCompleted);
  }, [sessionType, sessionsCompleted]);

  // Timer interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer finished
          setIsRunning(false);
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, handleSessionComplete]);

  const handleStart = () => {
    setIsRunning(true);
    try {
      if (typeof window !== "undefined" && settings?.soundEnabled) {
        playChirpSound();
      }
    } catch {}
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSessionType("work");
    setTimeRemaining(getSessionDuration("work", settings));
  };

  const gradientFor = (type: SessionType) => {
    switch (type) {
      case "work":
        return "from-blue-600 to-purple-600";
      case "break":
        return "from-emerald-500 to-green-600";
      case "long-break":
        return "from-blue-400 to-blue-400";
      default:
        return "from-blue-600 to-purple-600";
    }
  };

  const tabClass = (type: SessionType) =>
    sessionType === type
      ? `px-3 py-1 rounded-full cursor-pointer bg-linear-to-r ${gradientFor(type)} text-white` +
        (type === "long-break" ? " text-blue-400" : "")
      : `px-3 py-1 rounded-full cursor-pointer bg-white/5 text-gray-300 hover:bg-white/10`;

  return (
    <div
      className="w-full max-w-4xl mx-auto flex py-0 md:py-6 relative"
      style={{
        fontFamily: "ui-rounded, system-ui, -apple-system, 'Segoe UI', Roboto",
      }}
    >
      <Toaster />
      <div className="flex-1">
        <Card className="p-8 shadow-lg relative">
          <div
            className={`flex gap-2 justify-center mb-4 ${isRunning ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <button
              className={tabClass("work")}
              onClick={() => {
                setSessionType("work");
                setTimeRemaining(getSessionDuration("work", settings));
              }}
            >
              Work
            </button>
            <button
              className={tabClass("break")}
              onClick={() => {
                setSessionType("break");
                setTimeRemaining(getSessionDuration("break", settings));
              }}
            >
              Break
            </button>
            <button
              className={tabClass("long-break")}
              onClick={() => {
                setSessionType("long-break");
                setTimeRemaining(getSessionDuration("long-break", settings));
              }}
            >
              Long Break
            </button>
          </div>
          <TimerDisplay
            timeRemaining={timeRemaining}
            sessionType={sessionType}
            sessionDuration={getSessionDuration(sessionType, settings)}
          />

          <div className="mt-4">
            <TimerControls
              isRunning={isRunning}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              sessionType={sessionType}
            />
          </div>
          <Stats />
        </Card>
      </div>
    </div>
  );
}
