import { SessionType } from "./constants";

export interface SessionTheme {
  label: string;
  shortLabel: string;
  description: string;
  badgeClassName: string;
  buttonClassName: string;
  textClassName: string;
  progressClassName: string;
  panelClassName: string;
  accentColor: string;
}

const SESSION_THEMES: Record<SessionType, SessionTheme> = {
  work: {
    label: "Focus Session",
    shortLabel: "Focus",
    description: "Deep work block for your current priority.",
    badgeClassName:
      "border-rose-400/30 bg-rose-400/10 text-rose-100 shadow-[0_0_40px_rgba(251,113,133,0.16)]",
    buttonClassName:
      "from-rose-500 via-orange-400 to-amber-300 text-slate-950 hover:brightness-105",
    textClassName: "from-rose-300 via-orange-200 to-amber-100",
    progressClassName: "from-rose-500 via-orange-400 to-amber-300",
    panelClassName:
      "border-rose-400/20 bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.16),transparent_55%)]",
    accentColor: "#fb7185",
  },
  break: {
    label: "Short Reset",
    shortLabel: "Break",
    description: "Step away, breathe, and reset your attention.",
    badgeClassName:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-100 shadow-[0_0_40px_rgba(52,211,153,0.16)]",
    buttonClassName:
      "from-emerald-400 via-teal-300 to-cyan-200 text-slate-950 hover:brightness-105",
    textClassName: "from-emerald-200 via-teal-100 to-cyan-50",
    progressClassName: "from-emerald-400 via-teal-300 to-cyan-200",
    panelClassName:
      "border-emerald-400/20 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.16),transparent_55%)]",
    accentColor: "#34d399",
  },
  "long-break": {
    label: "Long Recovery",
    shortLabel: "Long Break",
    description: "A longer pause after a full focus cycle.",
    badgeClassName:
      "border-sky-400/30 bg-sky-400/10 text-sky-100 shadow-[0_0_40px_rgba(56,189,248,0.16)]",
    buttonClassName:
      "from-sky-400 via-blue-300 to-indigo-200 text-slate-950 hover:brightness-105",
    textClassName: "from-sky-200 via-blue-100 to-indigo-50",
    progressClassName: "from-sky-400 via-blue-300 to-indigo-200",
    panelClassName:
      "border-sky-400/20 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_55%)]",
    accentColor: "#38bdf8",
  },
};

export const getSessionTheme = (sessionType: SessionType): SessionTheme =>
  SESSION_THEMES[sessionType];
