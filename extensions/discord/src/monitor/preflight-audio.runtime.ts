import { transcribeFirstAudio as transcribeFirstAudioImpl } from "quantumclaw/plugin-sdk/media-runtime";

type TranscribeFirstAudio = typeof import("quantumclaw/plugin-sdk/media-runtime").transcribeFirstAudio;

export async function transcribeFirstAudio(
  ...args: Parameters<TranscribeFirstAudio>
): ReturnType<TranscribeFirstAudio> {
  return await transcribeFirstAudioImpl(...args);
}
