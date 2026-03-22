import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { withTempDir } from "../test-helpers/temp-dir.js";
import {
  resolveDefaultConfigCandidates,
  resolveConfigPathCandidate,
  resolveConfigPath,
  resolveOAuthDir,
  resolveOAuthPath,
  resolveStateDir,
} from "./paths.js";

describe("oauth paths", () => {
  it("prefers QUANTUMCLAW_OAUTH_DIR over QUANTUMCLAW_STATE_DIR", () => {
    const env = {
      QUANTUMCLAW_OAUTH_DIR: "/custom/oauth",
      QUANTUMCLAW_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.resolve("/custom/oauth"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join(path.resolve("/custom/oauth"), "oauth.json"),
    );
  });

  it("derives oauth path from QUANTUMCLAW_STATE_DIR when unset", () => {
    const env = {
      QUANTUMCLAW_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.join("/custom/state", "credentials"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join("/custom/state", "credentials", "oauth.json"),
    );
  });
});

describe("state + config path candidates", () => {
  function expectQuantumClawHomeDefaults(env: NodeJS.ProcessEnv): void {
    const configuredHome = env.QUANTUMCLAW_HOME;
    if (!configuredHome) {
      throw new Error("QUANTUMCLAW_HOME must be set for this assertion helper");
    }
    const resolvedHome = path.resolve(configuredHome);
    expect(resolveStateDir(env)).toBe(path.join(resolvedHome, ".quantumclaw"));

    const candidates = resolveDefaultConfigCandidates(env);
    expect(candidates[0]).toBe(path.join(resolvedHome, ".quantumclaw", "quantumclaw.json"));
  }

  it("uses QUANTUMCLAW_STATE_DIR when set", () => {
    const env = {
      QUANTUMCLAW_STATE_DIR: "/new/state",
    } as NodeJS.ProcessEnv;

    expect(resolveStateDir(env, () => "/home/test")).toBe(path.resolve("/new/state"));
  });

  it("uses QUANTUMCLAW_HOME for default state/config locations", () => {
    const env = {
      QUANTUMCLAW_HOME: "/srv/quantumclaw-home",
    } as NodeJS.ProcessEnv;
    expectQuantumClawHomeDefaults(env);
  });

  it("prefers QUANTUMCLAW_HOME over HOME for default state/config locations", () => {
    const env = {
      QUANTUMCLAW_HOME: "/srv/quantumclaw-home",
      HOME: "/home/other",
    } as NodeJS.ProcessEnv;
    expectQuantumClawHomeDefaults(env);
  });

  it("orders default config candidates in a stable order", () => {
    const home = "/home/test";
    const resolvedHome = path.resolve(home);
    const candidates = resolveDefaultConfigCandidates({} as NodeJS.ProcessEnv, () => home);
    const expected = [
      path.join(resolvedHome, ".quantumclaw", "quantumclaw.json"),
      path.join(resolvedHome, ".quantumclaw", "clawdbot.json"),
      path.join(resolvedHome, ".quantumclaw", "moldbot.json"),
      path.join(resolvedHome, ".quantumclaw", "moltbot.json"),
      path.join(resolvedHome, ".clawdbot", "quantumclaw.json"),
      path.join(resolvedHome, ".clawdbot", "clawdbot.json"),
      path.join(resolvedHome, ".clawdbot", "moldbot.json"),
      path.join(resolvedHome, ".clawdbot", "moltbot.json"),
      path.join(resolvedHome, ".moldbot", "quantumclaw.json"),
      path.join(resolvedHome, ".moldbot", "clawdbot.json"),
      path.join(resolvedHome, ".moldbot", "moldbot.json"),
      path.join(resolvedHome, ".moldbot", "moltbot.json"),
      path.join(resolvedHome, ".moltbot", "quantumclaw.json"),
      path.join(resolvedHome, ".moltbot", "clawdbot.json"),
      path.join(resolvedHome, ".moltbot", "moldbot.json"),
      path.join(resolvedHome, ".moltbot", "moltbot.json"),
    ];
    expect(candidates).toEqual(expected);
  });

  it("prefers ~/.quantumclaw when it exists and legacy dir is missing", async () => {
    await withTempDir({ prefix: "quantumclaw-state-" }, async (root) => {
      const newDir = path.join(root, ".quantumclaw");
      await fs.mkdir(newDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("falls back to existing legacy state dir when ~/.quantumclaw is missing", async () => {
    await withTempDir({ prefix: "quantumclaw-state-legacy-" }, async (root) => {
      const legacyDir = path.join(root, ".clawdbot");
      await fs.mkdir(legacyDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyDir);
    });
  });

  it("CONFIG_PATH prefers existing config when present", async () => {
    await withTempDir({ prefix: "quantumclaw-config-" }, async (root) => {
      const legacyDir = path.join(root, ".quantumclaw");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyPath = path.join(legacyDir, "quantumclaw.json");
      await fs.writeFile(legacyPath, "{}", "utf-8");

      const resolved = resolveConfigPathCandidate({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyPath);
    });
  });

  it("respects state dir overrides when config is missing", async () => {
    await withTempDir({ prefix: "quantumclaw-config-override-" }, async (root) => {
      const legacyDir = path.join(root, ".quantumclaw");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyConfig = path.join(legacyDir, "quantumclaw.json");
      await fs.writeFile(legacyConfig, "{}", "utf-8");

      const overrideDir = path.join(root, "override");
      const env = { QUANTUMCLAW_STATE_DIR: overrideDir } as NodeJS.ProcessEnv;
      const resolved = resolveConfigPath(env, overrideDir, () => root);
      expect(resolved).toBe(path.join(overrideDir, "quantumclaw.json"));
    });
  });
});
