export const QUANTUMCLAW_CLI_ENV_VAR = "QUANTUMCLAW_CLI";
export const QUANTUMCLAW_CLI_ENV_VALUE = "1";

export function markQuantumClawExecEnv<T extends Record<string, string | undefined>>(env: T): T {
  return {
    ...env,
    [QUANTUMCLAW_CLI_ENV_VAR]: QUANTUMCLAW_CLI_ENV_VALUE,
  };
}

export function ensureQuantumClawExecMarkerOnProcess(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[QUANTUMCLAW_CLI_ENV_VAR] = QUANTUMCLAW_CLI_ENV_VALUE;
  return env;
}
