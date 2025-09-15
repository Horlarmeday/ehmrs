import { Encounter } from '../../database/models';
import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import { errorResponse } from '../../common/responses/error-responses';
import { getVisitById } from '../../modules/Visit/visit.repository';
import dayjs from 'dayjs';
import { logger } from '../helpers/logger';
import { EncounterType } from '../../database/enums';

interface CreateEncounterOptions {
  encounterType?: EncounterType;
  encounterSummary?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  metadata?: any;
}

// Safe JSON parsing with error handling
const safeJsonParse = (jsonString: string | null): any => {
  if (!jsonString) return {};
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return {};
  }
};

// Safe JSON stringify with error handling
const safeJsonStringify = (obj: any): string | null => {
  if (!obj) return null;
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('Failed to stringify JSON:', error);
    return null;
  }
};

export const createEncounter = async (
  req: Request & { user: any },
  res: Response,
  next: NextFunction,
  options: CreateEncounterOptions = {}
) => {
  const { id } = req.params;
  const { sub, department } = req.user;
  const HOURS_DIFF = 4;
  const allowedDepartments = ['Medical Practitioners', 'Administrator'];

  if (!allowedDepartments.includes(department)) {
    return next();
  }

  try {
    // Get visit data with null check
    const visit = await getVisitById(+id);
    if (!visit) {
      logger.warn(`Visit not found for ID: ${id}`);
      return next();
    }

    const {
      encounterType,
      encounterSummary,
      relatedEntityType,
      relatedEntityId,
      metadata,
    } = options;

    // Optimized query: Find existing encounter within time window
    // Using more specific conditions for better performance
    const existingEncounter = await Encounter.findOne({
      where: {
        staff_id: sub,
        visit_id: id,
        patient_id: visit.patient_id,
        time_of_encounter: {
          [Op.gt]: dayjs()
            .subtract(HOURS_DIFF, 'hours')
            .toDate(),
        },
      },
      order: [['time_of_encounter', 'DESC']],
      // Add limit for better performance
      limit: 1,
    });

    if (existingEncounter) {
      // Update existing encounter with safe JSON parsing
      const currentMetadata = safeJsonParse(existingEncounter.metadata);
      const newMetadata = safeJsonParse(metadata);

      // Merge encounter types and summaries efficiently
      const currentTypes = currentMetadata.encounterTypes || [];
      const currentSummaries = currentMetadata.summaries || [];

      if (encounterType && !currentTypes.includes(encounterType)) {
        currentTypes.push(encounterType);
      }

      if (encounterSummary && !currentSummaries.includes(encounterSummary)) {
        currentSummaries.push(encounterSummary);
      }

      // Prepare updated metadata
      const updatedMetadata = {
        ...currentMetadata,
        ...newMetadata,
        encounterTypes: currentTypes,
        summaries: currentSummaries,
        lastUpdated: new Date().toISOString(),
      };

      // Update the encounter with optimized data
      await existingEncounter.update({
        encounter_type: currentTypes.length === 1 ? currentTypes[0] : 'Multiple',
        encounter_summary: currentSummaries.join('; '),
        metadata: safeJsonStringify(updatedMetadata),
      });
    } else {
      // Create new encounter with optimized data structure
      const newEncounterData = {
        staff_id: sub,
        visit_id: id,
        patient_id: visit.patient_id,
        time_of_encounter: new Date(),
        encounter_type: encounterType,
        encounter_summary: encounterSummary,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
        metadata: safeJsonStringify({
          ...metadata,
          encounterTypes: encounterType ? [encounterType] : [],
          summaries: encounterSummary ? [encounterSummary] : [],
          createdAt: new Date().toISOString(),
        }),
      };

      await Encounter.create(newEncounterData);
    }

    next();
  } catch (error) {
    console.error('Error in createEncounter middleware:', error);
    return errorResponse({
      res,
      message: 'Failed to create or update encounter',
      httpCode: 500,
    });
  }
};

// Middleware functions that create encounters with specific types
// These work with the existing route structure where middleware runs before controllers

export const createServiceOrderEncounter = async (
  req: Request & { user: any },
  res: Response,
  next: NextFunction
) => {
  return createEncounter(req, res, next, {
    encounterType: EncounterType.SERVICE_ORDER,
    encounterSummary: 'Service order created',
    relatedEntityType: 'PrescribedService',
    // Note: relatedEntityId will be set after the service is created
    metadata: { source: 'service-order-route' },
  });
};

export const createPrescriptionEncounter = async (
  req: Request & { user: any },
  res: Response,
  next: NextFunction
) => {
  return createEncounter(req, res, next, {
    encounterType: EncounterType.PRESCRIPTION,
    encounterSummary: 'Prescription created',
    relatedEntityType: 'PrescribedDrug',
    // Note: relatedEntityId will be set after the prescription is created
    metadata: { source: 'pharmacy-order-route' },
  });
};

export const createLabOrderEncounter = async (
  req: Request & { user: any },
  res: Response,
  next: NextFunction
) => {
  return createEncounter(req, res, next, {
    encounterType: EncounterType.LAB_ORDER,
    encounterSummary: 'Laboratory test ordered',
    relatedEntityType: 'PrescribedTest',
    // Note: relatedEntityId will be set after the test is created
    metadata: { source: 'lab-order-route' },
  });
};

export const createRadiologyOrderEncounter = async (
  req: Request & { user: any },
  res: Response,
  next: NextFunction
) => {
  return createEncounter(req, res, next, {
    encounterType: EncounterType.RADIOLOGY_ORDER,
    encounterSummary: 'Radiology investigation ordered',
    relatedEntityType: 'PrescribedInvestigation',
    // Note: relatedEntityId will be set after the investigation is created
    metadata: { source: 'radiology-order-route' },
  });
};

export const createObservationEncounter = async (
  req: Request & { user: any },
  res: Response,
  next: NextFunction
) => {
  return createEncounter(req, res, next, {
    encounterType: EncounterType.OBSERVATION,
    encounterSummary: 'Patient observation recorded',
    relatedEntityType: 'Observation',
    // Note: relatedEntityId will be set after the observation is created
    metadata: { source: 'consultation-route' },
  });
};

// Optimized utility function to update encounter with entity ID after creation
export const updateEncounterWithEntityId = async (
  encounterType: EncounterType,
  relatedEntityType: string,
  entityId: number,
  visitId: number,
  staffId: number
) => {
  try {
    // Optimized query: Find encounters that match criteria and don't have this entity ID
    // Using more efficient conditions and limiting results
    const encounters = await Encounter.findAll({
      where: {
        visit_id: visitId,
        staff_id: staffId,
        related_entity_type: relatedEntityType,
        [Op.and]: [
          {
            [Op.or]: [{ encounter_type: encounterType }, { encounter_type: 'Multiple' }],
          },
          {
            [Op.or]: [{ related_entity_id: null }, { related_entity_id: { [Op.ne]: entityId } }],
          },
        ],
      },
      // Add limit for better performance
      limit: 10,
    });

    // Batch update for better performance
    const updatePromises = encounters.map(async encounter => {
      const metadata = safeJsonParse(encounter.metadata);
      const entityIds = metadata.entityIds || {};

      // Add the entity ID to the metadata efficiently
      if (!entityIds[relatedEntityType]) {
        entityIds[relatedEntityType] = [];
      }

      if (!entityIds[relatedEntityType].includes(entityId)) {
        entityIds[relatedEntityType].push(entityId);
      }

      // Update the encounter with optimized data
      return encounter.update({
        related_entity_id: entityIds[relatedEntityType][0], // Set the first entity ID as primary
        metadata: safeJsonStringify({
          ...metadata,
          entityIds,
          lastEntityUpdate: new Date().toISOString(),
        }),
      });
    });

    // Execute all updates in parallel for better performance
    await Promise.all(updatePromises);
  } catch (error) {
    logger.error('Failed to update encounter with entity ID:', error);
    // Don't throw error to avoid breaking the main flow
  }
};
