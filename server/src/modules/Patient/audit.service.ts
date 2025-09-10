import { DeceasedPatientAudit, Patient, Staff } from '../../database/models';
import { StatusCodes } from '../../core/helpers/helper';
import { BadException } from '../../common/util/api-error';
import { logger } from '../../core/helpers/logger';
import { DeceasedPatientAction } from '../../database/models/deceasedPatientAudit';
import { Op, Sequelize } from 'sequelize';

export interface AuditLogData {
  patient_id: number;
  action: DeceasedPatientAction;
  performed_by: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
}

export class AuditService {
  /**
   * Log an audit action for deceased patient management
   *
   * @static
   * @param {AuditLogData} auditData - Audit log data
   * @returns {Promise<DeceasedPatientAudit>} Created audit record
   */
  static async logAuditAction(auditData: AuditLogData): Promise<DeceasedPatientAudit> {
    try {
      const auditRecord = await DeceasedPatientAudit.create({
        patient_id: auditData.patient_id,
        action: auditData.action,
        performed_by: auditData.performed_by,
        details: auditData.details || null,
        ip_address: auditData.ip_address || null,
        user_agent: auditData.user_agent || null,
        performed_at: new Date(),
      });

      console.log(`Audit logged: ${auditData.action} for patient ${auditData.patient_id} by staff ${auditData.performed_by}`);
      return auditRecord;
    } catch (error) {
      logger.error('Failed to log audit action:', error);
      // Don't throw error to avoid breaking the main operation
      // Just log the error and continue
      return null as any;
    }
  }

  /**
   * Get audit trail for a specific patient
   *
   * @static
   * @param {number} patientId - Patient ID
   * @param {object} options - Query options
   * @returns {Promise<DeceasedPatientAudit[]>} Audit records
   */
  static async getPatientAuditTrail(
    patientId: number,
    options: { limit?: number; offset?: number; action?: DeceasedPatientAction } = {}
  ): Promise<{ rows: DeceasedPatientAudit[]; count: number }> {
    const { limit = 50, offset = 0, action } = options;

    const where: any = { patient_id: patientId };
    if (action) {
      where.action = action;
    }

    return DeceasedPatientAudit.findAndCountAll({
      where,
      limit,
      offset,
      order: [['performed_at', 'DESC']],
      include: [
        {
          model: Staff,
          as: 'staff',
          attributes: ['id', 'fullname', 'department', 'role'],
        },
      ],
    });
  }

  /**
   * Get audit trail for a specific staff member
   *
   * @static
   * @param {number} staffId - Staff ID
   * @param {object} options - Query options
   * @returns {Promise<DeceasedPatientAudit[]>} Audit records
   */
  static async getStaffAuditTrail(
    staffId: number,
    options: { limit?: number; offset?: number; action?: DeceasedPatientAction } = {}
  ): Promise<{ rows: DeceasedPatientAudit[]; count: number }> {
    const { limit = 50, offset = 0, action } = options;

    const where: any = { performed_by: staffId };
    if (action) {
      where.action = action;
    }

    return DeceasedPatientAudit.findAndCountAll({
      where,
      limit,
      offset,
      order: [['performed_at', 'DESC']],
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'fullname', 'hospital_id', 'patient_status'],
        },
      ],
    });
  }

  /**
   * Get audit statistics
   *
   * @static
   * @param {object} options - Query options
   * @returns {Promise<any>} Audit statistics
   */
  static async getAuditStatistics(options: {
    startDate?: Date;
    endDate?: Date;
    action?: DeceasedPatientAction;
  } = {}): Promise<any> {
    const { startDate, endDate, action } = options;

    const where: any = {};
    if (startDate || endDate) {
      where.performed_at = {};
      if (startDate) where.performed_at[Op.gte] = startDate;
      if (endDate) where.performed_at[Op.lte] = endDate;
    }
    if (action) {
      where.action = action;
    }

    const [totalActions, actionBreakdown, recentActions] = await Promise.all([
      // Total actions count
      DeceasedPatientAudit.count({ where }),
      
      // Action breakdown
      DeceasedPatientAudit.findAll({
        attributes: [
          'action',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        ],
        where,
        group: ['action'],
        raw: true,
      }),
      
      // Recent actions (last 30 days)
      DeceasedPatientAudit.count({
        where: {
          ...where,
          performed_at: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total_actions: totalActions,
      action_breakdown: actionBreakdown,
      recent_actions_30_days: recentActions,
      generated_at: new Date(),
    };
  }

  /**
   * Get audit trail for deceased patient management dashboard
   *
   * @static
   * @param {object} options - Query options
   * @returns {Promise<any>} Dashboard audit data
   */
  static async getDashboardAuditData(options: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<any> {
    const { limit = 20, startDate, endDate } = options;

    const where: any = {};
    if (startDate || endDate) {
      where.performed_at = {};
      if (startDate) where.performed_at[Op.gte] = startDate;
      if (endDate) where.performed_at[Op.lte] = endDate;
    }

    const recentAudits = await DeceasedPatientAudit.findAll({
      where,
      limit,
      order: [['performed_at', 'DESC']],
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'fullname', 'hospital_id'],
        },
        {
          model: Staff,
          as: 'staff',
          attributes: ['id', 'fullname', 'department'],
        },
      ],
    });

    return {
      recent_audits: recentAudits,
      total_count: await DeceasedPatientAudit.count({ where }),
    };
  }

  /**
   * Clean up old audit records (for maintenance)
   *
   * @static
   * @param {number} daysToKeep - Number of days to keep records
   * @returns {Promise<number>} Number of records deleted
   */
  static async cleanupOldAuditRecords(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const deletedCount = await DeceasedPatientAudit.destroy({
      where: {
        performed_at: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    console.log(`Cleaned up ${deletedCount} old audit records older than ${daysToKeep} days`);
    return deletedCount;
  }
}

export default AuditService;
