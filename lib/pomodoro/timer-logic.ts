import { SessionType, PomodoroSettings, DEFAULT_SETTINGS } from "./constants";

export interface TimerState {
  timeRemaining: number; // in seconds
  isRunning: boolean;
  sessionType: SessionType;
  sessionsCompleted: number;
}

type AudioContextConstructor = typeof AudioContext;
type DurationSettingKey =
  | "workDuration"
  | "breakDuration"
  | "longBreakDuration";

const SESSION_LABELS: Record<SessionType, string> = {
  work: "Work Session",
  break: "Short Break",
  "long-break": "Long Break (Light Blue)",
};

const SESSION_DURATIONS: Record<SessionType, DurationSettingKey> = {
  work: "workDuration",
  break: "breakDuration",
  "long-break": "longBreakDuration",
};

const getAudioContextConstructor = (): AudioContextConstructor | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: AudioContextConstructor })
      .webkitAudioContext
  );
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const getSessionLabel = (sessionType: SessionType): string => {
  return SESSION_LABELS[sessionType] ?? "";
};

export const playNotificationSound = (): void => {
  const AudioCtx = getAudioContextConstructor();
  if (!AudioCtx) return;

  const audioContext = new AudioCtx();
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

export const playChirpSound = (): void => {
  const AudioCtx = getAudioContextConstructor();
  if (!AudioCtx) return;

  const audioContext = new AudioCtx();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(
    1200,
    audioContext.currentTime + 0.18,
  );

  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.18,
    audioContext.currentTime + 0.02,
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.25,
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.25);
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
  return s[SESSION_DURATIONS[sessionType]] ?? s.workDuration;
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
