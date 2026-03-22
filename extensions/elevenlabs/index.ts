import { definePluginEntry } from "quantumclaw/plugin-sdk/plugin-entry";
import { buildElevenLabsSpeechProvider } from "quantumclaw/plugin-sdk/speech";

export default definePluginEntry({
  id: "elevenlabs",
  name: "ElevenLabs Speech",
  description: "Bundled ElevenLabs speech provider",
  register(api) {
    api.registerSpeechProvider(buildElevenLabsSpeechProvider());
  },
});
