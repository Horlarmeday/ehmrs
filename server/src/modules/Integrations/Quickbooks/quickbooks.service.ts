import axios, { AxiosError, Method } from 'axios';
import { BadException } from '../../../common/util/api-error';
import { StatusCodes } from '../../../core/helpers/helper';
import { QuickbooksConnection, QuickbooksEnvironment } from '../../../database/models/quickbooksConnection';
import {
  exchangeCodeForTokens,
  QuickbooksOAuthConfig,
  refreshAccessToken,
  revokeToken,
} from './quickbooks.client';
import {
  QuickbooksAuthorizationResult,
  QuickbooksCallbackPayload,
  QuickbooksConnectionStatus,
  QuickbooksCredentialPayload,
  QuickbooksCredentialResponse,
  QuickbooksEnvironmentOption,
  QuickbooksTokenResponse,
} from './interfaces/quickbooks.interface';
import {
  disconnectActiveConnection,
  findActiveConnection,
  mapConnectionToStatus,
  getStoredCredentials,
  upsertCredentials,
  updateLastSyncedAt,
  upsertConnection,
} from './quickbooks.repository';
import { createState, decryptSecret, encryptSecret, verifyState } from './utils/crypto.util';

const AUTHORIZATION_URL = 'https://appcenter.intuit.com/connect/oauth2';
const REQUIRED_SCOPE = 'com.intuit.quickbooks.accounting';
const QUICKBOOKS_API_BASE = {
  [QuickbooksEnvironment.SANDBOX]: 'https://sandbox-quickbooks.api.intuit.com',
  [QuickbooksEnvironment.PRODUCTION]: 'https://quickbooks.api.intuit.com',
};
const DEFAULT_MINOR_VERSION = '70';

interface QuickbooksConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: QuickbooksEnvironment;
}

function mapEnv(envValue: string | undefined): QuickbooksEnvironment {
  if (!envValue) {
    return QuickbooksEnvironment.SANDBOX;
  }

  const normalized = envValue.trim().toUpperCase();
  if (normalized === QuickbooksEnvironment.PRODUCTION) {
    return QuickbooksEnvironment.PRODUCTION;
  }

  return QuickbooksEnvironment.SANDBOX;
}

async function getConfig(): Promise<QuickbooksConfig> {
  const stored = await getStoredCredentials();

  if (stored) {
    return {
      clientId: decryptSecret(stored.client_id_encrypted),
      clientSecret: decryptSecret(stored.client_secret_encrypted),
      redirectUri: stored.redirect_uri,
      environment: stored.environment,
    };
  }

  const clientId = process.env.QB_CLIENT_ID;
  const clientSecret = process.env.QB_CLIENT_SECRET;
  const redirectUri = process.env.QB_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new BadException(
      'QUICKBOOKS_CONFIG_ERROR',
      StatusCodes.SERVER_ERROR,
      'QuickBooks credentials are not fully configured. Please update them in the QuickBooks integration settings.'
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    environment: mapEnv(process.env.QB_ENV),
  };
}

function buildAuthorizationUrl(config: QuickbooksConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: REQUIRED_SCOPE,
    state,
  });

  return `${AUTHORIZATION_URL}?${params.toString()}`;
}

function toOAuthConfig(config: QuickbooksConfig): QuickbooksOAuthConfig {
  return {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
  };
}

function calculateExpiryDate(seconds: number, bufferSeconds = 60): Date {
  return new Date(Date.now() + (seconds - bufferSeconds) * 1000);
}

function handleAxiosError(error: AxiosError, fallbackMessage: string): never {
  const message =
    error.response?.data && typeof error.response.data === 'object'
      ? JSON.stringify(error.response.data)
      : fallbackMessage;

  throw new BadException('QUICKBOOKS_API_ERROR', StatusCodes.SERVICE_UNAVAILABLE, message);
}

async function persistTokens(
  tokenResponse: QuickbooksTokenResponse,
  realmId: string,
  userId: number,
  config: QuickbooksConfig
): Promise<QuickbooksConnection> {
  const accessTokenEncrypted = encryptSecret(tokenResponse.access_token);
  const refreshTokenEncrypted = encryptSecret(tokenResponse.refresh_token);

  return upsertConnection({
    realmId,
    environment: config.environment,
    accessTokenEncrypted,
    refreshTokenEncrypted,
    accessTokenExpiresAt: calculateExpiryDate(tokenResponse.expires_in),
    refreshTokenExpiresAt: calculateExpiryDate(tokenResponse.x_refresh_token_expires_in, 0),
    connectedAt: new Date(),
    createdBy: userId,
    updatedBy: userId,
  });
}

export class QuickbooksService {
  static async getAuthorizationUrl(
    userId: number
  ): Promise<QuickbooksAuthorizationResult> {
    const config = await getConfig();
    const state = createState(userId);
    const authorizationUrl = buildAuthorizationUrl(config, state);

    return {
      authorizationUrl,
      state,
    };
  }

  static async handleCallback(payload: QuickbooksCallbackPayload): Promise<QuickbooksConnectionStatus> {
    const verifiedState = verifyState(payload.state);
    const config = await getConfig();

    try {
      const tokenResponse = await exchangeCodeForTokens(
        payload.code,
        toOAuthConfig(config)
      );

      const connection = await persistTokens(
        tokenResponse,
        payload.realmId,
        verifiedState.userId,
        config
      );

      return mapConnectionToStatus(connection);
    } catch (error) {
      if (error instanceof BadException) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        handleAxiosError(error, 'QuickBooks authorization failed');
      }
      throw new BadException(
        'QUICKBOOKS_CALLBACK_ERROR',
        StatusCodes.SERVICE_UNAVAILABLE,
        'Unable to complete QuickBooks authorization'
      );
    }
  }

  static async getStatus(): Promise<QuickbooksConnectionStatus> {
    const connection = await findActiveConnection();
    return mapConnectionToStatus(connection);
  }

  static async disconnect(
    userId: number,
    revokeOnQuickbooks = true
  ): Promise<QuickbooksConnectionStatus> {
    const config = await getConfig();
    const connection = await disconnectActiveConnection(userId);

    if (!connection) {
      throw new BadException(
        'QUICKBOOKS_NOT_CONNECTED',
        StatusCodes.BAD_REQUEST,
        'No active QuickBooks connection to disconnect'
      );
    }

    if (revokeOnQuickbooks) {
      try {
        const refreshToken = decryptSecret(connection.refresh_token_encrypted);
        await revokeToken(refreshToken, toOAuthConfig(config));
      } catch (error) {
        if (axios.isAxiosError(error)) {
          handleAxiosError(error, 'QuickBooks token revocation failed');
        }
        throw error;
      }
    }

    return mapConnectionToStatus(connection);
  }

  static async ensureValidAccessToken(): Promise<{
    accessToken: string;
    connection: QuickbooksConnection | null;
  }> {
    const config = await getConfig();
    const connection = await findActiveConnection();

    if (!connection) {
      return { accessToken: '', connection: null };
    }

    const expiryThresholdMs = 5 * 60 * 1000;
    const now = Date.now();
    const accessExpiry = connection.access_token_expires_at?.getTime() ?? 0;

    if (accessExpiry - now > expiryThresholdMs) {
      return {
        accessToken: decryptSecret(connection.access_token_encrypted),
        connection,
      };
    }

    try {
      const refreshTokenValue = decryptSecret(connection.refresh_token_encrypted);
      const refreshedTokens = await refreshAccessToken(
        refreshTokenValue,
        toOAuthConfig(config)
      );

      const updatedConnection = await persistTokens(
        refreshedTokens,
        connection.realm_id,
        connection.updated_by ?? connection.created_by,
        config
      );

      return {
        accessToken: decryptSecret(updatedConnection.access_token_encrypted),
        connection: updatedConnection,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleAxiosError(error, 'QuickBooks token refresh failed');
      }
      throw error;
    }
  }

  private static getApiBaseUrl(environment: QuickbooksEnvironment): string {
    return QUICKBOOKS_API_BASE[environment] ?? QUICKBOOKS_API_BASE[QuickbooksEnvironment.SANDBOX];
  }

  static async executeApiRequest<T>(options: {
    method: Method;
    path: string;
    data?: unknown;
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
  }): Promise<T> {
    const { accessToken, connection } = await QuickbooksService.ensureValidAccessToken();

    if (!connection || !accessToken) {
      throw new BadException(
        'QUICKBOOKS_NOT_CONNECTED',
        StatusCodes.BAD_REQUEST,
        'QuickBooks is not connected'
      );
    }

    const baseUrl = QuickbooksService.getApiBaseUrl(connection.environment);
    const realmId = connection.realm_id;

    try {
      const response = await axios.request<T>({
        method: options.method,
        url: `${baseUrl}/v3/company/${realmId}/${options.path}`,
        data: options.data,
        params: {
          minorversion: DEFAULT_MINOR_VERSION,
          ...(options.params || {}),
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleAxiosError(error, 'QuickBooks API request failed');
      }
      throw error;
    }
  }

  static async updateCredentials(
    payload: QuickbooksCredentialPayload,
    staffId: number
  ): Promise<QuickbooksCredentialResponse> {
    if (!payload.clientId || !payload.clientSecret || !payload.redirectUri) {
      throw new BadException(
        'QUICKBOOKS_CONFIG_ERROR',
        StatusCodes.BAD_REQUEST,
        'Client ID, Client Secret and Redirect URI are required'
      );
    }

    const environment = mapEnv(payload.environment);
    const stored = await upsertCredentials({
      clientIdEncrypted: encryptSecret(payload.clientId.trim()),
      clientSecretEncrypted: encryptSecret(payload.clientSecret.trim()),
      redirectUri: payload.redirectUri.trim(),
      environment,
      staffId,
    });

    return QuickbooksService.mapCredentialSummary(stored);
  }

  static async getCredentialSummary(): Promise<QuickbooksCredentialResponse | null> {
    const stored = await getStoredCredentials();
    if (!stored) {
      return null;
    }

    return QuickbooksService.mapCredentialSummary(stored);
  }

  private static mapCredentialSummary(stored: {
    client_id_encrypted: string;
    client_secret_encrypted: string;
    redirect_uri: string;
    environment: QuickbooksEnvironment;
  }): QuickbooksCredentialResponse {
    let clientIdMasked: string | null = null;
    try {
      const clientId = decryptSecret(stored.client_id_encrypted);
      clientIdMasked = clientId.length > 6
        ? `${clientId.slice(0, 3)}***${clientId.slice(-3)}`
        : '***';
    } catch (error) {
      clientIdMasked = null;
    }

    return {
      environment: stored.environment as QuickbooksEnvironmentOption,
      redirectUri: stored.redirect_uri,
      clientIdMasked,
      hasClientSecret: Boolean(stored.client_secret_encrypted),
    };
  }
}

