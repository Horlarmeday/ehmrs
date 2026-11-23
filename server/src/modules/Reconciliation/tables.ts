import { Model, ModelStatic } from 'sequelize';
import { PrescribedDrug } from '../../database/models/prescribedDrug';
import { PrescribedInvestigation } from '../../database/models/prescribedInvestigation';
import { PrescribedService } from '../../database/models/prescribedService';
import { PrescribedTest } from '../../database/models/prescribedTest';
import { PrescribedAdditionalItem } from '../../database/models/prescribedAdditionalItem';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { Visit } from '../../database/models/visit';
import { Drug } from '../../database/models/drug';
import { InventoryItem } from '../../database/models/inventoryItem';
import { InventoryItemHistory } from '../../database/models/inventoryItemHistory';
import { PharmacyStore } from '../../database/models/pharmacyStore';
import { PharmacyStoreHistory } from '../../database/models/pharmacyStoreHistory';
import { PrescribedLineType } from '../Outbox/prescribed-line-types';

/**
 * Table names for the reconciliation's SQL, read from the models so the queries name exactly what
 * the ORM names (the snapshot spells `inventory_items` while the model says `Inventory_Items`).
 */
function tableOf(model: ModelStatic<Model>): string {
  const name = model.getTableName();
  const table = typeof name === 'string' ? name : name.tableName;
  return `\`${table}\``;
}

export interface Tables {
  readonly line: Readonly<Record<PrescribedLineType, string>>;
  readonly outbox: string;
  readonly visit: string;
  readonly drug: string;
  readonly layer: string;
  readonly layerHistory: string;
  readonly storeRow: string;
  readonly storeHistory: string;
}

let resolved: Tables | null = null;

/** Resolved on first use: a model has no table name until Sequelize has registered it. */
export function tables(): Tables {
  if (resolved === null) {
    resolved = {
      line: {
        drug: tableOf(PrescribedDrug),
        investigation: tableOf(PrescribedInvestigation),
        service: tableOf(PrescribedService),
        test: tableOf(PrescribedTest),
        additional_item: tableOf(PrescribedAdditionalItem),
      },
      outbox: tableOf(OutboxEvent),
      visit: tableOf(Visit),
      drug: tableOf(Drug),
      layer: tableOf(InventoryItem),
      layerHistory: tableOf(InventoryItemHistory),
      storeRow: tableOf(PharmacyStore),
      storeHistory: tableOf(PharmacyStoreHistory),
    };
  }
  return resolved;
}
