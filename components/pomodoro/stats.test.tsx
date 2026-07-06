import { waitFor } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Stats } from "./stats";
import { addSessionRecord, getToday } from "../../lib/pomodoro/storage";

const addCompletedFocusSession = () => {
  addSessionRecord({
    date: getToday(),
    type: "work",
    duration: 1500,
    completed: true,
    timestamp: Date.now(),
  });
};

describe("Stats", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps persisted stats out of the hydration render", async () => {
    addCompletedFocusSession();
    addCompletedFocusSession();

    const serverHtml = renderToString(<Stats />);
    expect(serverHtml).toMatch(/0.*completed focus sessions/);

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.appendChild(container);

    const root = hydrateRoot(container, <Stats />);

    await waitFor(() => {
      expect(container.textContent).toContain("2 completed focus sessions");
    });

    expect(
      consoleError.mock.calls.some((call) =>
        call.some((value) => String(value).includes("Hydration failed")),
      ),
    ).toBe(false);

    root.unmount();
    container.remove();
  });
});
