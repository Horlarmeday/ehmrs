import { Request, Response, NextFunction } from 'express';
import { Patient } from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { StatusCodes } from '../helpers/helper';

/**
 * Middleware to check if patient is not deceased before allowing prescriptions/orders
 * 
 * @param req - Express request object
 * @param res - Express response object  
 * @param next - Express next function
 */
export default async function checkPatientNotDeceased(
  req: Request & { user: { sub: number } },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const visitId = req.params.id;
    
    if (!visitId) {
      throw new BadException(
        'BAD_REQUEST',
        StatusCodes.BAD_REQUEST,
        'Visit ID is required'
      );
    }

    // Get patient from visit
    const { Visit } = await import('../../database/models');
    const visit = await Visit.findByPk(visitId, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'fullname', 'patient_status', 'date_of_death']
        }
      ]
    });

    if (!visit) {
      throw new BadException(
        'NOT_FOUND',
        StatusCodes.NOT_FOUND,
        'Visit not found'
      );
    }

    const patient = visit.patient;

    if (!patient) {
      throw new BadException(
        'NOT_FOUND',
        StatusCodes.NOT_FOUND,
        'Patient not found for this visit'
      );
    }

    // Check if patient is deceased
    if (patient.patient_status === 'Deceased') {
      throw new BadException(
        'FORBIDDEN',
        StatusCodes.FORBIDDEN,
        `Cannot prescribe medications for deceased patient ${patient.fullname}. Patient died on ${patient.date_of_death ? new Date(patient.date_of_death).toLocaleDateString() : 'unknown date'}.`
      );
    }
    // Add patient info to request for potential use in controllers
    (req as any).patient = patient;
    
    next();
  } catch (error) {
    next(error);
  }
}
