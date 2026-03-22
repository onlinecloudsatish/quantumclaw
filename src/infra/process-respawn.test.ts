import { afterEach, describe, expect, it, vi } from "vitest";
import { captureFullEnv } from "../test-utils/env.js";
import { SUPERVISOR_HINT_ENV_VARS } from "./supervisor-markers.js";

const spawnMock = vi.hoisted(() => vi.fn());
const triggerQuantumClawRestartMock = vi.hoisted(() => vi.fn());
const scheduleDetachedLaunchdRestartHandoffMock = vi.hoisted(() => vi.fn());

vi.mock("node:child_process", () => ({
  spawn: (...args: unknown[]) => spawnMock(...args),
}));
vi.mock("./restart.js", () => ({
  triggerQuantumClawRestart: (...args: unknown[]) => triggerQuantumClawRestartMock(...args),
}));
vi.mock("../daemon/launchd-restart-handoff.js", () => ({
  scheduleDetachedLaunchdRestartHandoff: (...args: unknown[]) =>
    scheduleDetachedLaunchdRestartHandoffMock(...args),
}));

import { restartGatewayProcessWithFreshPid } from "./process-respawn.js";

const originalArgv = [...process.argv];
const originalExecArgv = [...process.execArgv];
const envSnapshot = captureFullEnv();
const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(process, "platform");

function setPlatform(platform: string) {
  if (!originalPlatformDescriptor) {
    return;
  }
  Object.defineProperty(process, "platform", {
    ...originalPlatformDescriptor,
    value: platform,
  });
}

afterEach(() => {
  envSnapshot.restore();
  process.argv = [...originalArgv];
  process.execArgv = [...originalExecArgv];
  spawnMock.mockClear();
  triggerQuantumClawRestartMock.mockClear();
  scheduleDetachedLaunchdRestartHandoffMock.mockReset();
  scheduleDetachedLaunchdRestartHandoffMock.mockReturnValue({ ok: true, pid: 8123 });
  if (originalPlatformDescriptor) {
    Object.defineProperty(process, "platform", originalPlatformDescriptor);
  }
});

function clearSupervisorHints() {
  for (const key of SUPERVISOR_HINT_ENV_VARS) {
    delete process.env[key];
  }
}

function expectLaunchdSupervisedWithoutKickstart(params?: {
  launchJobLabel?: string;
  detailContains?: string;
}) {
  setPlatform("darwin");
  if (params?.launchJobLabel) {
    process.env.LAUNCH_JOB_LABEL = params.launchJobLabel;
  }
  process.env.QUANTUMCLAW_LAUNCHD_LABEL = "ai.quantumclaw.gateway";
  const result = restartGatewayProcessWithFreshPid();
  expect(result.mode).toBe("supervised");
  if (params?.detailContains) {
    expect(result.detail).toContain(params.detailContains);
  }
  expect(scheduleDetachedLaunchdRestartHandoffMock).toHaveBeenCalledWith({
    env: process.env,
    mode: "start-after-exit",
    waitForPid: process.pid,
  });
  expect(triggerQuantumClawRestartMock).not.toHaveBeenCalled();
  expect(spawnMock).not.toHaveBeenCalled();
}

describe("restartGatewayProcessWithFreshPid", () => {
  it("returns disabled when QUANTUMCLAW_NO_RESPAWN is set", () => {
    process.env.QUANTUMCLAW_NO_RESPAWN = "1";
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("disabled");
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns supervised when launchd hints are present on macOS (no kickstart)", () => {
    clearSupervisorHints();
    expectLaunchdSupervisedWithoutKickstart({
      launchJobLabel: "ai.quantumclaw.gateway",
      detailContains: "launchd restart handoff",
    });
  });

  it("returns supervised on macOS when launchd label is set (no kickstart)", () => {
    expectLaunchdSupervisedWithoutKickstart({ launchJobLabel: "ai.quantumclaw.gateway" });
  });

  it("launchd supervisor never returns failed regardless of triggerQuantumClawRestart outcome", () => {
    clearSupervisorHints();
    setPlatform("darwin");
    process.env.QUANTUMCLAW_LAUNCHD_LABEL = "ai.quantumclaw.gateway";
    // Even if triggerQuantumClawRestart *would* fail, launchd path must not call it.
    triggerQuantumClawRestartMock.mockReturnValue({
      ok: false,
      method: "launchctl",
      detail: "Bootstrap failed: 5: Input/output error",
    });
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(result.mode).not.toBe("failed");
    expect(triggerQuantumClawRestartMock).not.toHaveBeenCalled();
  });

  it("falls back to plain supervised exit when launchd handoff scheduling fails", () => {
    clearSupervisorHints();
    setPlatform("darwin");
    process.env.XPC_SERVICE_NAME = "ai.quantumclaw.gateway";
    scheduleDetachedLaunchdRestartHandoffMock.mockReturnValue({
      ok: false,
      detail: "spawn failed",
    });

    const result = restartGatewayProcessWithFreshPid();

    expect(result).toEqual({
      mode: "supervised",
      detail: "launchd exit fallback (spawn failed)",
    });
    expect(triggerQuantumClawRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("does not schedule kickstart on non-darwin platforms", () => {
    setPlatform("linux");
    process.env.INVOCATION_ID = "abc123";
    process.env.QUANTUMCLAW_LAUNCHD_LABEL = "ai.quantumclaw.gateway";

    const result = restartGatewayProcessWithFreshPid();

    expect(result.mode).toBe("supervised");
    expect(triggerQuantumClawRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns supervised when XPC_SERVICE_NAME is set by launchd", () => {
    clearSupervisorHints();
    setPlatform("darwin");
    process.env.XPC_SERVICE_NAME = "ai.quantumclaw.gateway";
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(triggerQuantumClawRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("spawns detached child with current exec argv", () => {
    delete process.env.QUANTUMCLAW_NO_RESPAWN;
    clearSupervisorHints();
    setPlatform("linux");
    process.execArgv = ["--import", "tsx"];
    process.argv = ["/usr/local/bin/node", "/repo/dist/index.js", "gateway", "run"];
    spawnMock.mockReturnValue({ pid: 4242, unref: vi.fn() });

    const result = restartGatewayProcessWithFreshPid();

    expect(result).toEqual({ mode: "spawned", pid: 4242 });
    expect(spawnMock).toHaveBeenCalledWith(
      process.execPath,
      ["--import", "tsx", "/repo/dist/index.js", "gateway", "run"],
      expect.objectContaining({
        detached: true,
        stdio: "inherit",
      }),
    );
  });

  it("returns supervised when QUANTUMCLAW_LAUNCHD_LABEL is set (stock launchd plist)", () => {
    clearSupervisorHints();
    expectLaunchdSupervisedWithoutKickstart();
  });

  it("returns supervised when QUANTUMCLAW_SYSTEMD_UNIT is set", () => {
    clearSupervisorHints();
    setPlatform("linux");
    process.env.QUANTUMCLAW_SYSTEMD_UNIT = "quantumclaw-gateway.service";
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns supervised when QuantumClaw gateway task markers are set on Windows", () => {
    clearSupervisorHints();
    setPlatform("win32");
    process.env.QUANTUMCLAW_SERVICE_MARKER = "quantumclaw";
    process.env.QUANTUMCLAW_SERVICE_KIND = "gateway";
    triggerQuantumClawRestartMock.mockReturnValue({ ok: true, method: "schtasks" });
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(triggerQuantumClawRestartMock).toHaveBeenCalledOnce();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("keeps generic service markers out of non-Windows supervisor detection", () => {
    clearSupervisorHints();
    setPlatform("linux");
    process.env.QUANTUMCLAW_SERVICE_MARKER = "quantumclaw";
    process.env.QUANTUMCLAW_SERVICE_KIND = "gateway";
    spawnMock.mockReturnValue({ pid: 4242, unref: vi.fn() });

    const result = restartGatewayProcessWithFreshPid();

    expect(result).toEqual({ mode: "spawned", pid: 4242 });
    expect(triggerQuantumClawRestartMock).not.toHaveBeenCalled();
  });

  it("returns disabled on Windows without Scheduled Task markers", () => {
    clearSupervisorHints();
    setPlatform("win32");

    const result = restartGatewayProcessWithFreshPid();

    expect(result.mode).toBe("disabled");
    expect(result.detail).toContain("Scheduled Task");
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("ignores node task script hints for gateway restart detection on Windows", () => {
    clearSupervisorHints();
    setPlatform("win32");
    process.env.QUANTUMCLAW_TASK_SCRIPT = "C:\\quantumclaw\\node.cmd";
    process.env.QUANTUMCLAW_TASK_SCRIPT_NAME = "node.cmd";
    process.env.QUANTUMCLAW_SERVICE_MARKER = "quantumclaw";
    process.env.QUANTUMCLAW_SERVICE_KIND = "node";

    const result = restartGatewayProcessWithFreshPid();

    expect(result.mode).toBe("disabled");
    expect(triggerQuantumClawRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns failed when spawn throws", () => {
    delete process.env.QUANTUMCLAW_NO_RESPAWN;
    clearSupervisorHints();
    setPlatform("linux");

    spawnMock.mockImplementation(() => {
      throw new Error("spawn failed");
    });
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("failed");
    expect(result.detail).toContain("spawn failed");
  });
});
