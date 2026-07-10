import type { Connector } from "./types";
import { github } from "./github";
import { vercel } from "./vercel";

// Providers with a working connector today. The integrations catalog marks
// everything else "coming soon".
const REGISTRY: Record<string, Connector> = {
  github,
  vercel,
};

export function getConnector(provider: string): Connector | null {
  return REGISTRY[provider] ?? null;
}

export const CONNECTABLE = Object.keys(REGISTRY);
