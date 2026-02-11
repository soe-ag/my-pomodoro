"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { TimerDisplay } from "./timer-display";
import { TimerControls } from "./timer-controls";
import {
  DEFAULT_WORK_DURATION,
  DEFAULT_BREAK_DURATION,
  SessionType,
} from "@/lib/pomodoro/constants";
import {
  playNotificationSound,
  sendBrowserNotification,
} from "@/lib/pomodoro/timer-logic";
import {
  getDailyStats,
  addSessionRecord,
  loadSettings,
} from "@/lib/pomodoro/storage";

export function PomodoroDashboard() {
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Load initial stats
  useEffect(() => {
    const stats = getDailyStats();
    setSessionsCompleted(stats.sessionsCompleted);
  }, []);

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
  }, [isRunning]);

  const handleSessionComplete = useCallback(() => {
    const settings = loadSettings();

    // Play notifications
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    if (settings.notificationsEnabled) {
      const message =
        sessionType === "work"
          ? "Work session completed! Time for a break."
          : "Break time is over! Ready for another session?";

      sendBrowserNotification("Pomodoro Timer", {
        body: message,
        icon: "/images/sample-products/default.png",
      });
    }

    // Record session
    const duration =
      sessionType === "work" ? DEFAULT_WORK_DURATION : DEFAULT_BREAK_DURATION;
    addSessionRecord({
      date: new Date().toISOString().split("T")[0],
      type: sessionType,
      duration,
      completed: true,
      timestamp: Date.now(),
    });

    // Switch session type
    if (sessionType === "work") {
      setSessionsCompleted((prev) => prev + 1);
      setSessionType("break");
      setTimeRemaining(DEFAULT_BREAK_DURATION);
    } else {
      setSessionType("work");
      setTimeRemaining(DEFAULT_WORK_DURATION);
    }
  }, [sessionType]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSessionType("work");
    setTimeRemaining(DEFAULT_WORK_DURATION);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8 shadow-lg">
        <TimerDisplay
          timeRemaining={timeRemaining}
          sessionType={sessionType}
          sessionsCompleted={sessionsCompleted}
          isRunning={isRunning}
        />

        <div className="mt-8">
          <TimerControls
            isRunning={isRunning}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
          />
        </div>
      </Card>
    </div>
  );
}
