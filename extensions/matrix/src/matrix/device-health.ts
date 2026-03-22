export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

export type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleQuantumClawDevices: MatrixManagedDeviceInfo[];
  currentQuantumClawDevices: MatrixManagedDeviceInfo[];
};

const QUANTUMCLAW_DEVICE_NAME_PREFIX = "QuantumClaw ";

export function isQuantumClawManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(QUANTUMCLAW_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const openClawDevices = devices.filter((device) =>
    isQuantumClawManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleQuantumClawDevices: openClawDevices.filter((device) => !device.current),
    currentQuantumClawDevices: openClawDevices.filter((device) => device.current),
  };
}
