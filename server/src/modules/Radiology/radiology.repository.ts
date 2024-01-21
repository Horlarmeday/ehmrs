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
import sequelize, { Op } from 'sequelize';
import {
  calcLimitAndOffset,
  canUsePriceTariff,
  dateIntervalQuery,
  paginate,
} from '../../core/helpers/helper';
import { getModelById, getPeriodQuery } from '../../core/helpers/general';
import { InvestigationStatus } from '../../database/models/prescribedInvestigation';
import sequelizeConnection from '../../database/config/config';
import { ResultStatus } from '../../database/models/testResult';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import { CreateInvestigationDto } from './dto/radiology.dto';

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
  const { name, imaging_id, staff_id, price, type } = data;
  const investigation = await Investigation.create({
    name,
    imaging_id,
    staff_id,
    price,
    type,
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
  if (canUsePriceTariff(patient)) {
    const insurance = await getPatientInsuranceQuery({ patient_id: patient.id, is_default: true });
    return investigationPriceTariff(insurance, investigation_id);
  }
  return null;
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

/**
 * get requested investigation
 *
 * @function
 * @returns {json} json object with test samples data
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
    status: InvestigationStatus.PENDING,
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
              `DISTINCT CASE WHEN investigations.status = '${InvestigationStatus.PENDING}' THEN investigations.id END`
            )
          ),
          'pending_investigations_count',
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN investigations.status = '${InvestigationStatus.REFERRED}' THEN investigations.id END`
            )
          ),
          'referred_investigations_count',
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
        attributes: ['firstname', 'lastname', 'fullname', 'hospital_id'],
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
  return await InvestigationPrescription.findOne({
    where: { id: investigationPrescriptionId },
    attributes: ['status'],
    include: [
      {
        model: Patient,
        attributes: ['firstname', 'lastname', 'hospital_id', 'gender', 'id'],
      },
      {
        model: PrescribedInvestigation,
        attributes: ['investigation_id', 'id', 'status'],
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
    });

    await Promise.all(
      data.map(async investigation =>
        PrescribedInvestigation.update(
          {
            status: investigation.testStatus,
            result_id: results.find(
              ({ prescribed_investigation_id }) =>
                prescribed_investigation_id === investigation.prescribed_investigation_id
            )?.id,
          },
          { where: { id: investigation.prescribed_investigation_id }, transaction: t }
        )
      )
    );
    await InvestigationPrescription.update(
      { status: InvestigationStatus.RESULT_ADDED },
      { where: { id: data[0].investigation_prescription_id } }
    );
    return testResults;
  });
};

export const getInvestigationsApprovals = async ({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  start = null,
  end = null,
}) => {
  const { limit, offset } = calcLimitAndOffset(+currentPage, +pageLimit);
  const query = {
    status: InvestigationStatus.RESULT_ADDED,
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
        attributes: ['firstname', 'lastname', 'fullname', 'hospital_id'],
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

export const approveInvestigationResults = async (investigationResultId: number) => {
  return sequelizeConnection.transaction(async t => {
    await InvestigationPrescription.update(
      { status: InvestigationStatus.COMPLETED },
      { where: { id: investigationResultId }, transaction: t }
    );
    await InvestigationResult.update(
      { status: ResultStatus.ACCEPTED },
      { where: { investigation_prescription_id: investigationResultId }, transaction: t }
    );
    await PrescribedInvestigation.update(
      { status: InvestigationStatus.APPROVED },
      { where: { investigation_prescription_id: investigationResultId }, transaction: t }
    );
    return InvestigationPrescription.findByPk(investigationResultId, { attributes: ['status'] });
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
    status: InvestigationStatus.COMPLETED,
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
        attributes: ['firstname', 'lastname', 'fullname', 'hospital_id'],
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
  return await InvestigationPrescription.findOne({
    where: { id: investigationPrescriptionId, status: InvestigationStatus.COMPLETED },
    attributes: [],
    include: [
      {
        model: Patient,
        attributes: ['firstname', 'lastname', 'hospital_id', 'gender', 'id'],
      },
      {
        model: InvestigationResult,
        attributes: ['result', 'prescribed_investigation_id', 'status'],
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
};
