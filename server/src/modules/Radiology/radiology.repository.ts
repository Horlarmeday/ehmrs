import {
  Imaging,
  Investigation,
  InvestigationPrescription,
  InvestigationResult,
  InvestigationTariff,
  Patient,
  PatientInsurance,
  PrescribedInvestigation,
} from '../../database/models';
import sequelize, { Op, WhereOptions } from 'sequelize';
import {
  calcLimitAndOffset,
  canUsePriceTariff,
  dateIntervalQuery,
  paginate,
  patientAttributes,
  StatusCodes,
} from '../../core/helpers/helper';
import { getModelById, getPeriodQuery } from '../../core/helpers/general';
import { InvestigationStatus as Status } from '../../database/models/investigationPrescription';
import { InvestigationStatus } from '../../database/models/prescribedInvestigation';
import sequelizeConnection from '../../database/config/config';
import { ResultStatus } from '../../database/models/testResult';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import { CreateInvestigationDto, Result } from './dto/radiology.dto';
import { BadException } from '../../common/util/api-error';
import {
  ERROR_ADDING_RESULTS,
  INVESTIGATION_NOT_FOUND,
  RESULT_NOT_FOUND,
} from './messages/response-messages';
import { PaymentStatus } from '../../database/models/prescribedDrug';

/**
 * create new imaging
 * @param data
 * @returns {object} imaging data
 */
export const createImaging = async data => {
  const { name, description, staff_id } = data;
  return Imaging.create({
    name,
    description,
    staff_id,
  });
};

/**
 * get imaging by id
 * @param data
 * @returns {object} return imaging data
 */
export const getImagingById = async data => {
  return Imaging.findByPk(data);
};

/**
 * get imaging
 *
 * @function
 * @returns {json} json object with imaging data
 * @param currentPage
 * @param pageLimit
 */
export async function getImaging(currentPage = 1, pageLimit = 10) {
  return Imaging.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/**
 * search imaging
 *
 * @function
 * @returns {json} json object with imaging data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchImaging(currentPage = 1, pageLimit = 10, search) {
  return Imaging.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      name: {
        [Op.like]: `%${search}%`,
      },
    },
  });
}

/**
 * update a imaging
 * @param data
 * @returns {object} imaging data
 */
export const updateImaging = async data => {
  const { imaging_id } = data;
  const imaging = await getModelById(Imaging, imaging_id);
  return imaging.update(data);
};

/*******************************
 * INVESTIGATIONS
 ******************************/

const investigationResultFieldsToUpdate = (fields: string[] = []) => [
  'prescribed_investigation_id',
  'result',
  'comments',
  'status',
  'updatedAt',
  ...fields,
];

/**
 * create an Investigation
 * @param data
 * @returns {object} investigation data
 */
export const createInvestigation = async (data: CreateInvestigationDto) => {
  const {
    name,
    imaging_id,
    staff_id,
    price,
    type,
    retainership_price,
    nhis_price,
    phis_price,
  } = data;
  const investigation = await Investigation.create({
    name,
    imaging_id,
    staff_id,
    price,
    type,
    retainership_price,
    phis_price,
    nhis_price,
    is_available_for_nhis: !!nhis_price,
    is_available_for_phis: !!phis_price,
  });
  return Investigation.findOne({
    where: { id: investigation.id },
    include: [{ model: Imaging, attributes: ['name'] }],
  });
};

/**
 * get Investigations
 *
 * @function
 * @returns {json} json object with Investigations data
 * @param currentPage
 * @param pageLimit
 */
export async function getInvestigations(currentPage = 1, pageLimit = 10) {
  return Investigation.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Imaging, attributes: ['name'] }],
  });
}

/**
 * get Investigations under an imaging
 *
 * @function
 * @returns {json} json object with Investigations data
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export async function filterInvestigations(currentPage = 1, pageLimit = 10, filter) {
  return Investigation.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Imaging, attributes: ['name'] }],
    where: {
      imaging_id: filter,
    },
  });
}

/**
 * search Investigations
 *
 * @function
 * @returns {json} json object with Investigations data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchInvestigations(currentPage = 1, pageLimit = 10, search) {
  return Investigation.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Imaging, attributes: ['name'] }],
    where: {
      name: {
        [Op.like]: `%${search}%`,
      },
    },
  });
}

/**
 * update a investigation
 * @param data
 * @returns {object} investigation data
 */
export const updateInvestigation = async data => {
  const { investigation_id } = data;
  const investigation = await getModelById(Investigation, investigation_id);
  return investigation.update(data);
};

/** ***********************
 * INVESTIGATION TARIFFS
 ********************** */
/**
 * create test tariff
 *
 * @function
 * @returns {json} json object with tests data
 * @param data
 */
export const createInvestigationTariff = async data => {
  return InvestigationTariff.bulkCreate(data, { updateOnDuplicate: ['price'] });
};

const investigationPriceTariff = async (insurance: PatientInsurance, investigation_id: number) => {
  const { price } =
    (await InvestigationTariff.findOne({
      where: { investigation_id, hmo_id: insurance.hmo_id, insurance_id: insurance.insurance_id },
      order: [['createdAt', 'DESC']],
    })) || {};
  return price;
};

export const getInvestigationPrice = async (patient: Patient, investigation_id: number) => {
  if (!canUsePriceTariff(patient)) return null;

  const insurance = await getPatientInsuranceQuery({ patient_id: patient.id, is_default: true });
  if (!insurance) return null;

  const price = await investigationPriceTariff(insurance, investigation_id);
  if (price) return price;

  const investigation = await Investigation.findByPk(investigation_id);
  const investigationPrices = {
    NHIS: investigation.nhis_price,
    PHIS: investigation.phis_price,
    Retainership: investigation.retainership_price,
    FHSS: investigation.nhis_price,
  };
  return investigationPrices[insurance.insurance.name] || null;
};

/*************************
 * RADIOLOGY RESULTS
 **************************/

export const getLastInvestigationPrescription = async (patient_id: number) => {
  return InvestigationPrescription.findOne({
    where: { patient_id },
    order: [['date_requested', 'DESC']],
  });
};

export const createInvestigationPrescription = async (data: any) => {
  return InvestigationPrescription.create({ ...data });
};

export const getInvestigationPrescription = async query => {
  return InvestigationPrescription.findOne({ where: { ...query } });
};

export const getOneInvestigationPrescription = async (
  query: WhereOptions<InvestigationPrescription>
) => {
  return InvestigationPrescription.findOne({
    where: { ...query },
    include: [
      {
        model: PrescribedInvestigation,
        attributes: ['investigation_id', 'id', 'status', 'payment_status'],
        include: [{ model: Investigation, attributes: ['name'] }],
      },
    ],
  });
};

/**
 * get requested investigation
 *
 * @function
 * @param currentPage
 * @param pageLimit
 * @param period
 * @param search
 * @param start
 * @param end
 */
export const getRequestedInvestigations = async ({
  currentPage = 1,
  pageLimit = 10,
  period = null,
  search = null,
  start = null,
  end = null,
}) => {
  const { limit, offset } = calcLimitAndOffset(+currentPage, +pageLimit);
  const query = {
    [Op.or]: [{ status: Status.PENDING }, { status: Status.PARTIAL_RESULT }],
    ...(period && getPeriodQuery(period, 'date_requested')),
    ...(start && end && dateIntervalQuery('date_requested', start, end)),
  };
  const investigations = await InvestigationPrescription.findAll({
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('investigations.id')), 'total'],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN investigations.imaging_id = '${1}' THEN investigations.id END`
            )
          ),
          'scan_investigations_count',
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN investigations.imaging_id = '${2}' THEN investigations.id END`
            )
          ),
          'xray_investigations_count',
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN investigations.status = '${InvestigationStatus.PENDING}' THEN investigations.id END`
            )
          ),
          'pending_investigations_count',
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN investigations.status = '${InvestigationStatus.RESULT_ADDED}' THEN investigations.id END`
            )
          ),
          'pending_approvals_count',
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN investigations.payment_status = '${PaymentStatus.PENDING}' THEN investigations.id END`
            )
          ),
          'total_pending_payments',
        ],
      ],
    },
    order: [['date_requested', 'DESC']],
    where: {
      ...query,
    },
    include: [
      {
        model: PrescribedInvestigation,
        as: 'investigations',
        attributes: [], // Exclude all columns from the PrescribedInvestigation table (we only need the count)
      },
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          ...(search && {
            [Op.or]: [
              {
                firstname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                lastname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                hospital_id: {
                  [Op.like]: `%${search}%`,
                },
              },
            ],
          }),
        },
      },
    ],
    group: ['InvestigationPrescription.id'], // Group the results by InvestigationPrescription.id to get the count per investigation
    subQuery: false,
    limit,
    offset,
  });
  const count = await InvestigationPrescription.count({ where: { ...query } });
  return paginate({ rows: investigations, count }, currentPage, limit);
};

export const getOneRequestedInvestigation = async (
  investigationPrescriptionId: number | string
) => {
  const investigation = await InvestigationPrescription.findOne({
    where: { id: investigationPrescriptionId },
    attributes: ['status'],
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
      {
        model: PrescribedInvestigation,
        attributes: ['investigation_id', 'id', 'status', 'payment_status'],
        include: [
          { model: Investigation, attributes: ['name', 'id'] },
          {
            model: InvestigationResult,
            attributes: ['result', 'image', 'comments', 'status'],
          },
        ],
      },
    ],
  });
  if (!investigation)
    throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, INVESTIGATION_NOT_FOUND);
  const insurance = await getPatientInsuranceQuery({
    patient_id: investigation?.patient?.id,
    is_default: true,
  });
  return {
    ...investigation.toJSON(),
    insurance: { ...insurance?.toJSON() },
  };
};

export const appendInvestigationResults = async (data: any[]) => {
  return sequelizeConnection.transaction(async t => {
    const testResults = await InvestigationResult.bulkCreate(data, {
      updateOnDuplicate: investigationResultFieldsToUpdate(),
      transaction: t,
    });
    const testIds = data.map(
      ({ prescribed_investigation_id }) => prescribed_investigation_id
    ) as number[];

    const results = await InvestigationResult.findAll({
      where: { prescribed_investigation_id: testIds },
      transaction: t,
    });

    if (!results?.length)
      throw new BadException('Error', StatusCodes.BAD_REQUEST, ERROR_ADDING_RESULTS);

    await Promise.all(
      data.map(async investigation =>
        PrescribedInvestigation.update(
          {
            status: investigation.testStatus,
            result_id: results?.find(
              ({ prescribed_investigation_id }) =>
                prescribed_investigation_id === investigation.prescribed_investigation_id
            )?.id,
          },
          { where: { id: investigation.prescribed_investigation_id }, transaction: t }
        )
      )
    );
    const prescribedInvestigationCount = await PrescribedInvestigation.count({
      where: {
        investigation_prescription_id: data[0].investigation_prescription_id,
        status: {
          [Op.ne]: InvestigationStatus.REFERRED,
        },
      },
      transaction: t,
    });
    const statusToUpdate =
      prescribedInvestigationCount === results.length ? Status.RESULT_ADDED : Status.PARTIAL_RESULT;

    await InvestigationPrescription.update(
      { status: statusToUpdate },
      { where: { id: data[0].investigation_prescription_id }, transaction: t }
    );
    return testResults;
  });
};

export const getInvestigationsForApproval = async ({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  start = null,
  end = null,
}) => {
  const { limit, offset } = calcLimitAndOffset(+currentPage, +pageLimit);
  const query = {
    [Op.or]: [{ status: Status.RESULT_ADDED }, { status: Status.PARTIAL_RESULT }],
    ...(start && end && dateIntervalQuery('date_requested', start, end)),
  };
  const investigations = await InvestigationPrescription.findAll({
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('investigations.id')), 'total'],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN investigations.status = '${InvestigationStatus.RESULT_ADDED}' THEN investigations.id END`
            )
          ),
          'pending_approvals_count',
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN investigations.status = '${InvestigationStatus.APPROVED}' THEN investigations.id END`
            )
          ),
          'approved_count',
        ],
      ],
    },
    order: [['date_requested', 'DESC']],
    where: {
      ...query,
    },
    include: [
      {
        model: PrescribedInvestigation,
        as: 'investigations',
        attributes: [], // Exclude all columns from the PrescribedTest table (we only need the count)
      },
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          ...(search && {
            [Op.or]: [
              {
                firstname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                lastname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                hospital_id: {
                  [Op.like]: `%${search}%`,
                },
              },
            ],
          }),
        },
      },
    ],
    group: ['InvestigationPrescription.id'], // Group the results by InvestigationPrescription.id to get the count per investigation
    subQuery: false,
    limit,
    offset,
  });
  const count = await InvestigationPrescription.count({ where: { ...query } });
  return paginate({ rows: investigations, count }, currentPage, limit);
};

export const approveInvestigationResults = async (
  data: Partial<Result & { staff_id: number }>[]
) => {
  return sequelizeConnection.transaction(async t => {
    await Promise.all(
      data.map(async test => {
        await PrescribedInvestigation.update(
          {
            status: InvestigationStatus.APPROVED,
            investigation_approved_date: Date.now(),
            investigation_approved_by: test.staff_id,
          },
          { where: { id: test.prescribed_investigation_id }, transaction: t }
        );
        await InvestigationResult.update(
          { status: ResultStatus.ACCEPTED },
          {
            where: { prescribed_investigation_id: test.prescribed_investigation_id },
            transaction: t,
          }
        );
      })
    );

    const prescribedInvestigationsCount = await PrescribedInvestigation.count({
      where: {
        investigation_prescription_id: data[0].investigation_prescription_id,
        status: {
          [Op.ne]: Status.REFERRED,
        },
      },
      transaction: t,
    });
    const approvedInvestigationsCount = await PrescribedInvestigation.count({
      where: {
        investigation_prescription_id: data[0].investigation_prescription_id,
        status: InvestigationStatus.APPROVED,
      },
      transaction: t,
    });
    const statusToUpdate =
      prescribedInvestigationsCount === approvedInvestigationsCount
        ? Status.COMPLETED
        : Status.PARTIAL_APPROVED;
    if (prescribedInvestigationsCount === data.length) {
      await InvestigationPrescription.update(
        { status: statusToUpdate },
        { where: { id: data[0].investigation_prescription_id }, transaction: t }
      );
    }
    return prescribedInvestigationsCount;
  });
};

export const getInvestigationsResults = async ({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  start = null,
  end = null,
}) => {
  const { limit, offset } = calcLimitAndOffset(+currentPage, +pageLimit);
  const query = {
    [Op.or]: [{ status: Status.COMPLETED }, { status: Status.PARTIAL_RESULT }],
    ...(start && end && dateIntervalQuery('date_requested', start, end)),
  };
  const investigations = await InvestigationPrescription.findAll({
    order: [['date_requested', 'DESC']],
    where: {
      ...query,
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          ...(search && {
            [Op.or]: [
              {
                firstname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                lastname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                hospital_id: {
                  [Op.like]: `%${search}%`,
                },
              },
            ],
          }),
        },
      },
    ],
    limit,
    offset,
  });
  const count = await InvestigationPrescription.count({ where: { ...query } });
  return paginate({ rows: investigations, count }, currentPage, limit);
};

export const getInvestigationResult = async (investigationPrescriptionId: number | string) => {
  const result = await InvestigationPrescription.findOne({
    where: {
      id: investigationPrescriptionId,
    },
    attributes: [],
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
      {
        model: InvestigationResult,
        attributes: ['result', 'prescribed_investigation_id', 'status'],
        where: {
          status: ResultStatus.ACCEPTED,
        },
        include: [
          {
            model: PrescribedInvestigation,
            attributes: ['id'],
            include: [{ model: Investigation, attributes: ['name'] }],
          },
        ],
      },
    ],
  });
  if (!result) throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, RESULT_NOT_FOUND);
  const insurance = await getPatientInsuranceQuery({
    patient_id: result?.patient?.id,
    is_default: true,
  });
  return {
    ...result.toJSON(),
    insurance: { ...insurance?.toJSON() },
  };
};
