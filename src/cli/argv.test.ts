import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getCommandPositionalsWithRootOptions,
  getCommandPathWithRootOptions,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  isRootHelpInvocation,
  isRootVersionInvocation,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it.each([
    {
      name: "help flag",
      argv: ["node", "quantumclaw", "--help"],
      expected: true,
    },
    {
      name: "version flag",
      argv: ["node", "quantumclaw", "-V"],
      expected: true,
    },
    {
      name: "normal command",
      argv: ["node", "quantumclaw", "status"],
      expected: false,
    },
    {
      name: "root -v alias",
      argv: ["node", "quantumclaw", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "quantumclaw", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with log-level",
      argv: ["node", "quantumclaw", "--log-level", "debug", "-v"],
      expected: true,
    },
    {
      name: "subcommand -v should not be treated as version",
      argv: ["node", "quantumclaw", "acp", "-v"],
      expected: false,
    },
    {
      name: "root -v alias with equals profile",
      argv: ["node", "quantumclaw", "--profile=work", "-v"],
      expected: true,
    },
    {
      name: "subcommand path after global root flags should not be treated as version",
      argv: ["node", "quantumclaw", "--dev", "skills", "list", "-v"],
      expected: false,
    },
  ])("detects help/version flags: $name", ({ argv, expected }) => {
    expect(hasHelpOrVersion(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --version",
      argv: ["node", "quantumclaw", "--version"],
      expected: true,
    },
    {
      name: "root -V",
      argv: ["node", "quantumclaw", "-V"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "quantumclaw", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "subcommand version flag",
      argv: ["node", "quantumclaw", "status", "--version"],
      expected: false,
    },
    {
      name: "unknown root flag with version",
      argv: ["node", "quantumclaw", "--unknown", "--version"],
      expected: false,
    },
  ])("detects root-only version invocations: $name", ({ argv, expected }) => {
    expect(isRootVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --help",
      argv: ["node", "quantumclaw", "--help"],
      expected: true,
    },
    {
      name: "root -h",
      argv: ["node", "quantumclaw", "-h"],
      expected: true,
    },
    {
      name: "root --help with profile",
      argv: ["node", "quantumclaw", "--profile", "work", "--help"],
      expected: true,
    },
    {
      name: "subcommand --help",
      argv: ["node", "quantumclaw", "status", "--help"],
      expected: false,
    },
    {
      name: "help before subcommand token",
      argv: ["node", "quantumclaw", "--help", "status"],
      expected: false,
    },
    {
      name: "help after -- terminator",
      argv: ["node", "quantumclaw", "nodes", "run", "--", "git", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag before help",
      argv: ["node", "quantumclaw", "--unknown", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag after help",
      argv: ["node", "quantumclaw", "--help", "--unknown"],
      expected: false,
    },
  ])("detects root-only help invocations: $name", ({ argv, expected }) => {
    expect(isRootHelpInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "single command with trailing flag",
      argv: ["node", "quantumclaw", "status", "--json"],
      expected: ["status"],
    },
    {
      name: "two-part command",
      argv: ["node", "quantumclaw", "agents", "list"],
      expected: ["agents", "list"],
    },
    {
      name: "terminator cuts parsing",
      argv: ["node", "quantumclaw", "status", "--", "ignored"],
      expected: ["status"],
    },
  ])("extracts command path: $name", ({ argv, expected }) => {
    expect(getCommandPath(argv, 2)).toEqual(expected);
  });

  it("extracts command path while skipping known root option values", () => {
    expect(
      getCommandPathWithRootOptions(
        ["node", "quantumclaw", "--profile", "work", "--no-color", "config", "validate"],
        2,
      ),
    ).toEqual(["config", "validate"]);
  });

  it("extracts routed config get positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "quantumclaw", "config", "get", "--log-level", "debug", "update.channel", "--json"],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("extracts routed config unset positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "quantumclaw", "config", "unset", "--profile", "work", "update.channel"],
        {
          commandPath: ["config", "unset"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("returns null when routed command sees unknown options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "quantumclaw", "config", "get", "--mystery", "value", "update.channel"],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toBeNull();
  });

  it.each([
    {
      name: "returns first command token",
      argv: ["node", "quantumclaw", "agents", "list"],
      expected: "agents",
    },
    {
      name: "returns null when no command exists",
      argv: ["node", "quantumclaw"],
      expected: null,
    },
    {
      name: "skips known root option values",
      argv: ["node", "quantumclaw", "--log-level", "debug", "status"],
      expected: "status",
    },
  ])("returns primary command: $name", ({ argv, expected }) => {
    expect(getPrimaryCommand(argv)).toBe(expected);
  });

  it.each([
    {
      name: "detects flag before terminator",
      argv: ["node", "quantumclaw", "status", "--json"],
      flag: "--json",
      expected: true,
    },
    {
      name: "ignores flag after terminator",
      argv: ["node", "quantumclaw", "--", "--json"],
      flag: "--json",
      expected: false,
    },
  ])("parses boolean flags: $name", ({ argv, flag, expected }) => {
    expect(hasFlag(argv, flag)).toBe(expected);
  });

  it.each([
    {
      name: "value in next token",
      argv: ["node", "quantumclaw", "status", "--timeout", "5000"],
      expected: "5000",
    },
    {
      name: "value in equals form",
      argv: ["node", "quantumclaw", "status", "--timeout=2500"],
      expected: "2500",
    },
    {
      name: "missing value",
      argv: ["node", "quantumclaw", "status", "--timeout"],
      expected: null,
    },
    {
      name: "next token is another flag",
      argv: ["node", "quantumclaw", "status", "--timeout", "--json"],
      expected: null,
    },
    {
      name: "flag appears after terminator",
      argv: ["node", "quantumclaw", "--", "--timeout=99"],
      expected: undefined,
    },
  ])("extracts flag values: $name", ({ argv, expected }) => {
    expect(getFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "quantumclaw", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "quantumclaw", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "quantumclaw", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it.each([
    {
      name: "missing flag",
      argv: ["node", "quantumclaw", "status"],
      expected: undefined,
    },
    {
      name: "missing value",
      argv: ["node", "quantumclaw", "status", "--timeout"],
      expected: null,
    },
    {
      name: "valid positive integer",
      argv: ["node", "quantumclaw", "status", "--timeout", "5000"],
      expected: 5000,
    },
    {
      name: "invalid integer",
      argv: ["node", "quantumclaw", "status", "--timeout", "nope"],
      expected: undefined,
    },
  ])("parses positive integer flag values: $name", ({ argv, expected }) => {
    expect(getPositiveIntFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("builds parse argv from raw args", () => {
    const cases = [
      {
        rawArgs: ["node", "quantumclaw", "status"],
        expected: ["node", "quantumclaw", "status"],
      },
      {
        rawArgs: ["node-22", "quantumclaw", "status"],
        expected: ["node-22", "quantumclaw", "status"],
      },
      {
        rawArgs: ["node-22.2.0.exe", "quantumclaw", "status"],
        expected: ["node-22.2.0.exe", "quantumclaw", "status"],
      },
      {
        rawArgs: ["node-22.2", "quantumclaw", "status"],
        expected: ["node-22.2", "quantumclaw", "status"],
      },
      {
        rawArgs: ["node-22.2.exe", "quantumclaw", "status"],
        expected: ["node-22.2.exe", "quantumclaw", "status"],
      },
      {
        rawArgs: ["/usr/bin/node-22.2.0", "quantumclaw", "status"],
        expected: ["/usr/bin/node-22.2.0", "quantumclaw", "status"],
      },
      {
        rawArgs: ["node24", "quantumclaw", "status"],
        expected: ["node24", "quantumclaw", "status"],
      },
      {
        rawArgs: ["/usr/bin/node24", "quantumclaw", "status"],
        expected: ["/usr/bin/node24", "quantumclaw", "status"],
      },
      {
        rawArgs: ["node24.exe", "quantumclaw", "status"],
        expected: ["node24.exe", "quantumclaw", "status"],
      },
      {
        rawArgs: ["nodejs", "quantumclaw", "status"],
        expected: ["nodejs", "quantumclaw", "status"],
      },
      {
        rawArgs: ["node-dev", "quantumclaw", "status"],
        expected: ["node", "quantumclaw", "node-dev", "quantumclaw", "status"],
      },
      {
        rawArgs: ["quantumclaw", "status"],
        expected: ["node", "quantumclaw", "status"],
      },
      {
        rawArgs: ["bun", "src/entry.ts", "status"],
        expected: ["bun", "src/entry.ts", "status"],
      },
    ] as const;

    for (const testCase of cases) {
      const parsed = buildParseArgv({
        programName: "quantumclaw",
        rawArgs: [...testCase.rawArgs],
      });
      expect(parsed).toEqual([...testCase.expected]);
    }
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "quantumclaw",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "quantumclaw", "status"]);
  });

  it("decides when to migrate state", () => {
    const nonMutatingArgv = [
      ["node", "quantumclaw", "status"],
      ["node", "quantumclaw", "health"],
      ["node", "quantumclaw", "sessions"],
      ["node", "quantumclaw", "config", "get", "update"],
      ["node", "quantumclaw", "config", "unset", "update"],
      ["node", "quantumclaw", "models", "list"],
      ["node", "quantumclaw", "models", "status"],
      ["node", "quantumclaw", "memory", "status"],
      ["node", "quantumclaw", "agent", "--message", "hi"],
    ] as const;
    const mutatingArgv = [
      ["node", "quantumclaw", "agents", "list"],
      ["node", "quantumclaw", "message", "send"],
    ] as const;

    for (const argv of nonMutatingArgv) {
      expect(shouldMigrateState([...argv])).toBe(false);
    }
    for (const argv of mutatingArgv) {
      expect(shouldMigrateState([...argv])).toBe(true);
    }
  });

  it.each([
    { path: ["status"], expected: false },
    { path: ["config", "get"], expected: false },
    { path: ["models", "status"], expected: false },
    { path: ["agents", "list"], expected: true },
  ])("reuses command path for migrate state decisions: $path", ({ path, expected }) => {
    expect(shouldMigrateStateFromPath(path)).toBe(expected);
  });
});
