import { OPENCODE_ZEN_DEFAULT_MODEL_REF } from "quantumclaw/plugin-sdk/provider-models";
import {
  applyAgentDefaultModelPrimary,
  withAgentModelAliases,
  type QuantumClawConfig,
} from "quantumclaw/plugin-sdk/provider-onboard";

export { OPENCODE_ZEN_DEFAULT_MODEL_REF };

export function applyOpencodeZenProviderConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models: withAgentModelAliases(cfg.agents?.defaults?.models, [
          { modelRef: OPENCODE_ZEN_DEFAULT_MODEL_REF, alias: "Opus" },
        ]),
      },
    },
  };
}

export function applyOpencodeZenConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeZenProviderConfig(cfg),
    OPENCODE_ZEN_DEFAULT_MODEL_REF,
  );
}
