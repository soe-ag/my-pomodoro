"use client";

import { useEffect, useState } from "react";
import { Bell, Minus, Plus, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DEFAULT_SETTINGS,
  MAX_SESSION_DURATION_MINUTES,
  MIN_SESSION_DURATION_MINUTES,
  type PomodoroSettings,
} from "@/lib/pomodoro/constants";
import {
  loadSettings,
  requestNotificationPermission,
  saveSettingsAndNotify,
} from "@/lib/pomodoro/storage";

interface SettingsProps {
  onClose?: () => void;
  onSave?: (settings: PomodoroSettings) => void;
}

interface DurationFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

interface SettingsFormState {
  workMin: number;
  breakMin: number;
  longBreakMin: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

const toFormState = (settings: PomodoroSettings): SettingsFormState => ({
  workMin: Math.round(settings.workDuration / 60),
  breakMin: Math.round(settings.breakDuration / 60),
  longBreakMin: Math.round(settings.longBreakDuration / 60),
  soundEnabled: settings.soundEnabled,
  notificationsEnabled: settings.notificationsEnabled,
});

const clampDuration = (value: number): number =>
  Math.min(
    MAX_SESSION_DURATION_MINUTES,
    Math.max(MIN_SESSION_DURATION_MINUTES, value),
  );

function DurationField({ id, label, value, onChange }: DurationFieldProps) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/6 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <label className="text-sm font-medium text-white" htmlFor={id}>
          {label}
        </label>
        <p className="text-sm text-slate-400" id={`${id}-description`}>
          Applied the next time this session resets.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={() => onChange(clampDuration(value - 1))}
          className="size-11 rounded-full border-white/12 bg-white/8 text-white hover:bg-white/12"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus aria-hidden="true" className="size-4" />
        </Button>
        <input
          id={id}
          name={id}
          type="number"
          min={MIN_SESSION_DURATION_MINUTES}
          max={MAX_SESSION_DURATION_MINUTES}
          inputMode="numeric"
          autoComplete="off"
          aria-describedby={`${id}-description`}
          value={value}
          onChange={(event) => onChange(clampDuration(Number(event.target.value) || 1))}
          className="h-11 w-20 rounded-full border border-white/12 bg-slate-950/80 text-center font-mono text-white tabular-nums outline-none focus-visible:border-rose-300/60 focus-visible:ring-2 focus-visible:ring-rose-300/30"
        />
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={() => onChange(clampDuration(value + 1))}
          className="size-11 rounded-full border-white/12 bg-white/8 text-white hover:bg-white/12"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function Settings({ onClose, onSave }: SettingsProps) {
  const [formState, setFormState] = useState<SettingsFormState>(() =>
    toFormState(DEFAULT_SETTINGS),
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFormState(toFormState(loadSettings()));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const persist = (settings: PomodoroSettings) => {
    saveSettingsAndNotify(settings);
    if (settings.notificationsEnabled) {
      requestNotificationPermission();
    }
    onSave?.(settings);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const settings: PomodoroSettings = {
      workDuration: formState.workMin * 60,
      breakDuration: formState.breakMin * 60,
      longBreakDuration: formState.longBreakMin * 60,
      soundEnabled: formState.soundEnabled,
      notificationsEnabled: formState.notificationsEnabled,
    };

    persist(settings);
    onClose?.();
  };

  const handleResetDefaults = () => {
    setFormState(toFormState(DEFAULT_SETTINGS));
  };

  return (
    <Card
      className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 text-white shadow-[0_30px_120px_rgba(2,6,23,0.45)] backdrop-blur sm:p-8"
      role="region"
      aria-labelledby="settings-title"
    >
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Settings</p>
        <h2 id="settings-title" className="text-pretty text-3xl font-semibold tracking-tight">
          Tune Your Focus Cadence
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Choose a rhythm that supports your attention. New durations take effect
          when the current session resets.
        </p>
      </div>

      <form className="mt-8 grid gap-4" onSubmit={handleSave}>
        <DurationField
          id="focus-duration"
          label="Focus duration"
          value={formState.workMin}
          onChange={(workMin) => setFormState((current) => ({ ...current, workMin }))}
        />
        <DurationField
          id="short-break-duration"
          label="Short break"
          value={formState.breakMin}
          onChange={(breakMin) => setFormState((current) => ({ ...current, breakMin }))}
        />
        <DurationField
          id="long-break-duration"
          label="Long break"
          value={formState.longBreakMin}
          onChange={(longBreakMin) => setFormState((current) => ({ ...current, longBreakMin }))}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <span className="flex items-center gap-3 text-sm text-white">
              <Volume2 aria-hidden="true" className="size-4 text-rose-200" />
              Sound Cues
            </span>
            <input
              type="checkbox"
              name="sound-enabled"
              checked={formState.soundEnabled}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  soundEnabled: event.target.checked,
                }))
              }
            />
          </label>

          <label className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <span className="flex items-center gap-3 text-sm text-white">
              <Bell aria-hidden="true" className="size-4 text-sky-200" />
              Desktop Notifications
            </span>
            <input
              type="checkbox"
              name="notifications-enabled"
              checked={formState.notificationsEnabled}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  notificationsEnabled: event.target.checked,
                }))
              }
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetDefaults}
            className="min-h-11 rounded-full border-white/12 bg-white/6 text-white hover:bg-white/10"
          >
            Restore Defaults
          </Button>
          {onClose ? (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-h-11 rounded-full border-white/12 bg-transparent text-white hover:bg-white/8"
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="submit"
            className="min-h-11 rounded-full bg-linear-to-r from-rose-500 via-orange-400 to-amber-300 px-6 text-slate-950 hover:brightness-105"
          >
            Save Settings
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default Settings;
