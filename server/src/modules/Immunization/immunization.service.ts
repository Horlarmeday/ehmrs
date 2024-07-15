import {
  createImmunizationAccount,
  getImmunizationPatients,
  getOneImmunization,
  updateImmunizationAccount,
} from './immunization.repository';
import { CreateImmunizationBody } from './types/immunization.types';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import { Immunization } from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { ERROR_UPDATE_IMMUNIZATION } from './messages/immunization.messages';
import { JobSchedule } from '../../core/command/worker/schedule';
import { createVisit, endVisit, getLastActiveVisit } from '../Visit/visit.repository';
import { VisitCategory } from '../../database/models/visit';
import { insertSingleOrMultipleServices } from '../../core/helpers/helper';

export class ImmunizationService {
  /**
   * create immunization account
   * @param body
   * @memberof AntenatalService
   */
  static async createImmunizationAccount(body: CreateImmunizationBody) {
    const immunization = await createImmunizationAccount(body);
    await JobSchedule.assignImmunizationNumber(immunization.id);

    const existingVisit = await getLastActiveVisit(immunization.patient_id);
    if (existingVisit) await endVisit(existingVisit);

    const visit = await createVisit({
      patient_id: immunization.patient_id,
      category: VisitCategory.IMMUNIZATION,
      immunization_id: immunization.id,
      type: 'New visit',
      date_of_visit: new Date(),
      department: 'Nursing',
      professional: 'Nurse',
    });
    await insertSingleOrMultipleServices({
      service_id: body.service_id,
      patient_id: immunization.patient_id,
      staff_id: body.staff_id,
      visit,
    });
    return immunization;
  }

  /**
   * Get one immunization account
   * @memberof AntenatalService
   * @param immunizationId
   */
  static async getOneImmunizationAccount(immunizationId: number) {
    const immunization = await getOneImmunization({ id: immunizationId });
    const insurance = await getPatientInsuranceQuery({
      patient_id: immunization.patient_id,
      is_default: true,
    });
    return { ...immunization.toJSON(), insurance };
  }

  /**
   * Update immunization account
   * @memberof AntenatalService
   * @param immunizationId
   * @param body
   */
  static async updateImmunization(immunizationId: number, body: Partial<Immunization>) {
    const immunization = await updateImmunizationAccount(immunizationId, body);
    if (immunization[0] === 1) {
      return getOneImmunization({ id: immunizationId });
    }
    throw new BadException('Error', 400, ERROR_UPDATE_IMMUNIZATION);
  }

  /**
   * Get antenatal patients
   * @param body
   * @memberof AntenatalService
   */
  static async getImmunizationPatients(body) {
    const { currentPage, pageLimit, search } = body;

    if (search) {
      return getImmunizationPatients({ currentPage, pageLimit, search });
    }

    if (Object.keys(body).length) {
      return getImmunizationPatients({ currentPage, pageLimit });
    }

    return getImmunizationPatients({});
  }
}
