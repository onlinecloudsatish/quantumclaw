import {
  buildHuggingfaceModelDefinition,
  HUGGINGFACE_BASE_URL,
  HUGGINGFACE_MODEL_CATALOG,
} from "quantumclaw/plugin-sdk/provider-models";
import {
  applyProviderConfigWithModelCatalogPreset,
  type QuantumClawConfig,
} from "quantumclaw/plugin-sdk/provider-onboard";

export const HUGGINGFACE_DEFAULT_MODEL_REF = "huggingface/deepseek-ai/DeepSeek-R1";

function applyHuggingfacePreset(cfg: QuantumClawConfig, primaryModelRef?: string): QuantumClawConfig {
  return applyProviderConfigWithModelCatalogPreset(cfg, {
    providerId: "huggingface",
    api: "openai-completions",
    baseUrl: HUGGINGFACE_BASE_URL,
    catalogModels: HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition),
    aliases: [{ modelRef: HUGGINGFACE_DEFAULT_MODEL_REF, alias: "Hugging Face" }],
    primaryModelRef,
  });
}

export function applyHuggingfaceProviderConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyHuggingfacePreset(cfg);
}

export function applyHuggingfaceConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyHuggingfacePreset(cfg, HUGGINGFACE_DEFAULT_MODEL_REF);
}
