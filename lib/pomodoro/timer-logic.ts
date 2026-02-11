import { SessionType, PomodoroSettings, DEFAULT_SETTINGS } from "./constants";

export interface TimerState {
  timeRemaining: number; // in seconds
  isRunning: boolean;
  sessionType: SessionType;
  sessionsCompleted: number;
}

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const getSessionLabel = (sessionType: SessionType): string => {
  switch (sessionType) {
    case "work":
      return "Work Session";
    case "break":
      return "Short Break";
    case "long-break":
      return "Long Break (Light Blue)";
    default:
      return "";
  }
};

export const playNotificationSound = (): void => {
  // Create a simple beep sound
  const audioContext = new (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  )();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.5,
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

export const sendBrowserNotification = (
  title: string,
  options?: NotificationOptions,
): void => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, options);
  }
};

export const getSessionDuration = (
  sessionType: SessionType,
  settings?: PomodoroSettings,
): number => {
  const s = settings ?? DEFAULT_SETTINGS;
  switch (sessionType) {
    case "work":
      return s.workDuration;
    case "break":
      return s.breakDuration;
    case "long-break":
      return s.longBreakDuration;
    default:
      return s.workDuration;
  }
};

export const getNextSession = (
  current: SessionType,
  sessionsCompleted: number,
  settings?: PomodoroSettings,
): { next: SessionType; duration: number; sessionsCompleted: number } => {
  const s = settings ?? DEFAULT_SETTINGS;

  if (current === "work") {
    const newCount = sessionsCompleted + 1;
    if (newCount % 4 === 0) {
      return {
        next: "long-break",
        duration: s.longBreakDuration,
        sessionsCompleted: newCount,
      };
    }
    return {
      next: "break",
      duration: s.breakDuration,
      sessionsCompleted: newCount,
    };
  }

  // If currently on a break (short or long), always go to work
  return { next: "work", duration: s.workDuration, sessionsCompleted };
};
