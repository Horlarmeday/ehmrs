import userRoutes from '../modules/Staff/staff.routes';
import authRoutes from '../modules/Auth/auth.routes';
import patientRoutes from '../modules/Patient/patient.routes';
import insuranceRoutes from '../modules/Insurance/insurance.routes';
import adminRoutes from '../modules/AdminSettings/admin.routes';
import storeRoutes from '../modules/Store/store.routes';
import labRoutes from '../modules/Laboratory/laboratory.routes';
import pharmacyRoutes from '../modules/Pharmacy/pharmacy.routes';

export default (server) => {
  server.use('/api/staffs', userRoutes);
  server.use('/api/auth', authRoutes);
  server.use('/api/patients', patientRoutes);
  server.use('/api/insurances', insuranceRoutes);
  server.use('/api/settings', adminRoutes);
  server.use('/api/store', storeRoutes);
  server.use('/api/laboratory', labRoutes);
  server.use('/api/pharmacy', pharmacyRoutes);
  server.use((req, res, next) => {
    const apiTimeout = 18000;
    // set the timeout for all HTTP requests
    req.setTimeout(apiTimeout, () => {
      const err = new Error('Request Timeout');
      err.status = 408;
      next(err);
    });

    // set the server response timeout for all HTTP requests
    res.setTimeout(apiTimeout, () => {
      const err = new Error('Service Unavailable');
      err.status = 503;
      next(err);
    });
    next();
  });
  server.use((req, res, next) => {
    const err = res.status(404).json({ message: 'Resource does not exist' });
    next(err);
  });
};
