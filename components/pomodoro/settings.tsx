"use client";

import { useEffect, useState } from "react";
import { Bell, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEFAULT_SETTINGS, PomodoroSettings } from "@/lib/pomodoro/constants";
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

function DurationField({ label, value, onChange }: DurationFieldProps) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/6 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-sm text-slate-400">Stored in minutes and applied to the next reset.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="rounded-full border-white/12 bg-white/8 text-white hover:bg-white/12"
        >
          -
        </Button>
        <input
          type="number"
          min={1}
          value={value}
          onChange={(event) => onChange(Math.max(1, Number(event.target.value) || 1))}
          className="h-11 w-16 rounded-full border border-white/12 bg-slate-950/80 text-center text-white outline-none"
          aria-label={label}
        />
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={() => onChange(value + 1)}
          className="rounded-full border-white/12 bg-white/8 text-white hover:bg-white/12"
        >
          +
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

  const handleSave = () => {
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
    persist(DEFAULT_SETTINGS);
  };

  return (
    <Card className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 text-white shadow-[0_30px_120px_rgba(2,6,23,0.45)] backdrop-blur sm:p-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Settings</p>
        <h2 className="text-3xl font-semibold tracking-tight">Tune your focus cadence</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          These values define the timer model used across the app. The defaults now match a standard 25 / 5 / 15 pomodoro cycle.
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        <DurationField
          label="Focus duration"
          value={formState.workMin}
          onChange={(workMin) => setFormState((current) => ({ ...current, workMin }))}
        />
        <DurationField
          label="Short break"
          value={formState.breakMin}
          onChange={(breakMin) => setFormState((current) => ({ ...current, breakMin }))}
        />
        <DurationField
          label="Long break"
          value={formState.longBreakMin}
          onChange={(longBreakMin) => setFormState((current) => ({ ...current, longBreakMin }))}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <span className="flex items-center gap-3 text-sm text-white">
              <Volume2 className="size-4 text-rose-200" />
              Sound cues
            </span>
            <input
              type="checkbox"
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
              <Bell className="size-4 text-sky-200" />
              Desktop notifications
            </span>
            <input
              type="checkbox"
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
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleResetDefaults}
          className="rounded-full border-white/12 bg-white/6 text-white hover:bg-white/10"
        >
          Reset defaults
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          className="rounded-full border-white/12 bg-transparent text-white hover:bg-white/8"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="rounded-full bg-linear-to-r from-rose-500 via-orange-400 to-amber-300 px-6 text-slate-950 hover:brightness-105"
        >
          Save settings
        </Button>
      </div>
    </Card>
  );
}

export default Settings;
