import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/pomodoro/constants";
import {
  loadSettings,
  saveSettingsAndNotify,
} from "@/lib/pomodoro/storage";
import { Settings } from "./settings";

describe("Settings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps restored defaults in the form until the user saves", async () => {
    const customSettings = {
      ...DEFAULT_SETTINGS,
      workDuration: 10 * 60,
    };
    const onSave = vi.fn();

    saveSettingsAndNotify(customSettings);
    render(<Settings onSave={onSave} />);

    const focusDuration = await screen.findByRole("spinbutton", {
      name: "Focus duration",
    });
    await waitFor(() =>
      expect((focusDuration as HTMLInputElement).value).toBe("10"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Restore Defaults" }));

    expect((focusDuration as HTMLInputElement).value).toBe("25");
    expect(loadSettings()).toEqual(customSettings);

    fireEvent.click(screen.getByRole("button", { name: "Save Settings" }));

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(onSave).toHaveBeenCalledWith(DEFAULT_SETTINGS);
  });
});
