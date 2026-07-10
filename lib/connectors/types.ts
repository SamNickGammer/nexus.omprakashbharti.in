// Common connector shape (doc/04). Each provider adapter verifies a credential
// and returns normalized assets. Connectors run server-side only.

export type VerifyResult = {
  externalAccountId: string;
  externalAccountName: string;
  scopes?: string[];
};

export type NormalizedAsset = {
  assetType: string;
  name: string;
  displayName?: string;
  status?: string;
  environment?: string;
  externalId: string;
  externalUrl?: string;
  providerConsoleUrl?: string;
  region?: string;
  metadata?: Record<string, unknown>;
};

// Typed error surface (doc/04 error categories).
export type ConnectorErrorCode =
  | "invalid_credentials"
  | "insufficient_scope"
  | "rate_limited"
  | "provider_unavailable"
  | "network_error"
  | "unknown_error";

export class ConnectorError extends Error {
  constructor(public code: ConnectorErrorCode, message: string) {
    super(message);
  }
}

export interface Connector {
  provider: string;
  tokenHelpUrl: string; // where the user creates a token
  verify(token: string): Promise<VerifyResult>;
  sync(token: string): Promise<NormalizedAsset[]>;
}
