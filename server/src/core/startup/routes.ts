import './sentry';
import express, { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { StatusCodes } from '../helpers/helper';
import { handleError } from '../../common/responses/error-responses';
import { logger } from '../helpers/logger';
import staffRoutes from '../../modules/Staff/staff.routes';
import authRoutes from '../../modules/Auth/auth.routes';
import patientRoutes from '../../modules/Patient/patient.routes';
import insuranceRoutes from '../../modules/Insurance/insurance.routes';
import adminRoutes from '../../modules/AdminSettings/admin.routes';
import storeRoutes from '../../modules/Store/store.routes';
import labRoutes from '../../modules/Laboratory/laboratory.routes';
import pharmacyRoutes from '../../modules/Pharmacy/pharmacy.routes';
import visitRoutes from '../../modules/Visit/visit.routes';
import consultationRoutes from '../../modules/Consultation/consultation.routes';
import triageRoutes from '../../modules/Triage/triage.routes';
import labOrderRoutes from '../../modules/Orders/Laboratory/lab-order.routes';
import pharmacyOrderRoutes from '../../modules/Orders/Pharmacy/pharmacy-order.routes';
import radiologyOrderRoutes from '../../modules/Orders/Radiology/radiology-order.routes';
import serviceOrderRoutes from '../../modules/Orders/Service/service-order.routes';
import inventoryRoutes from '../../modules/Inventory/inventory.routes';
import radiologyRoutes from '../../modules/Radiology/radiology.routes';
import diagnosisRoutes from '../../modules/Diagnosis/diagnosis.routes';
import admissionRoutes from '../../modules/Admission/admission.routes';
import requestRoutes from '../../modules/Request/request.routes';
import antenatalRoutes from '../../modules/Antenatal/antenatal.routes';
import surgeryRoutes from '../../modules/Surgery/surgery.routes';
import immunizationRoutes from '../../modules/Immunization/immunization.routes';
import alertRoutes from '../../modules/Alert/alert.routes';
import accountRoutes from '../../modules/Account/account.routes';

export default (server: express.Application) => {
  server.use('/api/staffs', staffRoutes);
  server.use('/api/auth', authRoutes);
  server.use('/api/patients', patientRoutes);
  server.use('/api/insurances', insuranceRoutes);
  server.use('/api/settings', adminRoutes);
  server.use('/api/store', storeRoutes);
  server.use('/api/laboratory', labRoutes);
  server.use('/api/pharmacy', pharmacyRoutes);
  server.use('/api/visits', visitRoutes);
  server.use('/api/consultations', consultationRoutes);
  server.use('/api/triage', triageRoutes);
  server.use('/api/inventory', inventoryRoutes);
  server.use('/api/radiology', radiologyRoutes);
  server.use('/api/diagnosis', diagnosisRoutes);
  server.use('/api/admission', admissionRoutes);
  server.use('/api/requests', requestRoutes);
  server.use('/api/antenatal', antenatalRoutes);
  server.use('/api/surgeries', surgeryRoutes);
  server.use('/api/immunizations', immunizationRoutes);
  server.use('/api/alerts', alertRoutes);
  server.use('/api/account', accountRoutes);
  server.use('/api/orders/laboratory', labOrderRoutes);
  server.use('/api/orders/pharmacy', pharmacyOrderRoutes);
  server.use('/api/orders/radiology', radiologyOrderRoutes);
  server.use('/api/orders/service', serviceOrderRoutes);

  Sentry.setupExpressErrorHandler(server);

  server.use(
    (
      error: { statusCode: number; message: string },
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      //const ErrorCodesNotToLog = [404];
      //if (error?.statusCode && !ErrorCodesNotToLog.includes(error?.statusCode)) {
      console.error(error);
      logger.error(error.message, error);
      // }
      handleError(error, res);
    }
  );
  server.use((req, res, next) => {
    const apiTimeout = 18000;
    // set the timeout for all HTTP requests
    req.setTimeout(apiTimeout, () => {
      const err = res
        .status(StatusCodes.TIMED_OUT)
        .json({ status: 'error', message: 'Request Timeout' });
      next(err);
    });

    // set the server response timeout for all HTTP requests
    res.setTimeout(apiTimeout, () => {
      const err = res
        .status(StatusCodes.SERVICE_UNAVAILABLE)
        .json({ status: 'error', message: 'Service Unavailable' });
      next(err);
    });
    next();
  });
  // server.get('*', (req, res, next) => {
  //   // Check if the request is for a static file
  //   if (req.accepts('html')) {
  //     res.sendFile(path.join(__dirname, '../../../../client/dist', 'index.html'));
  //   } else {
  //     // Pass to the next route handler
  //     next();
  //   }
  // });
  server.use((req, res, next) => {
    const err = res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: 'error', message: 'Resource does not exist' });
    next(err);
  });
};
