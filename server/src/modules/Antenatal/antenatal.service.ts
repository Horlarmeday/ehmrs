import {
  CreateAntenatal,
  CreateAntenatalTriage,
  CreateClinicalNote,
  CreateDeliveryInfo,
  CreateObservation,
  CreatePostNatal,
  UpdateAntenatalAccount,
} from './types/antenatal.types';
import { getPatientById } from '../Patient/patient.repository';
import { Gender } from '../../database/models/staff';
import { BadException } from '../../common/util/api-error';
import { StatusCodes } from '../../core/helpers/helper';
import {
  createAntenatalAccount,
  createAntenatalTriage,
  createClinicalNote,
  createPreviousPregnancies,
  getAntenatalPatients,
  getAntenatalTriages,
  getClinicalNotes,
  getOneAntenatalAccount,
  updateAntenatalAccount,
  updateClinicalNote,
  createObservation,
  updateObservation,
  getObservations,
  getVisitsSummary,
  createDeliveryInfo,
  getDeliveryInfo,
  createPostnatal,
  getPostnatalInfo,
  getPreviousPregnancies,
} from './antenatal.repository';
import { AccountStatus } from '../../database/models/antenatal';
import { prescribeService } from '../Orders/Service/service-order.repository';
import { getOneService } from '../AdminSettings/admin.repository';
import { ANTENATAL_ACCOUNT_EXISTS, FEMALE_REQUIRED } from './messages/antenatal.messages';
import { JobSchedule } from '../../core/command/worker/schedule';
import dayjs from 'dayjs';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import { bulkCreateDiagnosis } from '../Consultation/consultation.repository';

export class AntenatalService {
  /**
   * create antenatal account
   * @param body
   * @memberof AntenatalService
   */
  static async createAntenatalAccount(body: CreateAntenatal) {
    const { patient_id, service_id, staff_id } = body;
    await this.antenatalValidations(patient_id);
    const dates = {
      start_date: dayjs().toDate(),
      end_date: dayjs()
        .add(9, 'months')
        .add(2, 'weeks')
        .toDate(),
    };

    const antenatal = await createAntenatalAccount({
      ...body,
      ...dates,
    });
    await JobSchedule.assignAntenatalNumber(antenatal.id, patient_id); // update antenatal number

    if (service_id) {
      const service = await getOneService({ id: service_id });
      await prescribeService({
        service_id,
        service_type: 'Cash',
        price: service.price,
        patient_id,
        requester: staff_id,
        ante_natal_id: antenatal.id,
      });
    }
    return antenatal;
  }

  /**
   * Get antenatal patients
   * @param body
   * @memberof AntenatalService
   */
  static async getAntenatalPatients(body) {
    const { currentPage, pageLimit, search } = body;

    if (search) {
      return getAntenatalPatients({ currentPage, pageLimit, search });
    }

    if (Object.keys(body).length) {
      return getAntenatalPatients({ currentPage, pageLimit });
    }

    return getAntenatalPatients({});
  }

  /**
   * Get one antenatal account
   * @memberof AntenatalService
   * @param antenatalId
   */
  static async getOneAntenatalAccount(antenatalId: number) {
    const antenatal = await getOneAntenatalAccount({ id: antenatalId });
    const insurance = await getPatientInsuranceQuery({
      patient_id: antenatal.patient_id,
      is_default: true,
    });
    return { ...antenatal.toJSON(), insurance };
  }

  /**
   * Update antenatal account
   * @memberof AntenatalService
   * @param body
   * @param antenatalId
   * @param staff_id
   */
  static async updateAntenatalAccount(
    body: UpdateAntenatalAccount,
    antenatalId: number,
    staff_id: number
  ) {
    const { pregnancies } = body || {};
    const antenatal = await updateAntenatalAccount({
      id: antenatalId,
      ...body,
      account_status: AccountStatus.ACTIVE,
    });
    if (pregnancies?.length) {
      const prevPregnancies = pregnancies.map(preg => ({
        ...preg,
        ante_natal_id: antenatalId,
        patient_id: antenatal.patient_id,
        staff_id,
      }));
      await createPreviousPregnancies(prevPregnancies);
    }
    return antenatal;
  }

  /**
   * Get antenatal previous pregnancies
   * @memberof AntenatalService
   * @param antenatalId
   */
  static async getPreviousPregnancies(antenatalId: number) {
    return getPreviousPregnancies({ ante_natal_id: antenatalId });
  }

  /**
   * Create antenatal triage
   * @memberof AntenatalService
   * @param body
   * @param antenatalId
   * @param staff_id
   */
  static async createAntenatalTriage(
    body: CreateAntenatalTriage,
    antenatalId: number,
    staff_id: number
  ) {
    const antenatal = await getOneAntenatalAccount({ id: antenatalId });
    return await createAntenatalTriage({
      ...body,
      patient_id: antenatal.patient_id,
      ante_natal_id: antenatal.id,
      staff_id,
    });
  }

  /**
   * Get antenatal triages
   * @param body
   * @memberof AntenatalService
   */
  static async getAntenatalTriages(body) {
    const { currentPage, pageLimit, filter } = body;

    if (filter) {
      return getAntenatalTriages({ currentPage, pageLimit, filter });
    }

    if (Object.keys(body).length) {
      return getAntenatalTriages({ currentPage, pageLimit, filter });
    }

    return getAntenatalTriages({});
  }

  /**
   * Create antenatal clinical note
   * @memberof AntenatalService
   * @param body
   * @param antenatalId
   * @param staff_id
   */
  static async createClinicalNote(body: CreateClinicalNote, antenatalId: number, staff_id: number) {
    const antenatal = await getOneAntenatalAccount({ id: antenatalId });
    return await createClinicalNote({
      ...body,
      patient_id: antenatal.patient_id,
      ante_natal_id: antenatal.id,
      staff_id,
    });
  }

  /**
   * Get antenatal clinical notes
   * @param body
   * @memberof AntenatalService
   */
  static async getClinicalNotes(body) {
    const { currentPage, pageLimit, filter } = body;

    if (filter) {
      return getClinicalNotes({ currentPage, pageLimit, filter });
    }

    if (Object.keys(body).length) {
      return getClinicalNotes({ currentPage, pageLimit, filter });
    }

    return getClinicalNotes({});
  }

  /**
   * Update antenatal clinical note
   * @memberof AntenatalService
   * @param body
   */
  static async updateClinicalNote(body: CreateClinicalNote) {
    return updateClinicalNote({ ...body }, { id: body.clinical_note_id });
  }

  /**
   * Create antenatal observation
   * @memberof AntenatalService
   * @param body
   */
  static async createObservation(body: CreateObservation) {
    const {
      diagnosis,
      visit_id,
      doctor_comments,
      foetal_condition,
      mother_condition,
      continuation_sheet,
      staff_id,
      ante_natal_id,
    } = body;
    const antenatal = await getOneAntenatalAccount({ id: ante_natal_id });
    const mappedDiagnosis = diagnosis.map(result => ({
      ...result,
      staff_id,
      patient_id: antenatal.patient_id,
      visit_id,
    }));
    const [observation, diagnoses] = await Promise.all([
      createObservation({
        doctor_comments,
        foetal_condition,
        mother_condition,
        continuation_sheet,
        ante_natal_id: antenatal.id,
        patient_id: antenatal.patient_id,
        visit_id,
        staff_id,
      }),
      bulkCreateDiagnosis(mappedDiagnosis),
    ]);
    return { observation, diagnoses };
  }

  /**
   * Update antenatal clinical note
   * @memberof AntenatalService
   * @param body
   */
  static async updateObservation(body: CreateObservation) {
    return updateObservation({ ...body }, { id: body.observation_id });
  }

  /**
   * Get antenatal observations
   * @param body
   * @memberof AntenatalService
   */
  static async getObservations(body) {
    const { currentPage, pageLimit, filter } = body;

    if (filter) {
      return getObservations({ currentPage, pageLimit, filter });
    }

    if (Object.keys(body).length) {
      return getObservations({ currentPage, pageLimit, filter });
    }

    return getObservations({});
  }

  /**
   * Get antenatal all visits summary
   * @param body
   * @memberof AntenatalService
   */
  static async getVisitsSummary(body) {
    const { currentPage, pageLimit, antenatalId } = body;

    if (Object.keys(body).length) {
      return getVisitsSummary(currentPage, pageLimit, antenatalId);
    }

    return getVisitsSummary(1, 5, antenatalId);
  }

  /**
   * Create patient delivery information
   * @memberof AntenatalService
   * @param body
   * @param antenatalId
   * @param staff_id
   */
  static async createDeliveryInfo(body: CreateDeliveryInfo, antenatalId: number, staff_id: number) {
    const antenatal = await getOneAntenatalAccount({ id: antenatalId });
    return await createDeliveryInfo({
      ...body,
      patient_id: antenatal.patient_id,
      ante_natal_id: antenatal.id,
      staff_id,
    });
  }

  /**
   * Get patient delivery information
   * @memberof AntenatalService
   * @param antenatalId
   */
  static async getDeliveryInfo(antenatalId: number) {
    return getDeliveryInfo({ ante_natal_id: antenatalId });
  }

  /**
   * Create patient postnatal information
   * @memberof AntenatalService
   * @param body
   * @param antenatalId
   * @param staff_id
   */
  static async createPostnatal(body: CreatePostNatal, antenatalId: number, staff_id: number) {
    const antenatal = await getOneAntenatalAccount({ id: antenatalId });
    return await createPostnatal(
      {
        ...body,
        patient_id: antenatal.patient_id,
        ante_natal_id: antenatal.id,
        staff_id,
      },
      antenatalId
    );
  }

  /**
   * Get patient postnatal information
   * @memberof AntenatalService
   * @param antenatalId
   */
  static async getPostnatal(antenatalId: number) {
    return getPostnatalInfo({ ante_natal_id: antenatalId });
  }

  private static async antenatalValidations(patient_id: number) {
    const patient = await getPatientById(patient_id);
    if (patient.gender !== Gender.FEMALE)
      throw new BadException('INVALID', StatusCodes.BAD_REQUEST, FEMALE_REQUIRED);

    const account = await getOneAntenatalAccount({ patient_id: patient.id });
    if (account && account?.account_status !== AccountStatus.COMPLETED)
      throw new BadException('INVALID', StatusCodes.BAD_REQUEST, ANTENATAL_ACCOUNT_EXISTS);
  }
}
