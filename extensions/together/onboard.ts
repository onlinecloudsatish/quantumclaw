import {
  buildTogetherModelDefinition,
  TOGETHER_BASE_URL,
  TOGETHER_MODEL_CATALOG,
} from "quantumclaw/plugin-sdk/provider-models";
import {
  applyProviderConfigWithModelCatalogPreset,
  type QuantumClawConfig,
} from "quantumclaw/plugin-sdk/provider-onboard";

export const TOGETHER_DEFAULT_MODEL_REF = "together/moonshotai/Kimi-K2.5";

function applyTogetherPreset(cfg: QuantumClawConfig, primaryModelRef?: string): QuantumClawConfig {
  return applyProviderConfigWithModelCatalogPreset(cfg, {
    providerId: "together",
    api: "openai-completions",
    baseUrl: TOGETHER_BASE_URL,
    catalogModels: TOGETHER_MODEL_CATALOG.map(buildTogetherModelDefinition),
    aliases: [{ modelRef: TOGETHER_DEFAULT_MODEL_REF, alias: "Together AI" }],
    primaryModelRef,
  });
}

export function applyTogetherProviderConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyTogetherPreset(cfg);
}

export function applyTogetherConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyTogetherPreset(cfg, TOGETHER_DEFAULT_MODEL_REF);
}
