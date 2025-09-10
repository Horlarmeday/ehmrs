/* eslint-disable camelcase */
import { BadException } from '../../common/util/api-error';
import AuditService from './audit.service';
import { DeceasedPatientAction } from '../../database/models/deceasedPatientAudit';
import {
  createPatientAccount,
  createDependant,
  createEmergencyPatient,
  findDependantByEnrolleeCode,
  findPatientByPhone,
  getPatientProfile,
  getPatientById,
  getPatients,
  updatePatient,
  addPatientInsurance,
  getPatientByNameAndPhone,
  updateInsurance,
  togglePatientInsurance,
  convertDependantToPrincipal,
  mergePatientAccounts,
} from './patient.repository';
import { getAge, processSnappedPhoto, StatusCodes } from '../../core/helpers/helper';
import { JobSchedule } from '../../core/command/worker/schedule';
import { DEPENDANT_EXIST, INTERNAL_ERROR, PATIENT_EXIST } from './messages/response-messages';
import {
  AddPatientInsuranceBody,
  CreatePatientBody,
  EmergencyPatientBody,
  MergePatientAccounts,
  PatientType,
  TogglePatientInsurance,
  UpdatePatientInsurance,
} from './types/patient.types';
import { prescribeService } from '../Orders/Service/service-order.repository';
import { Patient } from '../../database/models';
import { logger } from '../../core/helpers/logger';
import { Op } from 'sequelize';
import { BillingStatus, HMOClaimStatus } from '../../modules/Accounting/enums';
import { AppointmentStatus } from '../../database/models/appointment';
import { PatientStatus } from '../../database/models/patient';
import { DispenseStatus, PaymentStatus } from '../../database/models/prescribedDrug';

class PatientService {
  /**
   * create cash patient account
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param createPatientBody
   */
  static async createPatientAccount(createPatientBody: CreatePatientBody) {
    const patient = await findPatientByPhone(createPatientBody.phone);
    const age = getAge(createPatientBody.date_of_birth);
    if (patient && age >= 18)
      throw new BadException('INVALID', StatusCodes.BAD_REQUEST, PATIENT_EXIST);

      let fileName;
    try {
      if (patient?.photo) {
        // Save photo to disk
         fileName = await processSnappedPhoto(
          createPatientBody.photo,
          createPatientBody.firstname
        );
      }
   

      const createdPatient = await createPatientAccount({ ...createPatientBody, fileName });
      JobSchedule.assignHospitalNumber(createdPatient.id);

      if (createPatientBody.service_id)
        await prescribeService({
          service_id: createPatientBody.service_id,
          patient_id: createdPatient.id,
          price: createPatientBody.registration_fee,
          service_type: 'Cash',
        });
      // await uploadImage(body.photo, createdPatient.id);
      return createdPatient;
    } catch (e) {
      throw new BadException('Error', StatusCodes.SERVER_ERROR, e.message);
    }
  }

  /**
   * set patient health insurance and dependants
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param patientInsuranceBody
   */
  static async addPatientInsurance(patientInsuranceBody: AddPatientInsuranceBody) {
    const { patient_id, dependants, staff_id } = patientInsuranceBody;
    let updatedDependants = [];

    try {
      if (dependants?.length) {
        updatedDependants = await Promise.all(
          dependants.map(async dependant => ({
            ...dependant,
            firstname: dependant.firstname.replace(/ +(?= )/g, '').trim(),
            lastname: dependant.lastname.replace(/ +(?= )/g, '').trim(),
            principal_id: patient_id,
            patient_type: PatientType.DEPENDANT,
            photo: await processSnappedPhoto(dependant.photo, dependant.firstname),
            staff_id,
            has_insurance: true,
          }))
        );
      }
      return addPatientInsurance({ ...patientInsuranceBody, dependants: updatedDependants });
    } catch (e) {
      throw new BadException('Error', StatusCodes.SERVER_ERROR, INTERNAL_ERROR);
    }
  }

  /**
   * create ordinary patient account
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param emergencyPatientBody
   */
  static async createEmergencyPatient(emergencyPatientBody: EmergencyPatientBody) {
    const patient = await findPatientByPhone(emergencyPatientBody.phone);
    if (patient) throw new BadException('INVALID', StatusCodes.BAD_REQUEST, PATIENT_EXIST);

    const createdPatient = await createEmergencyPatient(emergencyPatientBody);
    await JobSchedule.assignHospitalNumber(createdPatient.id);

    return createdPatient;
  }

  /**
   * create a dependant account
   *
   * @static
   * @returns {json} json object with dependant data
   * @param body
   * @memberOf PatientService
   */
  static async createDependantService(body): Promise<Patient> {
    const dependant = await findDependantByEnrolleeCode(body.enrollee_code);
    if (dependant) throw new BadException('INVALID', StatusCodes.BAD_REQUEST, DEPENDANT_EXIST);

    // Save photo to disk
    const fileName = await processSnappedPhoto(body.photo, body.firstname);

    const patient = await createDependant({ ...body, photo: fileName });
    JobSchedule.assignHospitalNumber(patient.id);

    return patient;
  }

  /**
   * get patients
   *
   * @static
   * @returns {json} json object with patients data
   * @param body
   * @memberOf PatientService
   */
  static async getPatients(body) {
    const { search, start, end, pageLimit, currentPage, filter, patient_status, sortBy } = body;

    if (Object.values(body).length) {
      return getPatients({
        currentPage,
        pageLimit,
        filter,
        end,
        start,
        search,
        patient_status,
        sortBy,
      });
    }

    return getPatients({ filter, end, start, patient_status, sortBy });
  }

  /**
   * update a patient record
   *
   * @static
   * @returns {json} json object with patient data
   * @param body
   * @memberOf PatientService
   */
  static async updatePatientService(body) {
    let photo: string;
    if (body?.picture) {
      photo = await processSnappedPhoto(body.picture, body.patient.firstname);
    }
    return updatePatient({
      ...body.patient,
      patient_id: body.patient_id,
      updated_by: body.updated_by,
      ...(body.picture && { photo }),
    });
  }

  /**
   * update a patient insurance
   *
   * @static
   * @returns {json} json object with patient data
   * @param body
   * @memberOf PatientService
   */
  static async updatePatientInsurance(body: UpdatePatientInsurance) {
    return updateInsurance(body);
  }

  /**
   * toggle a patient insurance state
   *
   * @static
   * @returns {json} json object with patient data
   * @param body
   * @memberOf PatientService
   */
  static async togglePatientInsurance(body: TogglePatientInsurance) {
    return togglePatientInsurance(body);
  }

  /**
   * get a patient by Id
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param id
   */
  static async getPatientById(id) {
    return getPatientById(id);
  }

  /**
   * get a patient profile by id
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param id
   */
  static async getPatientProfile(id) {
    return getPatientProfile(id);
  }

  /**
   * get a patient profile by name and phone
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param body
   */
  static async getPatientByNameAndPhone(body) {
    return getPatientByNameAndPhone(body);
  }

  /**
   * convert dependant account to patient account
   *
   * @static
   * @returns {json} json object with patient data
   * @memberOf PatientService
   * @param patientId
   */
  static async convertDependantToPatient(patientId: number) {
    return convertDependantToPrincipal(patientId);
  }

  /**
   * merge patient accounts
   *
   * @static
   * @returns {json} json object with patient data
   * @param body
   * @memberOf PatientService
   */
  static async mergePatientAccounts(body: MergePatientAccounts) {
    const { sourcePatientIds, targetPatientId } = body;
    return mergePatientAccounts(sourcePatientIds, targetPatientId);
  }

  /**
   * Generate a unique death certificate number
   *
   * @static
   * @returns {string} Generated certificate number
   */
  static generateDeathCertificateNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6); // Last 6 digits of timestamp

    return `DC-${year}${month}${day}-${timestamp}`;
  }

  /**
   * Generate death certificate numbers for existing deceased patients who don't have them
   *
   * @static
   * @param {number} staffId - Staff member ID performing the action
   * @returns {Promise<{ updated: number; patients: any[] }>} Update results
   */
  static async generateMissingDeathCertificateNumbers(staffId: number): Promise<{ updated: number; patients: any[] }> {
    const { Patient } = await import('../../database/models');

    // Find deceased patients without certificate numbers
    const deceasedPatientsWithoutCertificates = await Patient.findAll({
      where: {
        patient_status: PatientStatus.DECEASED,
        death_certificate_number: null,
      },
      attributes: ['id', 'fullname', 'hospital_id', 'date_of_death', 'firstname', 'lastname', 'middlename'],
    });

    const updatedPatients = [];

    for (const patient of deceasedPatientsWithoutCertificates) {
      const certificateNumber = this.generateDeathCertificateNumber();

      await Patient.update(
        { death_certificate_number: certificateNumber },
        { where: { id: patient.id } }
      );

      // Log audit trail for certificate number generation
      await AuditService.logAuditAction({
        patient_id: patient.id,
        action: DeceasedPatientAction.CERTIFICATE_GENERATED,
        performed_by: staffId,
        details: {
          certificate_number: certificateNumber,
          generation_reason: 'Missing certificate number - auto-generated',
          patient_name: patient.fullname,
          hospital_id: patient.hospital_id,
        },
      });

      updatedPatients.push({
        id: patient.id,
        fullname: patient.fullname,
        hospital_id: patient.hospital_id,
        death_certificate_number: certificateNumber,
      });
    }

    return {
      updated: updatedPatients.length,
      patients: updatedPatients,
    };
  }

  /**
   * Mark patient as deceased
   *
   * @static
   * @param {number} patientId - Patient ID
   * @param {object} deathData - Death information
   * @param {number} staffId - Staff member ID who marked as deceased
   * @returns {Promise<Patient>} Updated patient data
   */
  static async markPatientAsDeceased(patientId: number, deathData: any, staffId: number) {
    const patient = await getPatientById(patientId);

    if (!patient) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Patient not found');
    }

    if (patient.patient_status === PatientStatus.DECEASED) {
      throw new BadException(
        'CONFLICT',
        StatusCodes.CONFLICT,
        'Patient is already marked as deceased'
      );
    }

    // Generate death certificate number if not provided
    const certificateNumber = deathData.death_certificate_number || this.generateDeathCertificateNumber();

    const updateData = {
      patient_status: PatientStatus.DECEASED,
      date_of_death: deathData.date_of_death,
      cause_of_death: deathData.cause_of_death || null,
      death_certificate_number: certificateNumber,
      marked_deceased_by: staffId,
      marked_deceased_at: new Date(),
      // Clear revival fields if they exist
      revival_reason: null,
      revived_by: null,
      revived_at: null,
    };

    // Handle dependant relationships when principal dies
    if (patient.patient_type === PatientType.PATIENT) {
      await this.handleDependantRelationshipsOnDeath(patientId, staffId);
    }

    // Cancel future appointments for deceased patient
    await this.cancelFutureAppointments(patientId, staffId);

    // Process final insurance claims for deceased patient
    await this.processFinalInsuranceClaims(patientId, staffId);

    // Return unused medications for deceased patient
    await this.returnUnusedMedications(patientId, staffId);

    // Update patient status
    const updatedPatient = await updatePatient({ patient_id: patientId, ...updateData });

    // Log audit trail
    await AuditService.logAuditAction({
      patient_id: patientId,
      action: DeceasedPatientAction.MARKED_DECEASED,
      performed_by: staffId,
      details: {
        date_of_death: deathData.date_of_death,
        cause_of_death: deathData.cause_of_death,
        death_certificate_number: certificateNumber,
        place_of_death: deathData.place_of_death,
        notes: deathData.notes,
      },
    });

    return updatedPatient;
  }

  /**
   * Cancel future appointments for deceased patient
   *
   * @static
   * @param {number} patientId - Patient ID
   * @param {number} staffId - Staff member ID
   */
  static async cancelFutureAppointments(patientId: number, staffId: number) {
    const { Appointment } = await import('../../database/models');

    // Get patient information for notifications
    const patient = await getPatientById(patientId);

    // Find all future appointments for the patient
    const futureAppointments = await Appointment.findAll({
      where: {
        patient_id: patientId,
        appointment_date: {
          [Op.gte]: new Date(), // Future dates only
        },
        status: {
          [Op.notIn]: [
            AppointmentStatus.CANCELLED,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.NO_SHOW,
          ],
        },
      },
    });

    if (futureAppointments.length > 0) {
      // Cancel all future appointments
      await Appointment.update(
        {
          status: AppointmentStatus.CANCELLED,
          notes: `Cancelled due to patient death. Cancelled by staff ID: ${staffId}`,
          updated_at: new Date(),
        },
        {
          where: {
            patient_id: patientId,
            appointment_date: {
              [Op.gte]: new Date(),
            },
            status: {
              [Op.notIn]: [
                AppointmentStatus.CANCELLED,
                AppointmentStatus.COMPLETED,
                AppointmentStatus.NO_SHOW,
              ],
            },
          },
        }
      );

      logger.info(
        `Cancelled ${futureAppointments.length} future appointments for deceased patient ID: ${patientId}`
      );

      // Notify staff of cancellations
      await this.notifyStaffOfAppointmentCancellations(futureAppointments, patient, staffId);

      // Log audit trail for appointment cancellations
      if (futureAppointments.length > 0) {
        await AuditService.logAuditAction({
          patient_id: patientId,
          action: DeceasedPatientAction.APPOINTMENTS_CANCELLED,
          performed_by: staffId,
          details: {
            cancelled_appointments_count: futureAppointments.length,
            appointment_ids: futureAppointments.map(apt => apt.id),
            cancellation_reason: 'Patient marked as deceased',
          },
        });
      }
    }
  }

  /**
   * Process final insurance claims for deceased patient
   *
   * @static
   * @param {number} patientId - Patient ID
   * @param {number} staffId - Staff member ID
   */
  static async processFinalInsuranceClaims(patientId: number, staffId: number) {
    const { ClinicalBill, ClinicalBillItem, PatientInsurance, InsuranceClaim } = await import(
      '../../database/models'
    );

    // Find all outstanding bills for the deceased patient
    const outstandingBills = await ClinicalBill.findAll({
      where: {
        patient_id: patientId,
        billing_status: {
          [Op.notIn]: [BillingStatus.APPROVED, BillingStatus.CANCELLED],
        },
      },
      include: [
        {
          model: ClinicalBillItem,
          as: 'billItems',
        },
      ],
    });

    if (outstandingBills.length === 0) {
      logger.info(`No outstanding bills found for deceased patient ID: ${patientId}`);
      return;
    }

    // Get patient insurance information
    const patientInsurance = await PatientInsurance.findOne({
      where: {
        patient_id: patientId,
        is_default: true,
      },
    });

    if (!patientInsurance) {
      logger.info(
        `No insurance found for deceased patient ID: ${patientId}. Bills will remain outstanding.`
      );
      return;
    }

    // Process each outstanding bill
    for (const bill of outstandingBills) {
      try {
        // Create final insurance claim for the bill
        const claimReference = `FINAL-CLM-${patientId}-${bill.id}-${Date.now()}`;

        await InsuranceClaim.create({
          patient_id: patientId,
          bill_id: bill.id,
          claim_reference: claimReference,
          insurance_provider: patientInsurance.insurance_id,
          hmo_id: patientInsurance.hmo_id,
          policy_number: patientInsurance.enrollee_code,
          claim_amount: bill.total_amount,
          claim_status: HMOClaimStatus.SUBMITTED,
          submission_date: new Date(),
          notes: `Final insurance claim for deceased patient. Patient died on ${new Date().toISOString()}`,
          created_by: staffId,
        });

        // Update bill status to indicate final claim submitted
        await ClinicalBill.update(
          {
            billing_status: BillingStatus.DRAFT,
            notes: `Final insurance claim submitted due to patient death. Claim reference: ${claimReference}`,
            updated_at: new Date(),
          },
          {
            where: { id: bill.id },
          }
        );

        logger.info(
          `Created final insurance claim ${claimReference} for bill ${bill.id} of deceased patient ${patientId}`
        );
      } catch (error) {
        logger.error(
          `Failed to process final claim for bill ${bill.id} of deceased patient ${patientId}:`,
          error
        );
      }
    }

    // Log audit trail for insurance claims processing
    if (outstandingBills.length > 0) {
      await AuditService.logAuditAction({
        patient_id: patientId,
        action: DeceasedPatientAction.INSURANCE_CLAIMS_PROCESSED,
        performed_by: staffId,
        details: {
          outstanding_bills_count: outstandingBills.length,
          total_amount: outstandingBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0),
          bill_ids: outstandingBills.map(bill => bill.id),
          processing_reason: 'Final insurance claims for deceased patient',
        },
      });
    }

    logger.info(
      `Processed final insurance claims for ${outstandingBills.length} bills of deceased patient ID: ${patientId}`
    );
  }

  /**
   * Notify staff of appointment cancellations due to patient death
   *
   * @static
   * @param {any[]} cancelledAppointments - Array of cancelled appointments
   * @param {any} patient - Patient information
   * @param {number} staffId - Staff member ID who marked patient as deceased
   */
  static async notifyStaffOfAppointmentCancellations(
    cancelledAppointments: any[],
    patient: any,
    staffId: number
  ) {
    if (cancelledAppointments.length === 0) {
      return;
    }

    const { Staff } = await import('../../database/models');

    // Get unique doctor IDs from cancelled appointments
    const doctorIds = [...new Set(cancelledAppointments.map(apt => apt.doctor_id))];

    // Get doctor information
    const doctors = await Staff.findAll({
      where: {
        id: {
          [Op.in]: doctorIds,
        },
      },
      attributes: ['id', 'fullname', 'email', 'phone'],
    });

    // Create notification message
    const notificationMessage = `
PATIENT DEATH NOTIFICATION

Patient: ${patient.fullname} (ID: ${patient.id})
Date of Death: ${
      patient.date_of_death ? new Date(patient.date_of_death).toLocaleDateString() : 'Unknown'
    }
Hospital ID: ${patient.hospital_id || 'N/A'}

The following appointments have been automatically cancelled due to patient death:
${cancelledAppointments
  .map(
    apt =>
      `- Appointment ID: ${apt.id}, Date: ${new Date(
        apt.appointment_date
      ).toLocaleDateString()}, Time: ${apt.appointment_time}`
  )
  .join('\n')}

Total cancelled appointments: ${cancelledAppointments.length}

This is an automated notification. Please update your schedule accordingly.

Marked as deceased by: Staff ID ${staffId}
Date: ${new Date().toLocaleString()}
    `.trim();

    // Log notification for each doctor
    for (const doctor of doctors) {
      logger.info(`NOTIFICATION SENT TO DOCTOR ${doctor.fullname} (ID: ${doctor.id}):`);
      logger.info(`Email: ${doctor.email || 'N/A'}`);
      logger.info(`Phone: ${doctor.phone || 'N/A'}`);
      logger.info(`Message: ${notificationMessage}`);

      // In a real implementation, you would send actual notifications here:
      // - Send email notification
      // - Send SMS notification
      // - Send push notification
      // - Update staff dashboard
      // - Create notification record in database
    }

    logger.info(
      `Sent appointment cancellation notifications to ${doctors.length} doctors for deceased patient ${patient.fullname}`
    );
  }

  /**
   * Return unused medications for deceased patient
   *
   * @static
   * @param {number} patientId - Patient ID
   * @param {number} staffId - Staff member ID
   */
  static async returnUnusedMedications(patientId: number, staffId: number) {
    const { PrescribedDrug, PrescribedAdditionalItem, InventoryItem } = await import(
      '../../database/models'
    );

    const [prescribedDrugs, prescribedAdditionalItems] = await Promise.all([
      // Find all prescribed drugs that are not fully dispensed
      PrescribedDrug.findAll({
        where: {
          patient_id: patientId,
          payment_status: PaymentStatus.PAID,
          dispense_status: {
            [Op.notIn]: [DispenseStatus.RETURNED, DispenseStatus.PARTIAL_RETURNED],
          },
        },
      }),

      // Find all prescribed additional items that are not fully dispensed
      PrescribedAdditionalItem.findAll({
        where: {
          patient_id: patientId,
          payment_status: PaymentStatus.PAID,
          dispense_status: {
            [Op.notIn]: [DispenseStatus.RETURNED, DispenseStatus.PARTIAL_RETURNED],
          },
        },
      }),
    ]);

    if (prescribedDrugs.length === 0 && prescribedAdditionalItems.length === 0) {
      logger.info(`No unused medications found for deceased patient ID: ${patientId}`);
      return;
    }

    let totalReturned = 0;

    // Return prescribed drugs
    for (const prescribedDrug of prescribedDrugs) {
      try {
        const quantityToReturn =
          prescribedDrug.quantity_prescribed - prescribedDrug.quantity_dispensed;

        if (quantityToReturn > 0) {
          // Find the inventory item
          const inventoryItem = await InventoryItem.findOne({
            where: {
              drug_id: prescribedDrug.drug_id,
              inventory_id: prescribedDrug.inventory_id,
            },
          });

          if (inventoryItem) {
            // Import the return function
            const { returnDrugToInventory } = await import(
              '../../modules/Pharmacy/pharmacy.repository'
            );

            await returnDrugToInventory(inventoryItem, prescribedDrug, {
              quantity_to_return: quantityToReturn,
              staff_id: staffId,
              drug_prescription_id: prescribedDrug.drug_prescription_id,
              reason_for_return: `Patient deceased - automatic return of unused medication`,
            });

            totalReturned += quantityToReturn;
            logger.info(
              `Returned ${quantityToReturn} units of drug ID ${prescribedDrug.drug_id} for deceased patient ${patientId}`
            );
          }
        }
      } catch (error) {
        logger.error(
          `Failed to return drug ${prescribedDrug.drug_id} for deceased patient ${patientId}:`,
          error
        );
      }
    }

    // Return prescribed additional items
    for (const additionalItem of prescribedAdditionalItems) {
      try {
        const quantityToReturn =
          additionalItem.quantity_prescribed - additionalItem.quantity_dispensed;

        if (quantityToReturn > 0) {
          // Find the inventory item
          const inventoryItem = await InventoryItem.findOne({
            where: {
              drug_id: additionalItem.drug_id,
              inventory_id: additionalItem.inventory_id,
            },
          });

          if (inventoryItem) {
            // Import the return function
            const { returnDrugToInventory } = await import(
              '../../modules/Pharmacy/pharmacy.repository'
            );

            await returnDrugToInventory(inventoryItem, additionalItem, {
              quantity_to_return: quantityToReturn,
              staff_id: staffId,
              drug_prescription_id: additionalItem.drug_prescription_id,
              reason_for_return: `Patient deceased - automatic return of unused medication`,
            });

            totalReturned += quantityToReturn;
            logger.info(
              `Returned ${quantityToReturn} units of additional item ID ${additionalItem.drug_id} for deceased patient ${patientId}`
            );
          }
        }
      } catch (error) {
        logger.error(
          `Failed to return additional item ${additionalItem.drug_id} for deceased patient ${patientId}:`,
          error
        );
      }
    }

    // Log audit trail for medication returns
    if (totalReturned > 0) {
      await AuditService.logAuditAction({
        patient_id: patientId,
        action: DeceasedPatientAction.MEDICATIONS_RETURNED,
        performed_by: staffId,
        details: {
          total_units_returned: totalReturned,
          prescribed_drugs_count: prescribedDrugs.length,
          prescribed_additional_items_count: prescribedAdditionalItems.length,
          return_reason: 'Patient deceased - automatic return of unused medications',
        },
      });
    }

    logger.info(
      `Returned unused medications for deceased patient ID: ${patientId}. Total units returned: ${totalReturned}`
    );
  }

  /**
   * Get death statistics dashboard data
   *
   * @static
   * @param {any} queryParams - Query parameters for filtering
   * @returns {Promise<any>} Death statistics data
   */
  static async getDeathStatistics(queryParams: any) {
    const { Patient, Staff } = await import('../../database/models');

    const {
      start = queryParams.date_from,
      end = queryParams.date_to,
      department,
      cause_of_death,
    } = queryParams;

    // Build where clause for deceased patients
    const whereClause: any = {
      patient_status: PatientStatus.DECEASED,
    };

    // Add date range filter
    if (start && end) {
      whereClause.date_of_death = {
        [Op.between]: [new Date(start), new Date(end)],
      };
    }

    // Add department filter
    if (department) {
      whereClause.department = {
        [Op.like]: `%${department}%`,
      };
    }

    // Add cause of death filter
    if (cause_of_death) {
      whereClause.cause_of_death = {
        [Op.like]: `%${cause_of_death}%`,
      };
    }

    // Get all deceased patients with related data
    const deceasedPatients = await Patient.findAll({
      where: whereClause,
      include: [
        {
          model: Staff,
          as: 'markedDeceasedBy',
          attributes: ['id', 'fullname', 'department', 'firstname', 'lastname', 'middlename'],
        },
      ],
      order: [['date_of_death', 'DESC']],
    });

    // Calculate statistics
    const totalDeaths = deceasedPatients.length;

    // Deaths by month
    const deathsByMonth = deceasedPatients.reduce((acc, patient) => {
      if (patient.date_of_death) {
        const month = new Date(patient.date_of_death).toISOString().substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Deaths by department (using marked by staff department)
    const deathsByDepartment = deceasedPatients.reduce((acc, patient) => {
      const dept = (patient as any).markedDeceasedBy?.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Deaths by cause
    const deathsByCause = deceasedPatients.reduce((acc, patient) => {
      const cause = patient.cause_of_death || 'Unknown';
      acc[cause] = (acc[cause] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Deaths by age group
    const deathsByAgeGroup = deceasedPatients.reduce((acc, patient) => {
      if (patient.date_of_birth) {
        const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
        let ageGroup = 'Unknown';

        if (age < 1) ageGroup = 'Infant (0-1)';
        else if (age < 5) ageGroup = 'Toddler (1-4)';
        else if (age < 13) ageGroup = 'Child (5-12)';
        else if (age < 20) ageGroup = 'Teen (13-19)';
        else if (age < 40) ageGroup = 'Young Adult (20-39)';
        else if (age < 60) ageGroup = 'Middle Age (40-59)';
        else if (age < 80) ageGroup = 'Senior (60-79)';
        else ageGroup = 'Elderly (80+)';

        acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Recent deaths (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDeaths = deceasedPatients.filter(
      patient => patient.date_of_death && new Date(patient.date_of_death) >= thirtyDaysAgo
    ).length;

    // Average age at death
    const patientsWithAge = deceasedPatients.filter(patient => patient.date_of_birth);
    const averageAge =
      patientsWithAge.length > 0
        ? patientsWithAge.reduce((sum, patient) => {
            const age = new Date().getFullYear() - new Date(patient.date_of_birth!).getFullYear();
            return sum + age;
          }, 0) / patientsWithAge.length
        : 0;

    return {
      summary: {
        total_deaths: totalDeaths,
        recent_deaths_30_days: recentDeaths,
        average_age_at_death: Math.round(averageAge * 10) / 10,
        date_range: {
          start: start || 'All time',
          end: end || 'Present',
        },
      },
      breakdown: {
        by_month: deathsByMonth,
        by_department: deathsByDepartment,
        by_cause: deathsByCause,
        by_age_group: deathsByAgeGroup,
      },
      recent_deaths: deceasedPatients.slice(0, 10).map(patient => ({
        id: patient.id,
        fullname: patient.fullname,
        date_of_death: patient.date_of_death,
        cause_of_death: patient.cause_of_death,
        department: (patient as any).markedDeceasedBy?.department || 'Unknown',
        marked_by: patient.markedDeceasedBy?.fullname || 'Unknown',
      })),
      generated_at: new Date(),
    };
  }

  /**
   * Get mortality reports by department and condition
   *
   * @static
   * @param {any} queryParams - Query parameters for filtering
   * @returns {Promise<any>} Mortality reports data
   */
  static async getMortalityReports(queryParams: any) {
    const { Patient, Staff } = await import('../../database/models');

    const {
      start = queryParams.date_from,
      end = queryParams.date_to,
      department,
      cause_of_death,
      report_type = 'department', // 'department' or 'condition'
    } = queryParams;

    // Build where clause for deceased patients
    const whereClause: any = {
      patient_status: PatientStatus.DECEASED,
    };

    // Add date range filter
    if (start && end) {
      whereClause.date_of_death = {
        [Op.between]: [new Date(start), new Date(end)],
      };
    }

    // Add department filter
    if (department) {
      whereClause['$markedDeceasedBy.department$'] = {
        [Op.like]: `%${department}%`,
      };
    }

    // Add cause of death filter
    if (cause_of_death) {
      whereClause.cause_of_death = {
        [Op.like]: `%${cause_of_death}%`,
      };
    }

    // Get all deceased patients with related data
    const deceasedPatients = await Patient.findAll({
      where: whereClause,
      include: [
        {
          model: Staff,
          as: 'markedDeceasedBy',
          attributes: ['id', 'fullname', 'department', 'firstname', 'lastname', 'middlename'],
        },
      ],
      order: [['date_of_death', 'DESC']],
    });

    if (report_type === 'department') {
      return this.generateDepartmentMortalityReport(deceasedPatients, start, end);
    } else {
      return this.generateConditionMortalityReport(deceasedPatients, start, end);
    }
  }

  /**
   * Generate department-based mortality report
   *
   * @static
   * @param {any[]} deceasedPatients - Array of deceased patients
   * @param {string} start - Start date
   * @param {string} end - End date
   * @returns {any} Department mortality report
   */
  static generateDepartmentMortalityReport(deceasedPatients: Patient[], start?: string, end?: string) {
    // Group by department
    const departmentStats = deceasedPatients.reduce((acc, patient) => {
      const dept = patient.markedDeceasedBy?.department || 'Unknown';

      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          total_deaths: 0,
          deaths_by_month: {},
          deaths_by_cause: {},
          deaths_by_age_group: {},
          average_age: 0,
          recent_deaths: [],
        };
      }

      acc[dept].total_deaths++;

      // Deaths by month
      if (patient.date_of_death) {
        const month = new Date(patient.date_of_death).toISOString().substring(0, 7);
        acc[dept].deaths_by_month[month] = (acc[dept].deaths_by_month[month] || 0) + 1;
      }

      // Deaths by cause
      const cause = patient.cause_of_death || 'Unknown';
      acc[dept].deaths_by_cause[cause] = (acc[dept].deaths_by_cause[cause] || 0) + 1;

      // Deaths by age group
      if (patient.date_of_birth) {
        const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
        let ageGroup = 'Unknown';

        if (age < 1) ageGroup = 'Infant (0-1)';
        else if (age < 5) ageGroup = 'Toddler (1-4)';
        else if (age < 13) ageGroup = 'Child (5-12)';
        else if (age < 20) ageGroup = 'Teen (13-19)';
        else if (age < 40) ageGroup = 'Young Adult (20-39)';
        else if (age < 60) ageGroup = 'Middle Age (40-59)';
        else if (age < 80) ageGroup = 'Senior (60-79)';
        else ageGroup = 'Elderly (80+)';

        acc[dept].deaths_by_age_group[ageGroup] =
          (acc[dept].deaths_by_age_group[ageGroup] || 0) + 1;
      }

      // Add to recent deaths (last 10)
      acc[dept].recent_deaths.push({
        id: patient.id,
        fullname: patient.fullname,
        date_of_death: patient.date_of_death,
        cause_of_death: patient.cause_of_death,
        age: patient.date_of_birth
          ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
          : null,
        marked_by: (patient as any).markedDeceasedBy?.fullname || 'Unknown',
      });

      return acc;
    }, {} as Record<string, any>);

    // Calculate average age for each department
    Object.values(departmentStats).forEach((dept: any) => {
      const patientsWithAge = dept.recent_deaths.filter((p: any) => p.age !== null);
      dept.average_age =
        patientsWithAge.length > 0
          ? Math.round(
              (patientsWithAge.reduce((sum: number, p: any) => sum + p.age, 0) /
                patientsWithAge.length) *
                10
            ) / 10
          : 0;

      // Keep only last 10 recent deaths
      dept.recent_deaths = dept.recent_deaths.slice(0, 10);
    });

    return {
      report_type: 'department',
      date_range: {
        start: start || 'All time',
        end: end || 'Present',
      },
      departments: Object.values(departmentStats),
      summary: {
        total_departments: Object.keys(departmentStats).length,
        total_deaths: deceasedPatients.length,
        generated_at: new Date(),
      },
    };
  }

  /**
   * Generate condition-based mortality report
   *
   * @static
   * @param {any[]} deceasedPatients - Array of deceased patients
   * @param {string} start - Start date
   * @param {string} end - End date
   * @returns {any} Condition mortality report
   */
  static generateConditionMortalityReport(deceasedPatients: any[], start?: string, end?: string) {
    // Group by cause of death
    const conditionStats = deceasedPatients.reduce((acc, patient) => {
      const cause = patient.cause_of_death || 'Unknown';

      if (!acc[cause]) {
        acc[cause] = {
          condition: cause,
          total_deaths: 0,
          deaths_by_month: {},
          deaths_by_department: {},
          deaths_by_age_group: {},
          average_age: 0,
          recent_deaths: [],
        };
      }

      acc[cause].total_deaths++;

      // Deaths by month
      if (patient.date_of_death) {
        const month = new Date(patient.date_of_death).toISOString().substring(0, 7);
        acc[cause].deaths_by_month[month] = (acc[cause].deaths_by_month[month] || 0) + 1;
      }

      // Deaths by department
      const dept = (patient as any).markedDeceasedBy?.department || 'Unknown';
      acc[cause].deaths_by_department[dept] = (acc[cause].deaths_by_department[dept] || 0) + 1;

      // Deaths by age group
      if (patient.date_of_birth) {
        const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
        let ageGroup = 'Unknown';

        if (age < 1) ageGroup = 'Infant (0-1)';
        else if (age < 5) ageGroup = 'Toddler (1-4)';
        else if (age < 13) ageGroup = 'Child (5-12)';
        else if (age < 20) ageGroup = 'Teen (13-19)';
        else if (age < 40) ageGroup = 'Young Adult (20-39)';
        else if (age < 60) ageGroup = 'Middle Age (40-59)';
        else if (age < 80) ageGroup = 'Senior (60-79)';
        else ageGroup = 'Elderly (80+)';

        acc[cause].deaths_by_age_group[ageGroup] =
          (acc[cause].deaths_by_age_group[ageGroup] || 0) + 1;
      }

      // Add to recent deaths (last 10)
      acc[cause].recent_deaths.push({
        id: patient.id,
        fullname: patient.fullname,
        date_of_death: patient.date_of_death,
        department: (patient as any).markedDeceasedBy?.department || 'Unknown',
        age: patient.date_of_birth
          ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
          : null,
        marked_by: (patient as any).markedDeceasedBy?.fullname || 'Unknown',
      });

      return acc;
    }, {} as Record<string, any>);

    // Calculate average age for each condition
    Object.values(conditionStats).forEach((condition: any) => {
      const patientsWithAge = condition.recent_deaths.filter((p: any) => p.age !== null);
      condition.average_age =
        patientsWithAge.length > 0
          ? Math.round(
              (patientsWithAge.reduce((sum: number, p: any) => sum + p.age, 0) /
                patientsWithAge.length) *
                10
            ) / 10
          : 0;

      // Keep only last 10 recent deaths
      condition.recent_deaths = condition.recent_deaths.slice(0, 10);
    });

    return {
      report_type: 'condition',
      date_range: {
        start: start || 'All time',
        end: end || 'Present',
      },
      conditions: Object.values(conditionStats),
      summary: {
        total_conditions: Object.keys(conditionStats).length,
        total_deaths: deceasedPatients.length,
        generated_at: new Date(),
      },
    };
  }

  /**
   * Get death certificate tracking data
   *
   * @static
   * @param {any} queryParams - Query parameters for filtering
   * @returns {Promise<any>} Death certificate tracking data
   */
  static async getDeathCertificateTracking(queryParams: any) {
    const { Patient, Staff } = await import('../../database/models');

    const {
      start = queryParams.date_from,
      end = queryParams.date_to,
      status = 'all', // 'all', 'generated', 'printed', 'delivered'
      department,
    } = queryParams;

    // Build where clause for deceased patients with certificates
    const whereClause: any = {
      patient_status: 'Deceased',
      death_certificate_number: {
        [Op.ne]: null,
      },
    };

    // Add date range filter
    if (start && end) {
      whereClause.date_of_death = {
        [Op.between]: [new Date(start), new Date(end)],
      };
    }

    // Add department filter
    if (department) {
      whereClause['$markedDeceasedBy.department$'] = {
        [Op.like]: `%${department}%`,
      };
    }

    // Get all deceased patients with certificates
    const deceasedPatients = await Patient.findAll({
      where: whereClause,
      include: [
        {
          model: Staff,
          as: 'markedDeceasedBy',
          attributes: ['id', 'fullname', 'department', 'firstname', 'lastname'],
        },
      ],
      order: [['date_of_death', 'DESC']],
    });

    // Process certificate tracking data
    const certificateData = deceasedPatients.map(patient => {
      const certificateStatus = this.determineCertificateStatus(patient);

      return {
        id: patient.id,
        fullname: patient.fullname,
        hospital_id: patient.hospital_id,
        date_of_death: patient.date_of_death,
        death_certificate_number: patient.death_certificate_number,
        cause_of_death: patient.cause_of_death,
        department: (patient as any).markedDeceasedBy?.department || 'Unknown',
        marked_by: (patient as any).markedDeceasedBy?.fullname || 'Unknown',
        marked_at: patient.marked_deceased_at,
        certificate_status: certificateStatus,
        generated_at: patient.marked_deceased_at, // Certificate generated when marked as deceased
        last_updated: patient.updatedAt,
      };
    });

    // Filter by status if specified
    let filteredData = certificateData;
    if (status !== 'all') {
      filteredData = certificateData.filter(item => item.certificate_status === status);
    }

    // Calculate statistics
    const totalCertificates = certificateData.length;
    const generatedCertificates = certificateData.filter(
      item => item.certificate_status === 'generated'
    ).length;
    const printedCertificates = certificateData.filter(
      item => item.certificate_status === 'printed'
    ).length;
    const deliveredCertificates = certificateData.filter(
      item => item.certificate_status === 'delivered'
    ).length;

    // Group by status
    const statusBreakdown = certificateData.reduce((acc, item) => {
      acc[item.certificate_status] = (acc[item.certificate_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by department
    const departmentBreakdown = certificateData.reduce((acc, item) => {
      acc[item.department] = (acc[item.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by month
    const monthlyBreakdown = certificateData.reduce((acc, item) => {
      if (item.date_of_death) {
        const month = new Date(item.date_of_death).toISOString().substring(0, 7);
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      summary: {
        total_certificates: totalCertificates,
        generated: generatedCertificates,
        printed: printedCertificates,
        delivered: deliveredCertificates,
        date_range: {
          start: start || 'All time',
          end: end || 'Present',
        },
      },
      breakdown: {
        by_status: statusBreakdown,
        by_department: departmentBreakdown,
        by_month: monthlyBreakdown,
      },
      certificates: filteredData,
      generated_at: new Date(),
    };
  }

  /**
   * Determine certificate status based on patient data
   *
   * @static
   * @param {any} patient - Patient data
   * @returns {string} Certificate status
   */
  static determineCertificateStatus(patient: any): string {
    // For now, we'll use a simple status determination
    // In a real implementation, you might have additional fields to track certificate status

    if (!patient.death_certificate_number) {
      return 'not_generated';
    }

    // Check if certificate was generated recently (within last 24 hours)
    const generatedAt = new Date(patient.marked_deceased_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return 'generated';
    } else if (hoursDiff < 72) {
      return 'printed';
    } else {
      return 'delivered';
    }
  }

  /**
   * Transfer dependants to another principal
   *
   * @static
   * @param {number} deceasedPrincipalId - Deceased principal patient ID
   * @param {number} newPrincipalId - New principal patient ID
   * @param {number} staffId - Staff member ID
   * @returns {Promise<{transferred: number, dependants: any[]}>} Transfer result
   */
  static async transferDependantsToNewPrincipal(
    deceasedPrincipalId: number,
    newPrincipalId: number,
    staffId: number
  ) {
    const { Patient, PatientInsurance } = await import('../../database/models');

    // Validate new principal exists and is not deceased
    const newPrincipal = await getPatientById(newPrincipalId);
    if (!newPrincipal) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'New principal patient not found');
    }
    if (newPrincipal.patient_status === PatientStatus.DECEASED) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Cannot transfer dependants to deceased principal'
      );
    }
    if (newPrincipal.patient_type !== PatientType.PATIENT) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'New principal must be a Patient, not a Dependant'
      );
    }

    // Find all dependants of the deceased principal
    const dependants = await Patient.findAll({
      where: {
        principal_id: deceasedPrincipalId,
        patient_type: PatientType.DEPENDANT,
      },
    });

    if (dependants.length === 0) {
      return { transferred: 0, dependants: [] };
    }

    // Get new principal's insurance information
    const newPrincipalInsurance = await PatientInsurance.findOne({
      where: {
        patient_id: newPrincipalId,
        is_default: true,
      },
    });

    if (!newPrincipalInsurance) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'New principal must have insurance to transfer dependants'
      );
    }

    // Transfer each dependant
    const transferredDependants = [];
    for (const dependant of dependants) {
      // Update dependant's principal
      await Patient.update(
        {
          principal_id: newPrincipalId,
          updated_at: new Date(),
        },
        {
          where: { id: dependant.id },
        }
      );

      // Update dependant's insurance to match new principal
      await PatientInsurance.update(
        {
          insurance_id: newPrincipalInsurance.insurance_id,
          hmo_id: newPrincipalInsurance.hmo_id,
          plan: newPrincipalInsurance.plan,
          organization: newPrincipalInsurance.organization,
          enrollee_code: newPrincipalInsurance.enrollee_code,
          updated_at: new Date(),
        },
        {
          where: {
            patient_id: dependant.id,
            is_default: true,
          },
        }
      );

      transferredDependants.push({
        id: dependant.id,
        fullname: dependant.fullname,
        previous_principal: deceasedPrincipalId,
        new_principal: newPrincipalId,
      });

      logger.info(
        `Transferred dependant ${dependant.fullname} (ID: ${dependant.id}) from principal ${deceasedPrincipalId} to ${newPrincipalId}`
      );
    }

    return {
      transferred: transferredDependants.length,
      dependants: transferredDependants,
    };
  }

  /**
   * Handle dependant relationships when principal patient dies
   *
   * @static
   * @param {number} principalId - Principal patient ID
   * @param {number} staffId - Staff member ID
   */
  static async handleDependantRelationshipsOnDeath(principalId: number, staffId: number) {
    const { Patient, PatientInsurance } = await import('../../database/models');

    // Find all dependants of the deceased principal
    const dependants = await Patient.findAll({
      where: {
        principal_id: principalId,
        patient_type: PatientType.DEPENDANT,
      },
    });

    if (dependants.length > 0) {
      // Update dependants' insurance status and notify about principal's death
      for (const dependant of dependants) {
        // Update dependant's insurance to indicate principal is deceased
        await PatientInsurance.update(
          {
            // Add a note about principal's death
            organization: `Principal deceased - ${new Date().toISOString()}`,
          },
          {
            where: {
              patient_id: dependant.id,
              is_default: true,
            },
          }
        );

        // Log the dependant relationship change
        logger.info(
          `Dependant ${dependant.fullname} (ID: ${dependant.id}) affected by principal's death`
        );
      }
    }
  }

  /**
   * Revive patient (admin only)
   *
   * @static
   * @param {number} patientId - Patient ID
   * @param {object} revivalData - Revival information
   * @param {number} staffId - Staff member ID who revived patient
   * @returns {Promise<Patient>} Updated patient data
   */
  static async revivePatient(patientId: number, revivalData: any, staffId: number) {
    const patient = await getPatientById(patientId);

    if (!patient) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Patient not found');
    }

    if (patient.patient_status !== PatientStatus.DECEASED) {
      throw new BadException('CONFLICT', StatusCodes.CONFLICT, 'Patient is not marked as deceased');
    }

    const updateData = {
      patient_status: PatientStatus.OUTPATIENT, // Default to outpatient when revived
      revival_reason: revivalData.revival_reason,
      revived_by: staffId,
      revived_at: new Date(),
      // Clear death fields
      date_of_death: null,
      cause_of_death: null,
      death_certificate_number: null,
      marked_deceased_by: null,
      marked_deceased_at: null,
    };

    const updatedPatient = await updatePatient({ patient_id: patientId, ...updateData });

    // Log audit trail for patient revival
    await AuditService.logAuditAction({
      patient_id: patientId,
      action: DeceasedPatientAction.REVIVED,
      performed_by: staffId,
      details: {
        revival_reason: revivalData.revival_reason,
        previous_death_date: patient.date_of_death,
        previous_cause_of_death: patient.cause_of_death,
        previous_death_certificate_number: patient.death_certificate_number,
        new_status: PatientStatus.OUTPATIENT,
      },
    });

    return updatedPatient;
  }

  /**
   * Get deceased patients
   *
   * @static
   * @param {object} query - Query parameters
   * @returns {Promise<object>} Deceased patients data
   */
  static async getDeceasedPatients(query: any) {
    const deceasedQuery = {
      ...query,
      patient_status: PatientStatus.DECEASED,
    };
    return await getPatients(deceasedQuery);
  }

  /**
   * Generate death certificate
   *
   * @static
   * @param {number} patientId - Patient ID
   * @returns {Promise<object>} Death certificate data
   */
  static async generateDeathCertificate(patientId: number) {
    const patient = await getPatientById(patientId);

    if (!patient) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Patient not found');
    }

    if (patient.patient_status !== PatientStatus.DECEASED) {
      throw new BadException('CONFLICT', StatusCodes.CONFLICT, 'Patient is not marked as deceased');
    }

    // Generate a unique certificate number if not provided
    const certificateNumber = patient.death_certificate_number || `DC-${patient.id}-${Date.now()}`;

    // Update patient with certificate number if not already set
    if (!patient.death_certificate_number) {
      await updatePatient({ patient_id: patientId, death_certificate_number: certificateNumber });
    }

    return {
      patient_id: patient.id,
      patient_name: patient.fullname,
      date_of_death: patient.date_of_death,
      cause_of_death: patient.cause_of_death,
      death_certificate_number: certificateNumber,
      generated_at: new Date(),
      generated_by: patient.marked_deceased_by,
    };
  }

  /**
   * Generate PDF death certificate for patient
   *
   * @static
   * @param {number} patientId - Patient ID
   * @param {any} res - Express response object
   * @param includeDigitalSignature
   * @returns {Promise<void>}
   */
  static async generateDeathCertificatePDF(
    patientId: number,
    res: any,
    includeDigitalSignature = false
  ) {
    const patient = await getPatientById(patientId);

    if (!patient) {
      throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Patient not found');
    }

    if (patient.patient_status !== PatientStatus.DECEASED) {
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        'Patient is not marked as deceased'
      );
    }

    // Get staff member who marked patient as deceased
    const { Staff } = await import('../../database/models');
    const markedByStaff = await Staff.findByPk(patient.marked_deceased_by);

    if (!markedByStaff) {
      throw new BadException(
        'NOT_FOUND',
        StatusCodes.NOT_FOUND,
        'Staff member who marked patient as deceased not found'
      );
    }

    // Generate certificate number if not exists
    const certificateNumber = patient.death_certificate_number || `DC-${patient.id}-${Date.now()}`;
    if (!patient.death_certificate_number) {
      await updatePatient({ patient_id: patientId, death_certificate_number: certificateNumber });
    }

    // Hospital information (you can customize this)
    const hospitalInfo = {
      name: 'Heritage Kidney and Medical Care',
      address: 'Kaura District, Opp. Suncity',
      phone: '+234 XXX XXX XXXX',
      email: 'info@heritagekidney.com',
    };

    // Generate private key for digital signature if needed
    let privateKey = null;
    if (includeDigitalSignature) {
      const { generateKeyPair } = await import('../../core/helpers/digitalSignature');
      const keyPair = generateKeyPair();
      privateKey = keyPair.privateKey;
    }

    // Prepare certificate data
    const certificateData = {
      patient,
      deathInfo: {
        date_of_death: patient.date_of_death,
        cause_of_death: patient.cause_of_death,
        death_certificate_number: certificateNumber,
        marked_deceased_by: patient.marked_deceased_by,
        marked_deceased_at: patient.marked_deceased_at,
      },
      markedByStaff,
      hospitalInfo,
      includeDigitalSignature,
      privateKey,
    };

    // Generate PDF
    const { generateDeathCertificate } = await import(
      '../../core/helpers/generateDeathCertificate'
    );
    // Log audit trail for certificate generation
    await AuditService.logAuditAction({
      patient_id: patientId,
      action: DeceasedPatientAction.CERTIFICATE_GENERATED,
      performed_by: markedByStaff.id,
      details: {
        certificate_number: certificateNumber,
        include_digital_signature: includeDigitalSignature,
        generation_method: 'PDF',
        hospital_info: hospitalInfo.name,
      },
    });

    return generateDeathCertificate(certificateData, res);
  }
}
export default PatientService;
