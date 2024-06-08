import { SystemSettings } from '../models';

export const initSystemSettings = async () => {
  const settings = await SystemSettings.findOne();
  if (!settings) {
    SystemSettings.create({
      name_of_organization: 'Electronic Hospital Management Resource System',
      address_of_organization: 'Kubwa Abuja',
      email: 'hospitalehmrs@gmail.com',
      phone: '+2347032345678',
      nhis_daily_quota_amount: 3000,
      system_color: 'Blue',
      patient_id_prefix: 'EHS',
    });
  }
};
