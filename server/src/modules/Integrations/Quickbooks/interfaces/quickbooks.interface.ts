export interface QuickbooksAuthorizationResult {
  authorizationUrl: string;
  state: string;
}

export interface QuickbooksCallbackPayload {
  code: string;
  realmId: string;
  state: string;
}

export interface QuickbooksTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
}

export interface QuickbooksConnectionStatus {
  isConnected: boolean;
  environment: 'SANDBOX' | 'PRODUCTION' | null;
  realmId: string | null;
  connectedAt: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  lastSyncedAt: string | null;
}

export interface QuickbooksConnectionUpsertInput {
  realmId: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  connectedAt: Date;
  createdBy: number;
  updatedBy?: number;
}

export interface QuickbooksStatePayload {
  userId: number;
  issuedAt: number;
  nonce: string;
}

export interface QuickbooksCredentialPayload {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: QuickbooksEnvironmentOption;
}

export interface QuickbooksCredentialResponse {
  environment: QuickbooksEnvironmentOption;
  redirectUri: string;
  clientIdMasked: string | null;
  hasClientSecret: boolean;
}

export type QuickbooksEnvironmentOption = 'SANDBOX' | 'PRODUCTION';

