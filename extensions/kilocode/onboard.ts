import { KILOCODE_BASE_URL, KILOCODE_DEFAULT_MODEL_REF } from "quantumclaw/plugin-sdk/provider-models";
import {
  applyProviderConfigWithModelCatalogPreset,
  type QuantumClawConfig,
} from "quantumclaw/plugin-sdk/provider-onboard";
import { buildKilocodeProvider } from "./provider-catalog.js";

export { KILOCODE_BASE_URL, KILOCODE_DEFAULT_MODEL_REF };

export function applyKilocodeProviderConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyProviderConfigWithModelCatalogPreset(cfg, {
    providerId: "kilocode",
    api: "openai-completions",
    baseUrl: KILOCODE_BASE_URL,
    catalogModels: buildKilocodeProvider().models ?? [],
    aliases: [{ modelRef: KILOCODE_DEFAULT_MODEL_REF, alias: "Kilo Gateway" }],
  });
}

export function applyKilocodeConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyProviderConfigWithModelCatalogPreset(cfg, {
    providerId: "kilocode",
    api: "openai-completions",
    baseUrl: KILOCODE_BASE_URL,
    catalogModels: buildKilocodeProvider().models ?? [],
    aliases: [{ modelRef: KILOCODE_DEFAULT_MODEL_REF, alias: "Kilo Gateway" }],
    primaryModelRef: KILOCODE_DEFAULT_MODEL_REF,
  });
}
