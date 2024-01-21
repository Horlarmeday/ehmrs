import {
  AdmissionBodyType,
  CarePlanBodyType,
  ChangeWardBodyType,
  DischargeBodyType,
  IOChartBodyType,
  ObservationBodyType,
  UpdateAdmissionBody,
} from './types/admission.types';
import {
  admitPatient,
  changePatientWard,
  createCarePlan,
  createIOChart,
  createNursingNote,
  createObservation,
  createWardRound,
  dischargePatient,
  getAdmissionHistory,
  getAdmissionQuery,
  getAdmittedPatients,
  getAntenatalAdmittedPatients,
  getCarePlans,
  getDischargeRecords,
  getIOCharts,
  getNursingNotes,
  getObservations,
  getOneAdmission,
  getOneDischargeRecord,
  getWardRounds,
  updateAdmission,
} from './admission.repository';
import { getVisitById } from '../Visit/visit.repository';
import { Admission, DischargeStatus } from '../../database/models/admission';
import { BadException } from '../../common/util/api-error';
import { StatusCodes } from '../../core/helpers/helper';
import { PATIENT_ON_ADMISSION } from './messages/response-messages';
import {
  CarePlan,
  Discharge,
  IOChart,
  NursingNote,
  Observation,
  WardRound,
} from '../../database/models';
import { getPrescriptions } from '../Consultation/consultation.repository';
import { VisitCategory } from '../../database/models/visit';

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
   * @param staffId
   */
  static async updateAdmission(body: UpdateAdmissionBody, staffId: number) {
    await updateAdmission({ ...body, discharge_recommended_by: staffId }, body.admissionId);
    return getAdmissionQuery({ id: body.admissionId });
  }

  /**
   * change patient ward
   * @param body
   * @param admissionId
   */
  static async changePatientWard(body: ChangeWardBodyType, admissionId: number) {
    const admission = await getOneAdmission({ id: admissionId });
    await changePatientWard(admission, body);
    return getAdmissionQuery({ id: admissionId });
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
    const { currentPage, pageLimit, search, filter, start, end, visitType } = body;

    if (visitType) {
      return getAntenatalAdmittedPatients({
        currentPage,
        pageLimit,
        start,
        end,
        search,
      });
    }

    if (Object.values(body).length) {
      return getAdmittedPatients({
        currentPage,
        pageLimit,
        search,
        filter,
        start,
        end,
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

  /**
   * discharge a patient
   *
   * @method
   * @returns {Promise<Discharge>} json object with discharge data
   * @memberOf AdmissionService
   * @param body
   * @param admissionId
   * @param staffId
   */
  static async dischargePatient(
    body: DischargeBodyType,
    admissionId: number,
    staffId: number
  ): Promise<Discharge> {
    const admission = await getOneAdmission({ id: admissionId });
    const data = {
      ...body,
      admission_id: admission.id,
      patient_id: admission.patient_id,
      visit_id: admission.visit_id,
      ward_id: admission.ward_id,
      discharged_by: staffId,
    };
    return dischargePatient(data);
  }

  /**
   * get admitted patients
   *
   * @static
   * @returns {Promise<{ total: any; docs: Admission[]; pages: number; perPage: number; currentPage: number }>} json object with admissions data
   * @param body
   * @memberOf VisitService
   */
  static async getDischargeRecords(
    body
  ): Promise<{
    total: any;
    docs: Discharge[];
    pages: number;
    perPage: number;
    currentPage: number;
  }> {
    const { currentPage, pageLimit, search, start, end } = body;

    if (start && end) {
      return getDischargeRecords({
        currentPage,
        pageLimit,
        start,
        end,
        search,
      });
    }

    if (Object.values(body).length) {
      return getDischargeRecords({
        currentPage,
        pageLimit,
        search,
      });
    }

    return getDischargeRecords({});
  }

  /**
   * get a discharge record
   *
   * @method
   * @returns {json} json object with discharge data
   * @memberOf AdmissionService
   * @param admissionId
   */
  static async getOneDischargeRecord(admissionId: number): Promise<Discharge> {
    return getOneDischargeRecord({ admission_id: admissionId });
  }

  /**
   * get doctor prescriptions
   *
   * @method
   * @returns {json} json object with tests, drugs, investigations etc. data
   * @memberOf AdmissionService
   * @param admissionId
   */
  static async getDoctorPrescriptions(admissionId: number) {
    const admission = await getOneAdmission({ id: admissionId });
    return await getPrescriptions(admission.visit_id, VisitCategory.IPD);
  }

  /**
   * get admission history
   *
   * @method
   * @returns {json} json object with tests, drugs, investigations etc. data
   * @memberOf AdmissionService
   * @param admissionId
   */
  static async getAdmissionHistory(admissionId: number) {
    return getAdmissionHistory(admissionId);
  }

  /**
   * create a patient ward round
   *
   * @method
   * @returns {Promise<NursingNote>} json object with ward round data
   * @memberOf AdmissionService
   * @param body
   * @param admissionId
   * @param staffId
   */
  static async createWardRound(
    body: CarePlanBodyType,
    admissionId: number,
    staffId: number
  ): Promise<WardRound> {
    const admission = await getOneAdmission({ id: admissionId });
    return createWardRound({
      ...body,
      admission_id: admission.id,
      visit_id: admission.visit_id,
      staff_id: staffId,
      patient_id: admission.patient_id,
    });
  }

  /**
   * get a patient ward rounds
   *
   * @method
   * @returns {json} json object with ward rounds data
   * @memberOf AdmissionService
   * @param admissionId
   */
  static async getWardRounds(admissionId: number): Promise<WardRound[]> {
    return getWardRounds({ admission_id: admissionId });
  }
}
