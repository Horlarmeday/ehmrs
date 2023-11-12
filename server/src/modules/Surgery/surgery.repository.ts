import { Service, Staff, SurgeryRequest } from '../../database/models';
import { WhereOptions } from 'sequelize';
import { staffAttributes } from '../Antenatal/antenatal.repository';

/**
 * request surgery
 * @param data
 * @returns {Promise<SurgeryRequest>} item data
 */
export const requestSurgery = async (data): Promise<SurgeryRequest> => {
  return SurgeryRequest.create({ ...data });
};

/**
 * get one surgery
 * @param query
 */
export const getOneSurgery = (query: WhereOptions<SurgeryRequest>) => {
  return SurgeryRequest.findOne({
    where: { ...query },
    include: [
      { model: Service, attributes: ['name'] },
      { model: Staff, attributes: staffAttributes },
    ],
  });
};
