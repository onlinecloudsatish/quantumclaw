import {
  applyProviderConfigWithDefaultModelPreset,
  type QuantumClawConfig,
} from "quantumclaw/plugin-sdk/provider-onboard";
import {
  buildMoonshotProvider,
  MOONSHOT_BASE_URL,
  MOONSHOT_DEFAULT_MODEL_ID,
} from "./provider-catalog.js";

export const MOONSHOT_CN_BASE_URL = "https://api.moonshot.cn/v1";
export const MOONSHOT_DEFAULT_MODEL_REF = `moonshot/${MOONSHOT_DEFAULT_MODEL_ID}`;

export function applyMoonshotProviderConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyMoonshotProviderConfigWithBaseUrl(cfg, MOONSHOT_BASE_URL);
}

export function applyMoonshotProviderConfigCn(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyMoonshotProviderConfigWithBaseUrl(cfg, MOONSHOT_CN_BASE_URL);
}

function applyMoonshotProviderConfigWithBaseUrl(
  cfg: QuantumClawConfig,
  baseUrl: string,
  primaryModelRef?: string,
): QuantumClawConfig {
  const defaultModel = buildMoonshotProvider().models[0];
  if (!defaultModel) {
    return cfg;
  }

  return applyProviderConfigWithDefaultModelPreset(cfg, {
    providerId: "moonshot",
    api: "openai-completions",
    baseUrl,
    defaultModel,
    defaultModelId: MOONSHOT_DEFAULT_MODEL_ID,
    aliases: [{ modelRef: MOONSHOT_DEFAULT_MODEL_REF, alias: "Kimi" }],
    primaryModelRef,
  });
}

export function applyMoonshotConfig(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyMoonshotProviderConfigWithBaseUrl(cfg, MOONSHOT_BASE_URL, MOONSHOT_DEFAULT_MODEL_REF);
}

export function applyMoonshotConfigCn(cfg: QuantumClawConfig): QuantumClawConfig {
  return applyMoonshotProviderConfigWithBaseUrl(
    cfg,
    MOONSHOT_CN_BASE_URL,
    MOONSHOT_DEFAULT_MODEL_REF,
  );
}
