import { Drug, Inventory, InventoryItem, Request, Staff, Unit } from '../../database/models';
import { Op } from 'sequelize';
import { dateIntervalQuery } from '../../core/helpers/helper';

/**
 * Create bulk requests
 * @param data
 */
export const createBulkRequest = async data => {
  return Request.bulkCreate(data);
};

/**
 * get all requests
 *
 * @function
 * @returns {Promise<{currentPage, docs, perPage, total}>} json object with requests data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param start
 * @param end
 */
export const getRequests = ({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  start = null,
  end = null,
}): Promise<{ currentPage: number; docs: Request[]; perPage: number; total: number }> => {
  return Request.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      ...(start && end && dateIntervalQuery('createdAt', start, end)),
    },
    include: [
      {
        model: InventoryItem,
        attributes: ['id'],
        include: [
          {
            model: Drug,
            attributes: ['name'],
            ...(search && {
              where: {
                name: {
                  [Op.like]: `%${search}%`,
                },
              },
            }),
          },
          { model: Unit, attributes: ['name'] },
        ],
      },
      {
        model: Inventory,
        attributes: ['name'],
      },
      {
        model: Staff,
        as: 'requester',
        attributes: ['firstname', 'lastname', 'fullname'],
      },
    ],
  });
};

/**
 * get current user requests
 *
 * @function
 * @returns {Promise<{currentPage, docs, perPage, total}>} json object with requests data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param start
 * @param end
 * @param currentUserId
 */
export const getCurrentUserRequests = ({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  start = null,
  end = null,
  currentUserId,
}): Promise<{ currentPage: number; docs: Request[]; perPage: number; total: number }> => {
  return Request.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      ...(start && end && dateIntervalQuery('createdAt', start, end)),
      requested_by: currentUserId,
    },
    include: [
      {
        model: InventoryItem,
        attributes: ['id'],
        include: [
          {
            model: Drug,
            attributes: ['name'],
            ...(search && {
              where: {
                name: {
                  [Op.like]: `%${search}%`,
                },
              },
            }),
          },
          { model: Unit, attributes: ['name'] },
        ],
      },
      {
        model: Inventory,
        attributes: ['name'],
      },
    ],
  });
};

/**
 * update request status
 * @param requestsBody
 */
export const updateRequestStatus = async (requestsBody: any[]) => {
  return await Promise.all(
    requestsBody.map(({ status, id }) => Request.update({ status }, { where: { id } }))
  );
};
