import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          QUANTUMCLAW_STATE_DIR: "/tmp/quantumclaw-state",
          QUANTUMCLAW_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "quantumclaw-gateway",
        windowsTaskName: "QuantumClaw Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/quantumclaw-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/quantumclaw-state/logs/gateway.err.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        systemdServiceName: "quantumclaw-gateway",
        windowsTaskName: "QuantumClaw Gateway",
      }),
    ).toEqual(["Logs: journalctl --user -u quantumclaw-gateway.service -n 200 --no-pager"]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        systemdServiceName: "quantumclaw-gateway",
        windowsTaskName: "QuantumClaw Gateway",
      }),
    ).toEqual(['Logs: schtasks /Query /TN "QuantumClaw Gateway" /V /FO LIST']);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "quantumclaw gateway install",
        startCommand: "quantumclaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.quantumclaw.gateway.plist",
        systemdServiceName: "quantumclaw-gateway",
        windowsTaskName: "QuantumClaw Gateway",
      }),
    ).toEqual([
      "quantumclaw gateway install",
      "quantumclaw gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.quantumclaw.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "quantumclaw gateway install",
        startCommand: "quantumclaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.quantumclaw.gateway.plist",
        systemdServiceName: "quantumclaw-gateway",
        windowsTaskName: "QuantumClaw Gateway",
      }),
    ).toEqual([
      "quantumclaw gateway install",
      "quantumclaw gateway",
      "systemctl --user start quantumclaw-gateway.service",
    ]);
  });
});
