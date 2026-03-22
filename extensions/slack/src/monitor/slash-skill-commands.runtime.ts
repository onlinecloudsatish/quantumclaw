import { listSkillCommandsForAgents as listSkillCommandsForAgentsImpl } from "quantumclaw/plugin-sdk/command-auth";

type ListSkillCommandsForAgents =
  typeof import("quantumclaw/plugin-sdk/command-auth").listSkillCommandsForAgents;

export function listSkillCommandsForAgents(
  ...args: Parameters<ListSkillCommandsForAgents>
): ReturnType<ListSkillCommandsForAgents> {
  return listSkillCommandsForAgentsImpl(...args);
}
