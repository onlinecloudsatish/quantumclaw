import { vi } from "vitest";
import { installChromeUserDataDirHooks } from "./chrome-user-data-dir.test-harness.js";

const chromeUserDataDir = { dir: "/tmp/quantumclaw" };
installChromeUserDataDirHooks(chromeUserDataDir);

vi.mock("./chrome.js", () => ({
  isChromeCdpReady: vi.fn(async () => true),
  isChromeReachable: vi.fn(async () => true),
  launchQuantumClawChrome: vi.fn(async () => {
    throw new Error("unexpected launch");
  }),
  resolveQuantumClawUserDataDir: vi.fn(() => chromeUserDataDir.dir),
  stopQuantumClawChrome: vi.fn(async () => {}),
}));
