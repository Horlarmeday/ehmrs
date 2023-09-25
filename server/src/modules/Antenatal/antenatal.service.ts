import {
  CreateAntenatal,
  CreateAntenatalTriage, CreateClinicalNote,
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
  getAntenatalTriages, getClinicalNotes,
  getOneAntenatalAccount,
  updateAntenatalAccount, updateClinicalNote,
} from './antenatal.repository';
import { AccountStatus } from '../../database/models/antenatal';
import { prescribeService } from '../Orders/Service/service-order.repository';
import { getOneService } from '../AdminSettings/admin.repository';
import { ANTENATAL_ACCOUNT_EXISTS, FEMALE_REQUIRED } from './messages/antenatal.messages';
import { assignAntenatalNumber } from '../../core/command/worker/schedule';
import moment from 'moment';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';

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
      start_date: moment().toDate(),
      end_date: moment()
        .add(9, 'months')
        .add(2, 'weeks')
        .toDate(),
    };

    const antenatal = await createAntenatalAccount({
      ...body,
      ...dates,
    });
    await assignAntenatalNumber(antenatal.id, patient_id); // update antenatal number

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
      return getAntenatalPatients({ currentPage: +currentPage, pageLimit: +pageLimit, search });
    }

    if (Object.keys(body).length) {
      return getAntenatalPatients({ currentPage: +currentPage, pageLimit: +pageLimit });
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
    const { currentPage, pageLimit, antenatalId } = body;

    if (Object.keys(body).length) {
      return getAntenatalTriages({ currentPage: +currentPage, pageLimit: +pageLimit, antenatalId });
    }

    return getAntenatalTriages({ antenatalId });
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
    const { currentPage, pageLimit, antenatalId } = body;

    if (Object.keys(body).length) {
      return getClinicalNotes({ currentPage: +currentPage, pageLimit: +pageLimit, antenatalId });
    }

    return getClinicalNotes({ antenatalId });
  }

  /**
   * Update antenatal clinical note
   * @memberof AntenatalService
   * @param body
   */
  static async updateClinicalNote(body: CreateClinicalNote) {
    return updateClinicalNote({ ...body }, { id: body.clinical_note_id });
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
