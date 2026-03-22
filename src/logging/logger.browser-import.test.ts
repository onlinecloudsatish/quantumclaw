import { afterEach, describe, expect, it, vi } from "vitest";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredQuantumClawTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredQuantumClawTmpDir: ReturnType<typeof vi.fn>;
}> {
  vi.resetModules();
  const resolvePreferredQuantumClawTmpDir =
    params?.resolvePreferredQuantumClawTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredQuantumClawTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-quantumclaw-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-quantumclaw-dir.js")>(
      "../infra/tmp-quantumclaw-dir.js",
    );
    return {
      ...actual,
      resolvePreferredQuantumClawTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await import("./logger.js");
  return { module, resolvePreferredQuantumClawTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("../infra/tmp-quantumclaw-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredQuantumClawTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredQuantumClawTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/quantumclaw");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/quantumclaw/quantumclaw.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredQuantumClawTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toMatchObject({
      level: "silent",
      file: "/tmp/quantumclaw/quantumclaw.log",
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(() => module.getLogger().info("browser-safe")).not.toThrow();
    expect(resolvePreferredQuantumClawTmpDir).not.toHaveBeenCalled();
  });
});
