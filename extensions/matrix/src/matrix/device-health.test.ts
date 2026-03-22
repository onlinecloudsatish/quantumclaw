import { describe, expect, it } from "vitest";
import { isQuantumClawManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects QuantumClaw-managed device names", () => {
    expect(isQuantumClawManagedMatrixDevice("QuantumClaw Gateway")).toBe(true);
    expect(isQuantumClawManagedMatrixDevice("QuantumClaw Debug")).toBe(true);
    expect(isQuantumClawManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isQuantumClawManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale QuantumClaw-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "QuantumClaw Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "QuantumClaw Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "QuantumClaw Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary.currentDeviceId).toBe("du314Zpw3A");
    expect(summary.currentQuantumClawDevices).toEqual([
      expect.objectContaining({ deviceId: "du314Zpw3A" }),
    ]);
    expect(summary.staleQuantumClawDevices).toEqual([
      expect.objectContaining({ deviceId: "BritdXC6iL" }),
      expect.objectContaining({ deviceId: "G6NJU9cTgs" }),
    ]);
  });
});
