import {
  DEFAULT_SETTINGS,
  PomodoroSettings,
  SessionType,
  WORK_SESSIONS_PER_CYCLE,
} from "./constants";

export interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  sessionType: SessionType;
  sessionsCompleted: number;
}

let sharedAudioContext: AudioContext | null = null;

export const resetAudioContextForTests = (): void => {
  if (process.env.NODE_ENV === "test") {
    sharedAudioContext = null;
  }
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") {
    return null;
  }

  if (sharedAudioContext) {
    return sharedAudioContext;
  }

  const BrowserAudioContext =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  sharedAudioContext = BrowserAudioContext ? new BrowserAudioContext() : null;
  return sharedAudioContext;
};

export const unlockAudio = (): void => {
  const audioContext = getAudioContext();

  if (audioContext?.state === "suspended") {
    void audioContext.resume().catch(() => undefined);
  }
};

const playTone = (
  configure: (
    context: AudioContext,
    oscillator: OscillatorNode,
    gain: GainNode,
  ) => number,
): void => {
  const audioContext = getAudioContext();
  if (!audioContext) {
    return;
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume().catch(() => undefined);
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const stopAfter = configure(audioContext, oscillator, gainNode);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + stopAfter);
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const getSessionLabel = (sessionType: SessionType): string => {
  switch (sessionType) {
    case "work":
      return "Focus Session";
    case "break":
      return "Short Break";
    case "long-break":
      return "Long Break";
  }
};

export const playNotificationSound = (): void => {
  playTone((context, oscillator, gainNode) => {
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.45,
    );
    return 0.45;
  });
};

export const playChirpSound = (): void => {
  playTone((context, oscillator, gainNode) => {
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(520, context.currentTime);
    oscillator.frequency.linearRampToValueAtTime(
      1040,
      context.currentTime + 0.18,
    );
    gainNode.gain.setValueAtTime(0.0001, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.14,
      context.currentTime + 0.02,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.24,
    );
    return 0.24;
  });
};

export const sendBrowserNotification = (
  title: string,
  options?: NotificationOptions,
): void => {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  new Notification(title, options);
};

export const getSessionDuration = (
  sessionType: SessionType,
  settings: PomodoroSettings = DEFAULT_SETTINGS,
): number => {
  switch (sessionType) {
    case "work":
      return settings.workDuration;
    case "break":
      return settings.breakDuration;
    case "long-break":
      return settings.longBreakDuration;
  }
};

export const getNextSession = (
  current: SessionType,
  sessionsCompleted: number,
  settings: PomodoroSettings = DEFAULT_SETTINGS,
): { next: SessionType; duration: number; sessionsCompleted: number } => {
  if (current === "work") {
    const nextCompletedCount = sessionsCompleted + 1;
    const nextType =
      nextCompletedCount % WORK_SESSIONS_PER_CYCLE === 0
        ? "long-break"
        : "break";

    return {
      next: nextType,
      duration: getSessionDuration(nextType, settings),
      sessionsCompleted: nextCompletedCount,
    };
  }

  return {
    next: "work",
    duration: settings.workDuration,
    sessionsCompleted,
  };
};
