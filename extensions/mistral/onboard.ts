import {
  applyProviderConfigWithDefaultModelPreset,
  type QuantumClawConfig,
} from "quantumclaw/plugin-sdk/provider-onboard";
import {
  buildMistralModelDefinition,
  MISTRAL_BASE_URL,
  MISTRAL_DEFAULT_MODEL_ID,
} from "./model-definitions.js";

export const MISTRAL_DEFAULT_MODEL_REF = `mistral/${MISTRAL_DEFAULT_MODEL_ID}`;

function applyMistralPreset(cfg: QuantumClawConfig, primaryModelRef?: string): QuantumClawConfig {
  return applyProviderConfigWithDefaultModelPreset(cfg, {
    providerId: "mistral",
    api: "openai-completions",
    baseUrl: MISTRAL_BASE_URL,
    defaultModel: buildMistralModelDefinition(),
    defaultModelId: MISTRAL_DEFAULT_MODEL_ID,
    aliases: [{ modelRef: MISTRAL_DEFAULT_MODEL_REF, alias: "Mistral" }],
    primaryModelRef,
  });
}

export function applyMistralProviderConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyMistralPreset(cfg);
}

export function applyMistralConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyMistralPreset(cfg, MISTRAL_DEFAULT_MODEL_REF);
}
