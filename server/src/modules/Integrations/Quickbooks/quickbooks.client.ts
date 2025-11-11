import axios from 'axios';
import { QuickbooksTokenResponse } from './interfaces/quickbooks.interface';

interface QuickbooksOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

const TOKEN_ENDPOINT = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const REVOCATION_ENDPOINT = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/revoke';

function buildTokenHeaders(config: QuickbooksOAuthConfig) {
  const encodedCredentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString(
    'base64'
  );

  return {
    Authorization: `Basic ${encodedCredentials}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };
}

function toFormUrlEncoded(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export async function exchangeCodeForTokens(
  authorizationCode: string,
  config: QuickbooksOAuthConfig
): Promise<QuickbooksTokenResponse> {
  const body = toFormUrlEncoded({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: config.redirectUri,
  });

  const response = await axios.post<QuickbooksTokenResponse>(TOKEN_ENDPOINT, body, {
    headers: buildTokenHeaders(config),
  });

  return response.data;
}

export async function refreshAccessToken(
  refreshToken: string,
  config: QuickbooksOAuthConfig
): Promise<QuickbooksTokenResponse> {
  const body = toFormUrlEncoded({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await axios.post<QuickbooksTokenResponse>(TOKEN_ENDPOINT, body, {
    headers: buildTokenHeaders(config),
  });

  return response.data;
}

export async function revokeToken(token: string, config: QuickbooksOAuthConfig): Promise<void> {
  const body = toFormUrlEncoded({
    token,
  });

  await axios.post(REVOCATION_ENDPOINT, body, {
    headers: buildTokenHeaders(config),
  });
}

export type { QuickbooksOAuthConfig };

