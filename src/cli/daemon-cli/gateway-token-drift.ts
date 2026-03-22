import type { QuantumClawConfig } from "../../config/config.js";
import { resolveGatewayDriftCheckCredentialsFromConfig } from "../../gateway/credentials.js";

export function resolveGatewayTokenForDriftCheck(params: {
  cfg: QuantumClawConfig;
  env?: NodeJS.ProcessEnv;
}) {
  void params.env;
  return resolveGatewayDriftCheckCredentialsFromConfig({ cfg: params.cfg }).token;
}
