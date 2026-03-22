import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "quantumclaw",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "quantumclaw", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "quantumclaw", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "quantumclaw", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "quantumclaw", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "quantumclaw", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "quantumclaw", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "quantumclaw", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "quantumclaw", "--profile", "work", "--dev", "status"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".quantumclaw-dev");
    expect(env.QUANTUMCLAW_PROFILE).toBe("dev");
    expect(env.QUANTUMCLAW_STATE_DIR).toBe(expectedStateDir);
    expect(env.QUANTUMCLAW_CONFIG_PATH).toBe(path.join(expectedStateDir, "quantumclaw.json"));
    expect(env.QUANTUMCLAW_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      QUANTUMCLAW_STATE_DIR: "/custom",
      QUANTUMCLAW_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.QUANTUMCLAW_STATE_DIR).toBe("/custom");
    expect(env.QUANTUMCLAW_GATEWAY_PORT).toBe("19099");
    expect(env.QUANTUMCLAW_CONFIG_PATH).toBe(path.join("/custom", "quantumclaw.json"));
  });

  it("uses QUANTUMCLAW_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      QUANTUMCLAW_HOME: "/srv/quantumclaw-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/quantumclaw-home");
    expect(env.QUANTUMCLAW_STATE_DIR).toBe(path.join(resolvedHome, ".quantumclaw-work"));
    expect(env.QUANTUMCLAW_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".quantumclaw-work", "quantumclaw.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "quantumclaw doctor --fix",
      env: {},
      expected: "quantumclaw doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "quantumclaw doctor --fix",
      env: { QUANTUMCLAW_PROFILE: "default" },
      expected: "quantumclaw doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "quantumclaw doctor --fix",
      env: { QUANTUMCLAW_PROFILE: "Default" },
      expected: "quantumclaw doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "quantumclaw doctor --fix",
      env: { QUANTUMCLAW_PROFILE: "bad profile" },
      expected: "quantumclaw doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "quantumclaw --profile work doctor --fix",
      env: { QUANTUMCLAW_PROFILE: "work" },
      expected: "quantumclaw --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "quantumclaw --dev doctor",
      env: { QUANTUMCLAW_PROFILE: "dev" },
      expected: "quantumclaw --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("quantumclaw doctor --fix", { QUANTUMCLAW_PROFILE: "work" })).toBe(
      "quantumclaw --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("quantumclaw doctor --fix", { QUANTUMCLAW_PROFILE: "  jbquantumclaw  " })).toBe(
      "quantumclaw --profile jbquantumclaw doctor --fix",
    );
  });

  it("handles command with no args after quantumclaw", () => {
    expect(formatCliCommand("quantumclaw", { QUANTUMCLAW_PROFILE: "test" })).toBe(
      "quantumclaw --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm quantumclaw doctor", { QUANTUMCLAW_PROFILE: "work" })).toBe(
      "pnpm quantumclaw --profile work doctor",
    );
  });
});
