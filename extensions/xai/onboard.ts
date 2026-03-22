import {
  applyProviderConfigWithDefaultModelsPreset,
  type QuantumClawConfig,
} from "quantumclaw/plugin-sdk/provider-onboard";
import { XAI_BASE_URL, XAI_DEFAULT_MODEL_ID } from "./model-definitions.js";
import { buildXaiCatalogModels } from "./model-definitions.js";

export const XAI_DEFAULT_MODEL_REF = `xai/${XAI_DEFAULT_MODEL_ID}`;

function applyXaiProviderConfigWithApi(
  cfg: QuantumClawConfig,
  api: "openai-completions" | "openai-responses",
  primaryModelRef?: string,
): QuantumClawConfig {
  return applyProviderConfigWithDefaultModelsPreset(cfg, {
    providerId: "xai",
    api,
    baseUrl: XAI_BASE_URL,
    defaultModels: buildXaiCatalogModels(),
    defaultModelId: XAI_DEFAULT_MODEL_ID,
    aliases: [{ modelRef: XAI_DEFAULT_MODEL_REF, alias: "Grok" }],
    primaryModelRef,
  });
}

export function applyXaiProviderConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyXaiProviderConfigWithApi(cfg, "openai-completions");
}

export function applyXaiResponsesApiConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyXaiProviderConfigWithApi(cfg, "openai-responses");
}

export function applyXaiConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyXaiProviderConfigWithApi(cfg, "openai-completions", XAI_DEFAULT_MODEL_REF);
}
