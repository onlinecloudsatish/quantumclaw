import { emptyPluginConfigSchema } from "../plugins/config-schema.js";
import type {
  QuantumClawPluginApi,
  QuantumClawPluginCommandDefinition,
  QuantumClawPluginConfigSchema,
  QuantumClawPluginDefinition,
  PluginInteractiveTelegramHandlerContext,
} from "../plugins/types.js";

export type {
  AnyAgentTool,
  MediaUnderstandingProviderPlugin,
  QuantumClawPluginApi,
  PluginCommandContext,
  QuantumClawPluginConfigSchema,
  ProviderDiscoveryContext,
  ProviderCatalogContext,
  ProviderCatalogResult,
  ProviderAugmentModelCatalogContext,
  ProviderBuiltInModelSuppressionContext,
  ProviderBuiltInModelSuppressionResult,
  ProviderBuildMissingAuthMessageContext,
  ProviderCacheTtlEligibilityContext,
  ProviderDefaultThinkingPolicyContext,
  ProviderFetchUsageSnapshotContext,
  ProviderModernModelPolicyContext,
  ProviderPreparedRuntimeAuth,
  ProviderResolvedUsageAuth,
  ProviderPrepareExtraParamsContext,
  ProviderPrepareDynamicModelContext,
  ProviderPrepareRuntimeAuthContext,
  ProviderResolveUsageAuthContext,
  ProviderResolveDynamicModelContext,
  ProviderNormalizeResolvedModelContext,
  ProviderRuntimeModel,
  SpeechProviderPlugin,
  ProviderThinkingPolicyContext,
  ProviderWrapStreamFnContext,
  QuantumClawPluginService,
  QuantumClawPluginServiceContext,
  ProviderAuthContext,
  ProviderAuthDoctorHintContext,
  ProviderAuthMethodNonInteractiveContext,
  ProviderAuthMethod,
  ProviderAuthResult,
  QuantumClawPluginCommandDefinition,
  QuantumClawPluginDefinition,
  PluginLogger,
  PluginInteractiveTelegramHandlerContext,
} from "../plugins/types.js";
export type { QuantumClawConfig } from "../config/config.js";

export { emptyPluginConfigSchema } from "../plugins/config-schema.js";

/** Options for a plugin entry that registers providers, tools, commands, or services. */
type DefinePluginEntryOptions = {
  id: string;
  name: string;
  description: string;
  kind?: QuantumClawPluginDefinition["kind"];
  configSchema?: QuantumClawPluginConfigSchema | (() => QuantumClawPluginConfigSchema);
  register: (api: QuantumClawPluginApi) => void;
};

/** Normalized object shape that QuantumClaw loads from a plugin entry module. */
type DefinedPluginEntry = {
  id: string;
  name: string;
  description: string;
  configSchema: QuantumClawPluginConfigSchema;
  register: NonNullable<QuantumClawPluginDefinition["register"]>;
} & Pick<QuantumClawPluginDefinition, "kind">;

/** Resolve either a concrete config schema or a lazy schema factory. */
function resolvePluginConfigSchema(
  configSchema: DefinePluginEntryOptions["configSchema"] = emptyPluginConfigSchema,
): QuantumClawPluginConfigSchema {
  return typeof configSchema === "function" ? configSchema() : configSchema;
}

/**
 * Canonical entry helper for non-channel plugins.
 *
 * Use this for provider, tool, command, service, memory, and context-engine
 * plugins. Channel plugins should use `defineChannelPluginEntry(...)` from
 * `quantumclaw/plugin-sdk/core` so they inherit the channel capability wiring.
 */
export function definePluginEntry({
  id,
  name,
  description,
  kind,
  configSchema = emptyPluginConfigSchema,
  register,
}: DefinePluginEntryOptions): DefinedPluginEntry {
  return {
    id,
    name,
    description,
    ...(kind ? { kind } : {}),
    configSchema: resolvePluginConfigSchema(configSchema),
    register,
  };
}
