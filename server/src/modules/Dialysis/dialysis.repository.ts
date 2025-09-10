import { Op } from 'sequelize';
import { BadException } from '../../common/util/api-error';
import {
  DialysisVitals,
  DialysisTreatment,
  DialysisAssessment,
  DialysisNotes,
  Staff,
  DialysisVisit,
} from '../../database/models';
import { staffAttributes } from '../../core/helpers/helper';

export const getDialysisVitals = async (visitIds: number[]) => {
  try {
    if (!visitIds || visitIds.length === 0) return [];
    return await DialysisVitals.findAll({
      where: { visit_id: { [Op.in]: visitIds } },
      include: [
        { model: Staff, attributes: staffAttributes },
        { model: DialysisVisit, attributes: ['id', 'dialysis_type'] },
      ],
      order: [['time', 'ASC']],
    });
  } catch (error) {
    throw new BadException('DATABASE_ERROR', 500, `Failed to fetch dialysis vitals, ${error}`);
  }
};

export const getDialysisTreatments = async (visitIds: number[]) => {
  try {
    if (!visitIds || visitIds.length === 0) return [];
    return await DialysisTreatment.findAll({
      where: { visit_id: { [Op.in]: visitIds } },
      include: [
        { model: Staff, attributes: staffAttributes },
        { model: DialysisVisit, attributes: ['id', 'dialysis_type', 'scheduled_date'] },
      ],
      order: [['actual_start_date', 'DESC']],
    });
  } catch (error) {
    throw new BadException('DATABASE_ERROR', 500, `Failed to fetch dialysis treatments, ${error}`);
  }
};

export const getDialysisAssessments = async (visitIds: number[]) => {
  try {
    if (!visitIds || visitIds.length === 0) return [];
    return await DialysisAssessment.findAll({
      where: { visit_id: { [Op.in]: visitIds } },
      include: [{ model: DialysisVisit, attributes: ['id', 'dialysis_type'] }],
      order: [['assessment_date', 'DESC']],
    });
  } catch (error) {
    throw new BadException('DATABASE_ERROR', 500, `Failed to fetch dialysis assessments, ${error}`);
  }
};

export const getDialysisNotes = async (visitIds: number[]) => {
  try {
    if (!visitIds || visitIds.length === 0) return [];
    return await DialysisNotes.findAll({
      where: { visit_id: { [Op.in]: visitIds } },
      include: [
        { model: Staff, attributes: staffAttributes },
        { model: DialysisVisit, attributes: ['id', 'dialysis_type'] },
      ],
      order: [['created_at', 'DESC']],
    });
  } catch (error) {
    throw new BadException('DATABASE_ERROR', 500, `Failed to fetch dialysis notes, ${error}`);
  }
};
