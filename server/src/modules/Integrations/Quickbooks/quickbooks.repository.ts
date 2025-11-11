import { Op } from 'sequelize';
import {
  QuickbooksConnection,
  QuickbooksEnvironment,
} from '../../../database/models/quickbooksConnection';
import { QuickbooksCredential } from '../../../database/models/quickbooksCredential';
import {
  QuickbooksConnectionStatus,
  QuickbooksConnectionUpsertInput,
} from './interfaces/quickbooks.interface';

export async function findActiveConnection(): Promise<QuickbooksConnection | null> {
  return QuickbooksConnection.findOne({
    where: { is_connected: true },
    order: [['id', 'DESC']],
  });
}

export async function upsertConnection(
  payload: QuickbooksConnectionUpsertInput
): Promise<QuickbooksConnection> {
  await QuickbooksConnection.update(
    {
      is_connected: false,
      disconnected_at: new Date(),
      updated_by: payload.updatedBy ?? payload.createdBy,
    },
    {
      where: {
        is_connected: true,
        realm_id: { [Op.ne]: payload.realmId },
      },
    }
  );

  const existing = await QuickbooksConnection.findOne({
    where: { realm_id: payload.realmId },
  });

  if (existing) {
    await existing.update({
      environment: payload.environment,
      access_token_encrypted: payload.accessTokenEncrypted,
      refresh_token_encrypted: payload.refreshTokenEncrypted,
      access_token_expires_at: payload.accessTokenExpiresAt,
      refresh_token_expires_at: payload.refreshTokenExpiresAt,
      connected_at: payload.connectedAt,
      disconnected_at: null,
      is_connected: true,
      updated_by: payload.updatedBy ?? payload.createdBy,
    });

    return existing;
  }

  return QuickbooksConnection.create({
    realm_id: payload.realmId,
    environment: payload.environment,
    access_token_encrypted: payload.accessTokenEncrypted,
    refresh_token_encrypted: payload.refreshTokenEncrypted,
    access_token_expires_at: payload.accessTokenExpiresAt,
    refresh_token_expires_at: payload.refreshTokenExpiresAt,
    last_synced_at: null,
    connected_at: payload.connectedAt,
    disconnected_at: null,
    is_connected: true,
    created_by: payload.createdBy,
    updated_by: payload.updatedBy ?? payload.createdBy,
  });
}

export async function disconnectActiveConnection(
  updatedBy: number
): Promise<QuickbooksConnection | null> {
  const connection = await findActiveConnection();

  if (!connection) {
    return null;
  }

  await connection.update({
    is_connected: false,
    disconnected_at: new Date(),
    updated_by: updatedBy,
  });

  return connection;
}

export async function updateLastSyncedAt(
  id: number,
  lastSyncedAt: Date,
  updatedBy: number
): Promise<void> {
  await QuickbooksConnection.update(
    {
      last_synced_at: lastSyncedAt,
      updated_by: updatedBy,
    },
    { where: { id } }
  );
}

export function mapConnectionToStatus(
  connection: QuickbooksConnection | null
): QuickbooksConnectionStatus {
  if (!connection) {
    return {
      isConnected: false,
      environment: null,
      realmId: null,
      connectedAt: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      lastSyncedAt: null,
    };
  }

  return {
    isConnected: connection.is_connected,
    environment: connection.environment as QuickbooksEnvironment,
    realmId: connection.realm_id,
    connectedAt: connection.connected_at?.toISOString() ?? null,
    accessTokenExpiresAt: connection.access_token_expires_at?.toISOString() ?? null,
    refreshTokenExpiresAt: connection.refresh_token_expires_at?.toISOString() ?? null,
    lastSyncedAt: connection.last_synced_at?.toISOString() ?? null,
  };
}

export async function getStoredCredentials(): Promise<QuickbooksCredential | null> {
  return QuickbooksCredential.findOne({
    order: [['updatedAt', 'DESC']],
  });
}

export async function upsertCredentials(options: {
  clientIdEncrypted: string;
  clientSecretEncrypted: string;
  redirectUri: string;
  environment: QuickbooksEnvironment;
  staffId: number;
}): Promise<QuickbooksCredential> {
  const existing = await getStoredCredentials();

  if (existing) {
    await existing.update({
      client_id_encrypted: options.clientIdEncrypted,
      client_secret_encrypted: options.clientSecretEncrypted,
      redirect_uri: options.redirectUri,
      environment: options.environment,
      updated_by: options.staffId,
    });

    return existing;
  }

  return QuickbooksCredential.create({
    client_id_encrypted: options.clientIdEncrypted,
    client_secret_encrypted: options.clientSecretEncrypted,
    redirect_uri: options.redirectUri,
    environment: options.environment,
    created_by: options.staffId,
    updated_by: options.staffId,
  });
}

