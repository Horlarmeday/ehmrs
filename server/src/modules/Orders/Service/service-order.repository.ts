import { PrescribedService, Patient, ClinicalBill } from '../../../database/models';
import { PrescribeServiceBody } from './types/service-order.types';
import { WhereOptions } from 'sequelize';
import { Service, Staff } from '../../../database/models';
import { staffAttributes } from '../../Antenatal/antenatal.repository';
import { StatusCodes } from '../../../core/helpers/helper';
import { BadException } from '../../../common/util/api-error';
import { ERROR_UPDATING_SERVICE } from './messages/response-messages';
import { VisitBillingHelper } from '../../Accounting/visitBilling.helper';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';

/**
 * prescribe multiple services for patient
 * @param data
 * @returns {object} prescribed service data
 */
export const orderBulkService = async data => {
  const services = await PrescribedService.bulkCreate(data);

  // 🆕 NEW: Auto-create bills for each prescribed service
  try {
    for (const service of services) {
      // Get patient and insurance for billing calculation
      const [patient, patientInsurance] = await Promise.all([
        Patient.findByPk(service.patient_id),
        getPatientInsuranceQuery({
          patient_id: service.patient_id,
          is_default: true,
        }),
      ]);

      const originalService = await Service.findByPk(service.service_id);

      if (patient) {
        // Add this prescription to the visit bill
        await VisitBillingHelper.addPrescribedServiceToBill(
          service.visit_id,
          service,
          service.requester,
          patient,
          originalService,
          patientInsurance
        );
      }
    }
  } catch (billingError) {
    // Log billing error but don't fail the prescription
    console.error('Billing creation failed for services:', billingError);
    // You might want to add proper logging here
  }

  return services;
};

/**
 * prescribe a service for patient
 * @param data
 * @returns {Promise<PrescribedService>} prescribed service data
 */
export const prescribeService = async (data: PrescribeServiceBody): Promise<PrescribedService> => {
  const {
    service_id,
    requester,
    price,
    patient_id,
    visit_id,
    service_type,
    ante_natal_id,
    surgery_id,
  } = data || {};

  const prescribedService = await PrescribedService.create({
    service_id,
    service_type,
    requester,
    price,
    patient_id,
    date_requested: Date.now(),
    visit_id,
    surgery_id,
    ante_natal_id,
  });

  // 🆕 NEW: Auto-create bill for this prescription
  try {
    // Get patient and insurance for billing calculation
    const [patient, patientInsurance] = await Promise.all([
      Patient.findByPk(patient_id),
      getPatientInsuranceQuery({
        patient_id,
        is_default: true,
      }),
    ]);
    const originalService = await Service.findByPk(service_id);
    if (patient) {
      // Add this prescription to the visit bill
      await VisitBillingHelper.addPrescribedServiceToBill(
        visit_id,
        prescribedService,
        requester,
        patient,
        originalService,
        patientInsurance
      );
    }
  } catch (billingError) {
    // Log billing error but don't fail the prescription
    console.error('Billing creation failed for service:', billingError);
    // You might want to add proper logging here
  }

  return prescribedService;
};

/**
 * update prescribed service
 * @param data
 */
export const updatePrescribedService = async (data: Partial<PrescribedService>) => {
  try {
    await PrescribedService.update({ ...data }, { where: { id: data.id } });
  } catch (e) {
    throw new BadException('Error', StatusCodes.SERVER_ERROR, ERROR_UPDATING_SERVICE);
  }
  return getOnePrescribedService({ id: data.id });
};

/**
 * get all prescribed services
 * @param query
 * @returns {Promise<PrescribedService[]>} prescribed services data
 */
export const getPrescriptionServices = async (
  query: WhereOptions<PrescribedService>
): Promise<PrescribedService[]> => {
  return await PrescribedService.findAll({
    where: { ...query },
    include: [
      { model: Service, attributes: ['name', 'type'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
    ],
  });
};

/**
 * get prescribed services
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getPrescribedServices = ({ currentPage = 1, pageLimit = 10, filter = null }) => {
  return PrescribedService.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_requested', 'DESC']],
    where: {
      ...(filter && JSON.parse(filter)),
    },
    include: [
      {
        model: Service,
        attributes: ['name', 'type'],
      },
      {
        model: Staff,
        as: 'examiner',
        attributes: staffAttributes,
      },
      {
        model: Staff,
        as: 'nhis_service_processor',
        attributes: staffAttributes,
      },
    ],
  });
};

/**
 * get one prescribed service
 * @param query
 * @returns {Promise<PrescribedService>} prescribed service data
 */
export const getOnePrescribedService = async (
  query: WhereOptions<PrescribedService>
): Promise<PrescribedService> => {
  return await PrescribedService.findOne({
    where: { ...query },
    include: [
      { model: Service, attributes: ['name', 'type'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: Staff, as: 'nhis_service_processor', attributes: staffAttributes },
    ],
  });
};

/**
 * delete prescribed service
 * @returns {number} prescribed service data
 * @param serviceId
 */
export const deleteService = async (serviceId: number) => {
  // Get the service before deletion to get visit_id
  const service = await PrescribedService.findByPk(serviceId);
  if (!service) return 0;

  // Find the bill for this visit
  const bill = await ClinicalBill.findOne({
    where: { visit_id: service.visit_id },
  });

  // Delete the prescription
  const deletedCount = await PrescribedService.destroy({ where: { id: serviceId } });

  if (deletedCount > 0 && bill) {
    // Clean up billing
    try {
      await VisitBillingHelper.removePrescribedServiceFromBill(serviceId, bill.id);
    } catch (billingError) {
      console.error('Failed to remove prescribed service from billing:', billingError);
    }
  }

  return deletedCount;
};
