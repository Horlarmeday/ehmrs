import { StockAudit, StockAuditItem, Inventory, Drug, Unit, Staff } from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { Op } from 'sequelize';

export interface StockAuditData {
  audit_number: string;
  store_type: 'PHARMACY' | 'LABORATORY' | 'RADIOLOGY';
  inventory_id?: number;
  audit_date: Date;
  notes?: string;
  items: StockAuditItemData[];
}

export interface StockAuditItemData {
  drug_id: number;
  system_quantity: number;
  physical_quantity: number;
  unit_cost: number;
  notes?: string;
}

export interface StockAuditUpdateData {
  audit_date?: Date;
  notes?: string;
  status?: string;
}

export interface VarianceAnalysis {
  total_items: number;
  items_with_variance: number;
  total_variance_value: number;
  variance_percentage: number;
  critical_variances: number;
  moderate_variances: number;
  minor_variances: number;
}

export class StockAuditService {
  /**
   * Create a new stock audit
   */
  static async createStockAudit(data: StockAuditData, staffId: number): Promise<StockAudit> {
    // Validate inventory exists if specified
    if (data.inventory_id) {
      const inventory = await Inventory.findByPk(data.inventory_id);
      if (!inventory) {
        throw new BadException('NOT_FOUND', 404, 'Inventory not found');
      }
    }

    // Validate all drugs exist
    for (const item of data.items) {
      const drug = await Drug.findByPk(item.drug_id);
      if (!drug) {
        throw new BadException('NOT_FOUND', 404, `Drug with ID ${item.drug_id} not found`);
      }
    }

    // Calculate variances and total variance value
    let totalVarianceValue = 0;
    const totalItemsAudited = data.items.length;
    let totalItemsWithVariance = 0;

    const auditItems = [];
    for (const item of data.items) {
      const variance = item.physical_quantity - item.system_quantity;
      const varianceValue = Math.abs(variance) * item.unit_cost;

      if (variance !== 0) {
        totalItemsWithVariance++;
        totalVarianceValue += varianceValue;
      }

      auditItems.push({
        drug_id: item.drug_id,
        system_quantity: item.system_quantity,
        physical_quantity: item.physical_quantity,
        variance: variance,
        variance_value: varianceValue,
        unit_cost: item.unit_cost,
        notes: item.notes,
      });
    }

    // Create stock audit
    const stockAudit = await StockAudit.create({
      audit_number: data.audit_number,
      store_type: data.store_type,
      inventory_id: data.inventory_id,
      audit_date: data.audit_date,
      notes: data.notes,
      total_variance_value: totalVarianceValue,
      total_items_audited: totalItemsAudited,
      total_items_with_variance: totalItemsWithVariance,
      created_by: staffId,
      status: 'DRAFT',
    });

    // Create stock audit items
    await Promise.all(
      auditItems.map(item =>
        StockAuditItem.create({
          stock_audit_id: stockAudit.id,
          ...item,
        })
      )
    );

    return stockAudit;
  }

  /**
   * Get stock audit by ID
   */
  static async getStockAudit(auditId: number): Promise<StockAudit | null> {
    return await StockAudit.findByPk(auditId, {
      include: [
        {
          model: Inventory,
          attributes: ['name', 'location'],
        },
        {
          model: Staff,
          as: 'creator',
          attributes: ['first_name', 'last_name', 'email'],
        },
        {
          model: Staff,
          as: 'approver',
          attributes: ['first_name', 'last_name', 'email'],
        },
        {
          model: StockAuditItem,
          include: [
            {
              model: Drug,
              attributes: ['name', 'generic_name', 'strength'],
            },
            {
              model: Unit,
              attributes: ['name', 'abbreviation'],
            },
          ],
        },
      ],
    });
  }

  /**
   * Get all stock audits with pagination
   */
  static async getStockAudits(params: {
    page?: number;
    limit?: number;
    status?: string;
    store_type?: string;
    inventory_id?: number;
    date_from?: Date;
    date_to?: Date;
    search?: string;
  }): Promise<{
    audits: StockAudit[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      store_type,
      inventory_id,
      date_from,
      date_to,
      search,
    } = params;

    const offset = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (store_type) {
      where.store_type = store_type;
    }

    if (inventory_id) {
      where.inventory_id = inventory_id;
    }

    if (date_from || date_to) {
      where.audit_date = {};
      if (date_from) where.audit_date[Op.gte] = date_from;
      if (date_to) where.audit_date[Op.lte] = date_to;
    }

    if (search) {
      where[Op.or] = [
        { audit_number: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await StockAudit.findAndCountAll({
      where,
      include: [
        {
          model: Inventory,
          attributes: ['name', 'location'],
        },
        {
          model: Staff,
          as: 'creator',
          attributes: ['first_name', 'last_name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      audits: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Update stock audit
   */
  static async updateStockAudit(auditId: number, data: StockAuditUpdateData): Promise<StockAudit> {
    const audit = await StockAudit.findByPk(auditId);
    if (!audit) {
      throw new BadException('NOT_FOUND', 404, 'Stock audit not found');
    }

    // Only allow updates if audit is in DRAFT status
    if (audit.status !== 'DRAFT') {
      throw new BadException(
        'INVALID_STATUS',
        400,
        'Cannot update audit that is not in DRAFT status'
      );
    }

    return await audit.update(data);
  }

  /**
   * Start stock audit
   */
  static async startStockAudit(auditId: number): Promise<StockAudit> {
    const audit = await StockAudit.findByPk(auditId);
    if (!audit) {
      throw new BadException('NOT_FOUND', 404, 'Stock audit not found');
    }

    if (audit.status !== 'DRAFT') {
      throw new BadException('INVALID_STATUS', 400, 'Audit must be in DRAFT status to start');
    }

    return await audit.update({
      status: 'IN_PROGRESS',
      started_date: new Date(),
    });
  }

  /**
   * Complete stock audit
   */
  static async completeStockAudit(auditId: number): Promise<StockAudit> {
    const audit = await StockAudit.findByPk(auditId, {
      include: [StockAuditItem],
    });

    if (!audit) {
      throw new BadException('NOT_FOUND', 404, 'Stock audit not found');
    }

    if (audit.status !== 'IN_PROGRESS') {
      throw new BadException('INVALID_STATUS', 400, 'Audit must be in progress to complete');
    }

    // Recalculate totals
    let totalVarianceValue = 0;
    let totalItemsWithVariance = 0;

    for (const item of audit.items) {
      if (item.variance !== 0) {
        totalItemsWithVariance++;
        totalVarianceValue += item.variance_value;
      }
    }

    return await audit.update({
      status: 'COMPLETED',
      completed_date: new Date(),
      total_variance_value: totalVarianceValue,
      total_items_with_variance: totalItemsWithVariance,
    });
  }

  /**
   * Approve stock audit
   */
  static async approveStockAudit(auditId: number, staffId: number): Promise<StockAudit> {
    const audit = await StockAudit.findByPk(auditId);
    if (!audit) {
      throw new BadException('NOT_FOUND', 404, 'Stock audit not found');
    }

    if (audit.status !== 'COMPLETED') {
      throw new BadException('INVALID_STATUS', 400, 'Audit must be completed before approval');
    }

    return await audit.update({
      status: 'APPROVED',
      approved_by: staffId,
      approved_date: new Date(),
    });
  }

  /**
   * Get variance analysis for an audit
   */
  static async getVarianceAnalysis(auditId: number): Promise<VarianceAnalysis> {
    const audit = await StockAudit.findByPk(auditId, {
      include: [StockAuditItem],
    });

    if (!audit) {
      throw new BadException('NOT_FOUND', 404, 'Stock audit not found');
    }

    const totalItems = audit.total_items_audited;
    const itemsWithVariance = audit.total_items_with_variance;
    const totalVarianceValue = audit.total_variance_value;

    // Categorize variances
    let criticalVariances = 0;
    let moderateVariances = 0;
    let minorVariances = 0;

    for (const item of audit.items) {
      if (item.variance !== 0) {
        const variancePercentage = (Math.abs(item.variance) / item.system_quantity) * 100;

        if (variancePercentage > 20) {
          criticalVariances++;
        } else if (variancePercentage > 10) {
          moderateVariances++;
        } else {
          minorVariances++;
        }
      }
    }

    const variancePercentage = totalItems > 0 ? (itemsWithVariance / totalItems) * 100 : 0;

    return {
      total_items: totalItems,
      items_with_variance: itemsWithVariance,
      total_variance_value: totalVarianceValue,
      variance_percentage: variancePercentage,
      critical_variances: criticalVariances,
      moderate_variances: moderateVariances,
      minor_variances: minorVariances,
    };
  }

  /**
   * Get stock audit statistics
   */
  static async getStockAuditStatistics(): Promise<{
    total_audits: number;
    draft_audits: number;
    in_progress_audits: number;
    completed_audits: number;
    approved_audits: number;
    total_variance_value: number;
    average_variance_percentage: number;
  }> {
    const [
      totalAudits,
      draftAudits,
      inProgressAudits,
      completedAudits,
      approvedAudits,
      totalVarianceValue,
      averageVariancePercentage,
    ] = await Promise.all([
      StockAudit.count(),
      StockAudit.count({ where: { status: 'DRAFT' } }),
      StockAudit.count({ where: { status: 'IN_PROGRESS' } }),
      StockAudit.count({ where: { status: 'COMPLETED' } }),
      StockAudit.count({ where: { status: 'APPROVED' } }),
      StockAudit.sum('total_variance_value'),
      StockAudit.findAll({
        attributes: [
          [
            StockAudit.sequelize.fn('AVG', StockAudit.sequelize.col('total_variance_value')),
            'avg_variance',
          ],
        ],
        where: { status: 'APPROVED' },
      }),
    ]);

    const avgVariance = averageVariancePercentage[0]?.getDataValue('avg_variance') || 0;

    return {
      total_audits: totalAudits,
      draft_audits: draftAudits,
      in_progress_audits: inProgressAudits,
      completed_audits: completedAudits,
      approved_audits: approvedAudits,
      total_variance_value: totalVarianceValue || 0,
      average_variance_percentage: avgVariance,
    };
  }

  /**
   * Get store type performance comparison
   */
  static async getStoreTypePerformance(): Promise<
    Array<{
      store_type: string;
      total_audits: number;
      average_variance_value: number;
      total_variance_value: number;
      items_audited: number;
    }>
  > {
    const storeTypes = ['PHARMACY', 'LABORATORY', 'RADIOLOGY'];
    const results = [];

    for (const storeType of storeTypes) {
      const audits = await StockAudit.findAll({
        where: {
          store_type: storeType,
          status: 'APPROVED',
        },
        attributes: ['total_variance_value', 'total_items_audited'],
      });

      const totalAudits = audits.length;
      const totalVarianceValue = audits.reduce(
        (sum, audit) => sum + (audit.total_variance_value || 0),
        0
      );
      const itemsAudited = audits.reduce((sum, audit) => sum + (audit.total_items_audited || 0), 0);
      const averageVarianceValue = totalAudits > 0 ? totalVarianceValue / totalAudits : 0;

      results.push({
        store_type: storeType,
        total_audits: totalAudits,
        average_variance_value: averageVarianceValue,
        total_variance_value: totalVarianceValue,
        items_audited: itemsAudited,
      });
    }

    return results;
  }

  /**
   * Generate audit number
   */
  static async generateAuditNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const lastAudit = await StockAudit.findOne({
      where: {
        audit_number: { [Op.like]: `SA-${currentYear}-%` },
      },
      order: [['audit_number', 'DESC']],
    });

    let sequence = 1;
    if (lastAudit) {
      const lastSequence = parseInt(lastAudit.audit_number.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `SA-${currentYear}-${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Export audit report
   */
  static async exportAuditReport(
    auditId: number
  ): Promise<{
    audit: StockAudit;
    items: StockAuditItem[];
    variance_analysis: VarianceAnalysis;
    summary: {
      total_items: number;
      items_with_variance: number;
      total_variance_value: number;
      variance_percentage: number;
    };
  }> {
    const audit = await this.getStockAudit(auditId);
    if (!audit) {
      throw new BadException('NOT_FOUND', 404, 'Stock audit not found');
    }

    const varianceAnalysis = await this.getVarianceAnalysis(auditId);

    return {
      audit,
      items: audit.items || [],
      variance_analysis: varianceAnalysis,
      summary: {
        total_items: varianceAnalysis.total_items,
        items_with_variance: varianceAnalysis.items_with_variance,
        total_variance_value: varianceAnalysis.total_variance_value,
        variance_percentage: varianceAnalysis.variance_percentage,
      },
    };
  }
}
