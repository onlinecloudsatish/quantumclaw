import {
  buildModelsProviderData,
  listSkillCommandsForAgents,
} from "quantumclaw/plugin-sdk/command-auth";
import { loadConfig, resolveStorePath } from "quantumclaw/plugin-sdk/config-runtime";
import { readChannelAllowFromStore } from "quantumclaw/plugin-sdk/conversation-runtime";
import { upsertChannelPairingRequest } from "quantumclaw/plugin-sdk/conversation-runtime";
import { enqueueSystemEvent } from "quantumclaw/plugin-sdk/infra-runtime";
import { dispatchReplyWithBufferedBlockDispatcher } from "quantumclaw/plugin-sdk/reply-runtime";
import { wasSentByBot } from "./sent-message-cache.js";

export type TelegramBotDeps = {
  loadConfig: typeof loadConfig;
  resolveStorePath: typeof resolveStorePath;
  readChannelAllowFromStore: typeof readChannelAllowFromStore;
  upsertChannelPairingRequest: typeof upsertChannelPairingRequest;
  enqueueSystemEvent: typeof enqueueSystemEvent;
  dispatchReplyWithBufferedBlockDispatcher: typeof dispatchReplyWithBufferedBlockDispatcher;
  buildModelsProviderData: typeof buildModelsProviderData;
  listSkillCommandsForAgents: typeof listSkillCommandsForAgents;
  wasSentByBot: typeof wasSentByBot;
};

export const defaultTelegramBotDeps: TelegramBotDeps = {
  get loadConfig() {
    return loadConfig;
  },
  get resolveStorePath() {
    return resolveStorePath;
  },
  get readChannelAllowFromStore() {
    return readChannelAllowFromStore;
  },
  get upsertChannelPairingRequest() {
    return upsertChannelPairingRequest;
  },
  get enqueueSystemEvent() {
    return enqueueSystemEvent;
  },
  get dispatchReplyWithBufferedBlockDispatcher() {
    return dispatchReplyWithBufferedBlockDispatcher;
  },
  get buildModelsProviderData() {
    return buildModelsProviderData;
  },
  get listSkillCommandsForAgents() {
    return listSkillCommandsForAgents;
  },
  get wasSentByBot() {
    return wasSentByBot;
  },
};
