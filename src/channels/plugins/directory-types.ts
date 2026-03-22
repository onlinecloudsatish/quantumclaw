import type { QuantumClawConfig } from "../../config/types.js";

export type DirectoryConfigParams = {
  cfg: QuantumClawConfig;
  accountId?: string | null;
  query?: string | null;
  limit?: number | null;
};
