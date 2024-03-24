import { Alert, Staff } from '../../database/models';
import { Optional } from 'sequelize';
import { Status } from '../../database/models/alert';
import { staffAttributes } from '../../core/helpers/helper';

/**
 * create an alert
 * @param data
 * @returns {Promise<Alert>} alert data
 */
export const createAlert = async (data): Promise<Alert> => {
  const { name, alert, staff_id, patient_id } = data;

  return Alert.create({
    name,
    staff_id,
    alert,
    patient_id,
  });
};

/**
 * get alerts
 *
 * @function
 * @returns json object with alerts data
 * @param currentPage
 * @param pageLimit
 * @param patient_id
 */
export const getAlerts = ({ currentPage = 1, pageLimit = 10, patient_id }) => {
  return Alert.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Staff, attributes: staffAttributes }],
    where: {
      patient_id,
      status: Status.ACTIVE,
    },
  });
};

/**
 * update an alert
 * @param alertId
 * @param data
 */
export const updateAlert = async (alertId: number, data: Optional<any, string>) => {
  return Alert.update({ ...data }, { where: { id: alertId } });
};
