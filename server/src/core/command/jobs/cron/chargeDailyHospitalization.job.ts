import { logger, taggedMessaged } from '../../../helpers/logger';
import { Admission } from '../../../../database/models';
import { DischargeStatus } from '../../../../database/models/admission';
import dayjs from 'dayjs';
import { processTasksExecution } from '../../../helpers/tasksProcessor';
import { getWardWithService } from '../../../../modules/AdminSettings/admin.repository';
import { getPatientById } from '../../../../modules/Patient/patient.repository';
import { getPatientInsuranceQuery } from '../../../../modules/Insurance/insurance.repository';
import { chargePatientForDay } from '../../../../modules/Admission/admission.repository';
import { EXCLUDED_INSURANCE } from '../../../../core/helpers/helper';

const admissionHandler = async (admission: Admission) => {
  const message = taggedMessaged('chargeDailyHospitalization');

  try {
    // Get ward with service
    const ward = await getWardWithService(admission.ward_id);
    if (!ward || !ward.service) {
      logger.warn(
        message(`Ward ${admission.ward_id} or service not found for admission ${admission.id}`)
      );
      return;
    }

    // Get patient and insurance to check exclusion criteria
    const [patient, insurance] = await Promise.all([
      getPatientById(admission.patient_id),
      getPatientInsuranceQuery({ patient_id: admission.patient_id, is_default: true }),
    ]);

    // Calculate date range to charge first
    const lastChargedDate = admission?.last_charged_date
      ? dayjs(admission.last_charged_date).format('YYYY-MM-DD')
      : null;
    const endDate = dayjs()
      .subtract(1, 'day')
      .format('YYYY-MM-DD');

    // Apply same exclusion logic as admitPatient
    if (
      patient.has_insurance &&
      EXCLUDED_INSURANCE.includes(insurance?.insurance?.name) &&
      patient.admitted_days_in_year <= 21
    ) {
      // Patient has excluded insurance and hasn't exceeded 21 days - skip charging
      // Update last_charged_date to endDate to avoid checking these dates again
      await admission.update({ last_charged_date: endDate });
      logger.notice(message(`Skipping charge for admission ${admission.id} - excluded insurance`));
      return;
    }

    // If no last_charged_date, use admission date (shouldn't happen, but handle gracefully)
    const startDate = lastChargedDate
      ? dayjs(lastChargedDate)
          .add(1, 'day')
          .format('YYYY-MM-DD')
      : dayjs(admission.date_admitted)
          .add(1, 'day')
          .format('YYYY-MM-DD');

    // If startDate is after endDate, nothing to charge
    if (dayjs(startDate).isAfter(endDate)) {
      logger.notice(message(`No days to charge for admission ${admission.id}`));
      return;
    }

    // Charge for each day from startDate to endDate (inclusive)
    let lastCharged = lastChargedDate || dayjs(admission.date_admitted).format('YYYY-MM-DD');
    let chargedCount = 0;

    let currentDate = dayjs(startDate);
    const endDateObj = dayjs(endDate);

    while (!currentDate.isAfter(endDateObj)) {
      const dateToCharge = currentDate.format('YYYY-MM-DD');

      // Use system user ID (1) as requester for automated charges
      // In production, you might want to use a specific system user
      const requester = 1;

      const charged = await chargePatientForDay(admission, ward.service, dateToCharge, requester);

      if (charged) {
        chargedCount++;
        lastCharged = dateToCharge;
        logger.notice(message(`Charged admission ${admission.id} for date ${dateToCharge}`));
      }

      currentDate = currentDate.add(1, 'day');
    }

    // Update last_charged_date to the last date we attempted to charge
    if (chargedCount > 0 || dayjs(startDate).isAfter(endDate)) {
      await admission.update({ last_charged_date: lastCharged });
    }

    if (chargedCount > 0) {
      logger.notice(message(`Charged ${chargedCount} day(s) for admission ${admission.id}`));
    }
  } catch (error) {
    logger.error(message(`Error charging admission ${admission.id}: ${error.message}`), error);
    // Don't throw - continue with other admissions
  }
};

export const chargeDailyHospitalization = async () => {
  const message = taggedMessaged('ChargeDailyHospitalization');

  try {
    // Find all admissions that are currently on admission
    const admissions = await Admission.findAll({
      where: {
        discharge_status: DischargeStatus.ON_ADMISSION,
      },
    });

    if (admissions?.length) {
      await processTasksExecution({
        tasks: admissions,
        message,
        concurrency: 10,
        handler: admissionHandler,
      });
      logger.notice(message(`Processed ${admissions.length} admission(s)`));
      return;
    }

    logger.notice(message('No admissions to charge'));
  } catch (e) {
    logger.error(message('Error occurred'), e);
  }
};
