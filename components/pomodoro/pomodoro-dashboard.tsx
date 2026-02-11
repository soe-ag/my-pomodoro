"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { TimerDisplay } from "./timer-display";
import { TimerControls } from "./timer-controls";
import { Stats } from "./stats";
import { DEFAULT_WORK_DURATION, SessionType } from "@/lib/pomodoro/constants";
import {
  playNotificationSound,
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
  const [settings, setSettings] = useState(() => loadSettings());
  const [timeRemaining, setTimeRemaining] = useState(() =>
    typeof window === "undefined"
      ? DEFAULT_WORK_DURATION
      : loadSettings().workDuration,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Load initial stats and settings
  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    const stats = getDailyStats();
    setSessionsCompleted(stats.sessionsCompleted);
    setTimeRemaining(getSessionDuration("work", s));
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

    toast(message);

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
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSessionType("work");
    setTimeRemaining(getSessionDuration("work", settings));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Toaster />
      <Card className="p-8 shadow-lg">
        <TimerDisplay
          timeRemaining={timeRemaining}
          sessionType={sessionType}
          sessionsCompleted={sessionsCompleted}
          isRunning={isRunning}
          sessionDuration={getSessionDuration(sessionType, settings)}
        />

        <div className="mt-8">
          <TimerControls
            isRunning={isRunning}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
          />
        </div>
        <Stats />
      </Card>
    </div>
  );
}
