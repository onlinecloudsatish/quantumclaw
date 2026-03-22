import { describe, expect, it } from "vitest";
import {
  ensureQuantumClawExecMarkerOnProcess,
  markQuantumClawExecEnv,
  QUANTUMCLAW_CLI_ENV_VALUE,
  QUANTUMCLAW_CLI_ENV_VAR,
} from "./quantumclaw-exec-env.js";

describe("markQuantumClawExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", QUANTUMCLAW_CLI: "0" };
    const marked = markQuantumClawExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      QUANTUMCLAW_CLI: QUANTUMCLAW_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.QUANTUMCLAW_CLI).toBe("0");
  });
});

describe("ensureQuantumClawExecMarkerOnProcess", () => {
  it("mutates and returns the provided process env", () => {
    const env: NodeJS.ProcessEnv = { PATH: "/usr/bin" };

    expect(ensureQuantumClawExecMarkerOnProcess(env)).toBe(env);
    expect(env[QUANTUMCLAW_CLI_ENV_VAR]).toBe(QUANTUMCLAW_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[QUANTUMCLAW_CLI_ENV_VAR];
    delete process.env[QUANTUMCLAW_CLI_ENV_VAR];

    try {
      expect(ensureQuantumClawExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[QUANTUMCLAW_CLI_ENV_VAR]).toBe(QUANTUMCLAW_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        delete process.env[QUANTUMCLAW_CLI_ENV_VAR];
      } else {
        process.env[QUANTUMCLAW_CLI_ENV_VAR] = previous;
      }
    }
  });
});
