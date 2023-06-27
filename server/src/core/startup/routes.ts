import userRoutes from '../../modules/Staff/staff.routes';
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
import inventoryRoutes from '../../modules/Inventory/inventory.routes';
import radiologyRoutes from '../../modules/Radiology/radiology.routes';
import diagnosisRoutes from '../../modules/Diagnosis/diagnosis.routes';
import express from 'express';
import { StatusCodes } from '../helpers/helper';

export default (server: express.Application) => {
  server.use('/api/staffs', userRoutes);
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
  server.use('/api/orders/lab', labOrderRoutes);
  server.use('/api/orders/pharmacy', pharmacyOrderRoutes);
  server.use('/api/orders/radiology', radiologyOrderRoutes);
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
  server.use((req, res, next) => {
    const err = res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: 'error', message: 'Resource does not exist' });
    next(err);
  });
};
