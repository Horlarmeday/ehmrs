import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../../core/helpers/helper';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { BadException } from '../../common/util/api-error';
import { 
  retrieveSignatureData, 
  verifyDigitalSignature, 
  generateVerificationReport 
} from '../../core/helpers/digitalSignature';
import { Patient } from '../../database/models';

export class CertificateVerificationController {
  /**
   * Verify death certificate authenticity
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with verification result
   */
  static async verifyCertificate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { certificateId } = req.params;

      if (!certificateId) {
        throw new BadException(
          'BAD_REQUEST',
          StatusCodes.BAD_REQUEST,
          'Certificate ID is required'
        );
      }

      // Retrieve signature data
      const signatureData = await retrieveSignatureData(certificateId);

      if (!signatureData) {
        throw new BadException(
          'NOT_FOUND',
          StatusCodes.NOT_FOUND,
          'Certificate signature not found'
        );
      }

      // Get patient data
      const patient = await Patient.findByPk(signatureData.patientId);

      if (!patient) {
        throw new BadException(
          'NOT_FOUND',
          StatusCodes.NOT_FOUND,
          'Patient not found'
        );
      }

      // Create certificate data for verification
      const certificateData = {
        certificateId: signatureData.certificateId,
        patientId: patient.id,
        patientName: patient.fullname,
        dateOfDeath: patient.date_of_death,
        causeOfDeath: patient.cause_of_death,
        hospitalId: patient.hospital_id,
        generatedAt: patient.marked_deceased_at
      };

      // Generate verification report
      const verificationReport = generateVerificationReport(certificateData, signatureData);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Certificate verification completed',
        data: verificationReport,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get certificate verification status
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with verification status
   */
  static async getVerificationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const { certificateId } = req.params;

      if (!certificateId) {
        throw new BadException(
          'BAD_REQUEST',
          StatusCodes.BAD_REQUEST,
          'Certificate ID is required'
        );
      }

      // Retrieve signature data
      const signatureData = await retrieveSignatureData(certificateId);

      if (!signatureData) {
        return successResponse({
          res,
          httpCode: StatusCodes.OK,
          message: 'Certificate verification status',
          data: {
            certificateId,
            status: 'NOT_FOUND',
            message: 'Certificate signature not found',
            verified: false,
          },
        });
      }

      // Get patient data
      const patient = await Patient.findByPk(signatureData.patientId);

      if (!patient) {
        return successResponse({
          res,
          httpCode: StatusCodes.OK,
          message: 'Certificate verification status',
          data: {
            certificateId,
            status: 'PATIENT_NOT_FOUND',
            message: 'Patient not found',
            verified: false,
          },
        });
      }

      // Create certificate data for verification
      const certificateData = {
        certificateId: signatureData.certificateId,
        patientId: patient.id,
        patientName: patient.fullname,
        dateOfDeath: patient.date_of_death,
        causeOfDeath: patient.cause_of_death,
        hospitalId: patient.hospital_id,
        generatedAt: patient.marked_deceased_at
      };

      // Verify signature
      const isSignatureValid = verifyDigitalSignature(signatureData, certificateData);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Certificate verification status',
        data: {
          certificateId,
          status: isSignatureValid ? 'VERIFIED' : 'INVALID',
          message: isSignatureValid ? 'Certificate is authentic' : 'Certificate signature is invalid',
          verified: isSignatureValid,
          signedBy: signatureData.signedBy,
          signatureTimestamp: signatureData.timestamp,
          algorithm: signatureData.algorithm,
        },
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Get all certificate signatures
   *
   * @static
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - next middleware
   * @returns {Promise<SuccessResponse | void>} json object with all signatures
   */
  static async getAllSignatures(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const signaturesDir = path.join(process.cwd(), 'signatures');
      
      if (!fs.existsSync(signaturesDir)) {
        return successResponse({
          res,
          httpCode: StatusCodes.OK,
          message: 'No signatures found',
          data: {
            signatures: [],
            count: 0,
          },
        });
      }

      const signatureFiles = fs.readdirSync(signaturesDir).filter((file: string) => file.endsWith('.json'));
      const signatures = [];

      for (const file of signatureFiles) {
        try {
          const signatureData = JSON.parse(fs.readFileSync(path.join(signaturesDir, file), 'utf8'));
          signatures.push({
            certificateId: signatureData.certificateId,
            patientId: signatureData.patientId,
            signedBy: signatureData.signedBy,
            timestamp: signatureData.timestamp,
            algorithm: signatureData.algorithm,
          });
        } catch (error) {
          console.error(`Failed to read signature file ${file}:`, error);
        }
      }

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: 'Signatures retrieved successfully',
        data: {
          signatures,
          count: signatures.length,
        },
      });
    } catch (e) {
      return next(e);
    }
  }
}

export default CertificateVerificationController;
