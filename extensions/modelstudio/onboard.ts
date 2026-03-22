import {
  applyProviderConfigWithModelCatalogPreset,
  type QuantumClawConfig,
} from "quantumclaw/plugin-sdk/provider-onboard";
import {
  MODELSTUDIO_CN_BASE_URL,
  MODELSTUDIO_DEFAULT_MODEL_REF,
  MODELSTUDIO_GLOBAL_BASE_URL,
} from "./model-definitions.js";
import { buildModelStudioProvider } from "./provider-catalog.js";

export { MODELSTUDIO_CN_BASE_URL, MODELSTUDIO_DEFAULT_MODEL_REF, MODELSTUDIO_GLOBAL_BASE_URL };

function applyModelStudioProviderConfigWithBaseUrl(
  cfg: QuantumClawConfig,
  baseUrl: string,
  primaryModelRef?: string,
): QuantumClawConfig {
  const provider = buildModelStudioProvider();
  return applyProviderConfigWithModelCatalogPreset(cfg, {
    providerId: "modelstudio",
    api: provider.api ?? "openai-completions",
    baseUrl,
    catalogModels: provider.models ?? [],
    aliases: [
      ...(provider.models ?? []).map((model) => `modelstudio/${model.id}`),
      { modelRef: MODELSTUDIO_DEFAULT_MODEL_REF, alias: "Qwen" },
    ],
    primaryModelRef,
  });
}

export function applyModelStudioProviderConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyModelStudioProviderConfigWithBaseUrl(cfg, MODELSTUDIO_GLOBAL_BASE_URL);
}

export function applyModelStudioProviderConfigCn(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyModelStudioProviderConfigWithBaseUrl(cfg, MODELSTUDIO_CN_BASE_URL);
}

export function applyModelStudioConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyModelStudioProviderConfigWithBaseUrl(
    cfg,
    MODELSTUDIO_GLOBAL_BASE_URL,
    MODELSTUDIO_DEFAULT_MODEL_REF,
  );
}

export function applyModelStudioConfigCn(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyModelStudioProviderConfigWithBaseUrl(
    cfg,
    MODELSTUDIO_CN_BASE_URL,
    MODELSTUDIO_DEFAULT_MODEL_REF,
  );
}
