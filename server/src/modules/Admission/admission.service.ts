import {
  AdmissionBodyType,
  CarePlanBodyType,
  IOChartBodyType,
  ObservationBodyType,
  UpdateAdmissionBody,
} from './types/admission.types';
import {
  admitPatient,
  createCarePlan,
  createIOChart,
  createNursingNote,
  createObservation,
  getAdmissionQuery,
  getAdmittedPatients,
  getCarePlans,
  getIOCharts,
  getNursingNotes,
  getObservations,
  getOneAdmission,
  updateAdmission,
} from './admission.repository';
import { getVisitById } from '../Visit/visit.repository';
import { Admission, DischargeStatus } from '../../database/models/admission';
import { BadException } from '../../common/util/api-error';
import { StatusCodes } from '../../core/helpers/helper';
import { PATIENT_ON_ADMISSION } from './messages/response-messages';
import { CarePlan, IOChart, NursingNote, Observation } from '../../database/models';

export class AdmissionService {
  /**
   * admit a patient to a ward
   *
   * @method
   * @returns {Promise<Admission>} json object with admission data
   * @memberOf AdmissionService
   * @param body
   */
  static async admitPatient(body: AdmissionBodyType): Promise<Admission> {
    const visit = await getVisitById(body.visit_id);
    const admission = await getOneAdmission({ patient_id: visit.patient_id });
    if (admission && admission?.discharge_status === DischargeStatus.ON_ADMISSION) {
      throw new BadException('Invalid', StatusCodes.BAD_REQUEST, PATIENT_ON_ADMISSION);
    }
    return admitPatient({ ...body, patient_id: visit.patient_id });
  }

  /**
   * get a patient admission data
   *
   * @method
   * @returns {json} json object with admission data
   * @memberOf AdmissionService
   * @param body
   */
  static async getPatientAdmission(body): Promise<Admission> {
    const query = {
      ...(body?.visitId && { visit_id: body.visitId }),
      ...(body?.admissionId && { id: body.admissionId }),
    };
    return getAdmissionQuery({ ...query });
  }

  /**
   * update admission details
   * @param body
   */
  static async updateAdmission(body: UpdateAdmissionBody) {
    return updateAdmission(body, body.admissionId);
  }

  /**
   * get admitted patients
   *
   * @static
   * @returns {Promise<{ total: any; docs: Admission[]; pages: number; perPage: number; currentPage: number }>} json object with admissions data
   * @param body
   * @memberOf VisitService
   */
  static async getAdmittedPatients(
    body
  ): Promise<{
    total: any;
    docs: Admission[];
    pages: number;
    perPage: number;
    currentPage: number;
  }> {
    const { currentPage, pageLimit, search, filter, start, end } = body;

    if (start && end) {
      return getAdmittedPatients({
        currentPage,
        pageLimit,
        start,
        end,
        filter,
        search,
      });
    }

    if (Object.values(body).length) {
      return getAdmittedPatients({
        currentPage,
        pageLimit,
        search,
        filter,
      });
    }

    return getAdmittedPatients({ filter });
  }

  /**
   * create a patient observation
   *
   * @method
   * @returns {Promise<Observation>} json object with observation data
   * @memberOf AdmissionService
   * @param body
   * @param admissionId
   * @param staffId
   */
  static async createObservation(
    body: ObservationBodyType,
    admissionId: number,
    staffId: number
  ): Promise<Observation> {
    const admission = await getOneAdmission({ id: admissionId });
    return createObservation({
      ...body,
      admission_id: admission.id,
      staff_id: staffId,
      visit_id: admission.visit_id,
      patient_id: admission.patient_id,
    });
  }

  /**
   * get a patient observations
   *
   * @method
   * @returns {json} json object with observations data
   * @memberOf AdmissionService
   * @param admissionId
   */
  static async getObservations(admissionId: number): Promise<Observation[]> {
    return getObservations({ admission_id: admissionId });
  }

  /**
   * create a patient care plan
   *
   * @method
   * @returns {Promise<Observation>} json object with care plan data
   * @memberOf AdmissionService
   * @param body
   * @param admissionId
   * @param staffId
   */
  static async createCarePlan(
    body: CarePlanBodyType,
    admissionId: number,
    staffId: number
  ): Promise<CarePlan> {
    const admission = await getOneAdmission({ id: admissionId });
    return createCarePlan({
      ...body,
      admission_id: admission.id,
      visit_id: admission.visit_id,
      staff_id: staffId,
      patient_id: admission.patient_id,
    });
  }

  /**
   * get a patient care plans
   *
   * @method
   * @returns {json} json object with care plans data
   * @memberOf AdmissionService
   * @param admissionId
   */
  static async getCarePlans(admissionId: number): Promise<CarePlan[]> {
    return getCarePlans({ admission_id: admissionId });
  }

  /**
   * create a patient IO Chart
   *
   * @method
   * @returns {Promise<Observation>} json object with IO Chart data
   * @memberOf AdmissionService
   * @param body
   * @param admissionId
   * @param staffId
   */
  static async createIOChart(
    body: IOChartBodyType[],
    admissionId: number,
    staffId: number
  ): Promise<IOChart[]> {
    const admission = await getOneAdmission({ id: admissionId });
    const data = body.map(chart => ({
      ...chart,
      admission_id: admission.id,
      staff_id: staffId,
      visit_id: admission.visit_id,
      patient_id: admission.patient_id,
    }));
    return createIOChart(data);
  }

  /**
   * get a patient IO Charts
   *
   * @method
   * @returns {json} json object with IO Charts data
   * @memberOf AdmissionService
   * @param admissionId
   */
  static async getIOCharts(admissionId: number): Promise<IOChart[]> {
    return getIOCharts({ admission_id: admissionId });
  }

  /**
   * create a patient nursing notes
   *
   * @method
   * @returns {Promise<NursingNote>} json object with nursing notes data
   * @memberOf AdmissionService
   * @param body
   * @param admissionId
   * @param staffId
   */
  static async createNursingNote(
    body: CarePlanBodyType,
    admissionId: number,
    staffId: number
  ): Promise<NursingNote> {
    const admission = await getOneAdmission({ id: admissionId });
    return createNursingNote({
      ...body,
      admission_id: admission.id,
      visit_id: admission.visit_id,
      staff_id: staffId,
      patient_id: admission.patient_id,
    });
  }

  /**
   * get a patient nursing notes
   *
   * @method
   * @returns {json} json object with nursing notes data
   * @memberOf AdmissionService
   * @param admissionId
   */
  static async getNursingNotes(admissionId: number): Promise<NursingNote[]> {
    return getNursingNotes({ admission_id: admissionId });
  }
}
