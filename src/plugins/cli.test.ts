import { Command } from "commander";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuantumClawConfig } from "../config/config.js";

const mocks = vi.hoisted(() => ({
  memoryRegister: vi.fn(),
  otherRegister: vi.fn(),
  loadQuantumClawPlugins: vi.fn(),
}));

vi.mock("./loader.js", () => ({
  loadQuantumClawPlugins: (...args: unknown[]) => mocks.loadQuantumClawPlugins(...args),
}));

import { registerPluginCliCommands } from "./cli.js";

describe("registerPluginCliCommands", () => {
  beforeEach(() => {
    mocks.memoryRegister.mockClear();
    mocks.otherRegister.mockClear();
    mocks.loadQuantumClawPlugins.mockReset();
    mocks.loadQuantumClawPlugins.mockReturnValue({
      cliRegistrars: [
        {
          pluginId: "memory-core",
          register: mocks.memoryRegister,
          commands: ["memory"],
          source: "bundled",
        },
        {
          pluginId: "other",
          register: mocks.otherRegister,
          commands: ["other"],
          source: "bundled",
        },
      ],
    });
  });

  it("skips plugin CLI registrars when commands already exist", () => {
    const program = new Command();
    program.command("memory");

    // oxlint-disable-next-line typescript/no-explicit-any
    registerPluginCliCommands(program, {} as any);

    expect(mocks.memoryRegister).not.toHaveBeenCalled();
    expect(mocks.otherRegister).toHaveBeenCalledTimes(1);
  });

  it("forwards an explicit env to plugin loading", () => {
    const program = new Command();
    const env = { QUANTUMCLAW_HOME: "/srv/quantumclaw-home" } as NodeJS.ProcessEnv;

    registerPluginCliCommands(program, {} as QuantumClawConfig, env);

    expect(mocks.loadQuantumClawPlugins).toHaveBeenCalledWith(
      expect.objectContaining({
        env,
      }),
    );
  });
});
