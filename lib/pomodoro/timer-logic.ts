import { SessionType } from "./constants";

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
      return "Long Break";
    default:
      return "";
  }
};

export const playNotificationSound = (): void => {
  // Create a simple beep sound
  const audioContext = new (
    window.AudioContext || (window as any).webkitAudioContext
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
    audioContext.currentTime + 0.5
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

export const sendBrowserNotification = (
  title: string,
  options?: NotificationOptions
): void => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, options);
  }
};
