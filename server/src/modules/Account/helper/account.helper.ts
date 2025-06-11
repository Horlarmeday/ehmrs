import { PaymentHistory, ServiceName } from '../../../database/models/paymentHistory';
import { Op, QueryTypes } from 'sequelize';
import {
  Drug,
  Investigation,
  Patient,
  PrescribedAdditionalItem,
  PrescribedDrug,
  PrescribedInvestigation,
  PrescribedService,
  PrescribedTest,
  Service,
  Test,
} from '../../../database/models';

export function getContentType(format: string) {
  switch (format) {
    case 'PDF':
      return 'application/pdf';
    case 'EXCEL':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'CSV':
      return 'text/csv';
    case 'JSON':
      return 'application/json';
    default:
      return 'application/json';
  }
}

export const getPaymentHistoryQuery = serviceConfig => {
  const query = `
    SELECT 
      ph.id,
      ph.transaction_id,
      ph.transaction_date,
      ph.amount,
      ph.mode_of_payment,
      ph.notes,
      ph.narration,
      ph.service_name as serviceName,
      p.id as patient_id,
      p.firstname as patient_firstname,
      p.lastname as patient_lastname,
      p.phone as patient_phone,
      s.id as service_detail_id,
      s.${serviceConfig.joinField} as service_reference_id,
      ref.id as reference_id,
      ref.name as reference_name
    FROM Payment_Histories ph
    LEFT JOIN Patients p ON ph.patient_id = p.id
    LEFT JOIN ${serviceConfig.table} s ON ph.service_id = s.id
    LEFT JOIN ${serviceConfig.joinTable} ref ON s.${serviceConfig.joinField} = ref.id
    WHERE ph.visit_id = :visitId 
      AND ph.service_name = :serviceName
    ORDER BY ph.transaction_date DESC
  `;
  return query;
};

export const getPaymentHistoryQueries = () => {
  return [
    // Drugs query
    `
    SELECT 
      ph.id,
      ph.transaction_id,
      ph.transaction_date,
      ph.amount,
      ph.mode_of_payment,
      ph.notes,
      ph.narration,
      ph.service_name as serviceName,
      p.id as patient_id,
      p.firstname as patient_firstname,
      p.lastname as patient_lastname,
      p.phone as patient_phone,
      s.id as service_detail_id,
      s.drug_id as service_reference_id,
      ref.id as reference_id,
      ref.name as reference_name,
      'drug' as service_type
    FROM Payment_Histories ph
    LEFT JOIN Patients p ON ph.patient_id = p.id
    LEFT JOIN Prescribed_Drugs s ON ph.service_id = s.id AND ph.service_name = '${ServiceName.DRUGS}'
    LEFT JOIN Drugs ref ON s.drug_id = ref.id
    WHERE ph.visit_id = :visitId AND ph.service_name = '${ServiceName.DRUGS}'
    `,
    // Tests query
    `
    SELECT 
      ph.id,
      ph.transaction_id,
      ph.transaction_date,
      ph.amount,
      ph.mode_of_payment,
      ph.notes,
      ph.narration,
      ph.service_name as serviceName,
      p.id as patient_id,
      p.firstname as patient_firstname,
      p.lastname as patient_lastname,
      p.phone as patient_phone,
      s.id as service_detail_id,
      s.test_id as service_reference_id,
      ref.id as reference_id,
      ref.name as reference_name,
      'test' as service_type
    FROM Payment_Histories ph
    LEFT JOIN Patients p ON ph.patient_id = p.id
    LEFT JOIN Prescribed_Tests s ON ph.service_id = s.id AND ph.service_name = '${ServiceName.TESTS}'
    LEFT JOIN Tests ref ON s.test_id = ref.id
    WHERE ph.visit_id = :visitId AND ph.service_name = '${ServiceName.TESTS}'
    `,
    // Investigations query
    `
    SELECT 
      ph.id,
      ph.transaction_id,
      ph.transaction_date,
      ph.amount,
      ph.mode_of_payment,
      ph.notes,
      ph.narration,
      ph.service_name as serviceName,
      p.id as patient_id,
      p.firstname as patient_firstname,
      p.lastname as patient_lastname,
      p.phone as patient_phone,
      s.id as service_detail_id,
      s.investigation_id as service_reference_id,
      ref.id as reference_id,
      ref.name as reference_name,
      'investigation' as service_type
    FROM Payment_Histories ph
    LEFT JOIN Patients p ON ph.patient_id = p.id
    LEFT JOIN Prescribed_Investigations s ON ph.service_id = s.id AND ph.service_name = '${ServiceName.INVESTIGATIONS}'
    LEFT JOIN Investigations ref ON s.investigation_id = ref.id
    WHERE ph.visit_id = :visitId AND ph.service_name = '${ServiceName.INVESTIGATIONS}'
    `,
    // Services query
    `
    SELECT 
      ph.id,
      ph.transaction_id,
      ph.transaction_date,
      ph.amount,
      ph.mode_of_payment,
      ph.notes,
      ph.narration,
      ph.service_name as serviceName,
      p.id as patient_id,
      p.firstname as patient_firstname,
      p.lastname as patient_lastname,
      p.phone as patient_phone,
      s.id as service_detail_id,
      s.service_id as service_reference_id,
      ref.id as reference_id,
      ref.name as reference_name,
      'service' as service_type
    FROM Payment_Histories ph
    LEFT JOIN Patients p ON ph.patient_id = p.id
    LEFT JOIN Prescribed_Services s ON ph.service_id = s.id AND ph.service_name = '${ServiceName.SERVICES}'
    LEFT JOIN Services ref ON s.service_id = ref.id
    WHERE ph.visit_id = :visitId AND ph.service_name = '${ServiceName.SERVICES}'
    `,
    // Items query
    `
    SELECT 
      ph.id,
      ph.transaction_id,
      ph.transaction_date,
      ph.amount,
      ph.mode_of_payment,
      ph.notes,
      ph.narration,
      ph.service_name as serviceName,
      p.id as patient_id,
      p.firstname as patient_firstname,
      p.lastname as patient_lastname,
      p.phone as patient_phone,
      s.id as service_detail_id,
      s.drug_id as service_reference_id,
      ref.id as reference_id,
      ref.name as reference_name,
      'item' as service_type
    FROM Payment_Histories ph
    LEFT JOIN Patients p ON ph.patient_id = p.id
    LEFT JOIN Additional_item_prescriptions s ON ph.service_id = s.id AND ph.service_name = '${ServiceName.ITEMS}'
    LEFT JOIN Drugs ref ON s.drug_id = ref.id
    WHERE ph.visit_id = :visitId AND ph.service_name = '${ServiceName.ITEMS}'
    `,
  ];
};

export const getPaymentHistoryDataForPrint = async (
  serviceName: ServiceName | 'ALL',
  visitId: number
) => {
  // Build where clause - include service_name filter only if not 'ALL'
  const whereClause: any = {
    visit_id: visitId,
  };

  // Helper function to fetch all service details when serviceName is 'ALL'
  const fetchAllServiceDetails = async (paymentHistory: any[]) => {
    // Group service IDs by service type for efficient batch queries
    const serviceIdsByType = paymentHistory.reduce((acc, payment) => {
      if (!acc[payment.service_name]) {
        acc[payment.service_name] = [];
      }
      acc[payment.service_name].push(payment.service_id);
      return acc;
    }, {} as Record<string, number[]>);

    // Fetch all service details in parallel
    const serviceDetailsPromises = [];
    const serviceDetailsMap = new Map();

    // Fetch drugs
    if (serviceIdsByType[ServiceName.DRUGS]?.length > 0) {
      serviceDetailsPromises.push(
        PrescribedDrug.findAll({
          where: { id: { [Op.in]: serviceIdsByType[ServiceName.DRUGS] } },
          include: [{ model: Drug, attributes: ['id', 'name'] }],
          attributes: ['id', 'drug_id'],
        }).then(results => {
          results.forEach(item => serviceDetailsMap.set(`${ServiceName.DRUGS}_${item.id}`, item));
        })
      );
    }

    // Fetch tests
    if (serviceIdsByType[ServiceName.TESTS]?.length > 0) {
      serviceDetailsPromises.push(
        PrescribedTest.findAll({
          where: { id: { [Op.in]: serviceIdsByType[ServiceName.TESTS] } },
          include: [{ model: Test, attributes: ['id', 'name'] }],
          attributes: ['id', 'test_id'],
        }).then(results => {
          results.forEach(item => serviceDetailsMap.set(`${ServiceName.TESTS}_${item.id}`, item));
        })
      );
    }

    // Fetch investigations
    if (serviceIdsByType[ServiceName.INVESTIGATIONS]?.length > 0) {
      serviceDetailsPromises.push(
        PrescribedInvestigation.findAll({
          where: { id: { [Op.in]: serviceIdsByType[ServiceName.INVESTIGATIONS] } },
          include: [{ model: Investigation, attributes: ['id', 'name'] }],
          attributes: ['id', 'investigation_id'],
        }).then(results => {
          results.forEach(item =>
            serviceDetailsMap.set(`${ServiceName.INVESTIGATIONS}_${item.id}`, item)
          );
        })
      );
    }

    // Fetch services
    if (serviceIdsByType[ServiceName.SERVICES]?.length > 0) {
      serviceDetailsPromises.push(
        PrescribedService.findAll({
          where: { id: { [Op.in]: serviceIdsByType[ServiceName.SERVICES] } },
          include: [{ model: Service, attributes: ['id', 'name'] }],
          attributes: ['id', 'service_id'],
        }).then(results => {
          results.forEach(item =>
            serviceDetailsMap.set(`${ServiceName.SERVICES}_${item.id}`, item)
          );
        })
      );
    }

    // Fetch items
    if (serviceIdsByType[ServiceName.ITEMS]?.length > 0) {
      serviceDetailsPromises.push(
        PrescribedAdditionalItem.findAll({
          where: { id: { [Op.in]: serviceIdsByType[ServiceName.ITEMS] } },
          include: [{ model: Drug, attributes: ['id', 'name'] }],
          attributes: ['id', 'drug_id'],
        }).then(results => {
          results.forEach(item => serviceDetailsMap.set(`${ServiceName.ITEMS}_${item.id}`, item));
        })
      );
    }

    // Wait for all service details to be fetched
    await Promise.all(serviceDetailsPromises);

    // Map payment history with appropriate service details
    return paymentHistory.map(payment => {
      const serviceDetailKey = `${payment.service_name}_${payment.service_id}`;
      const serviceDetail = serviceDetailsMap.get(serviceDetailKey);

      const baseData = {
        id: payment.id,
        transaction_id: payment.transaction_id,
        transaction_date: payment.transaction_date,
        amount: payment.amount,
        mode_of_payment: payment.mode_of_payment,
        notes: payment.notes,
        narration: payment.narration,
        patient: payment.patient,
        serviceName: payment.service_name,
      };

      // Add service-specific data based on the payment's service_name
      switch (payment.service_name) {
        case ServiceName.DRUGS:
          return { ...baseData, drug: serviceDetail };
        case ServiceName.TESTS:
          return { ...baseData, test: serviceDetail };
        case ServiceName.INVESTIGATIONS:
          return { ...baseData, investigation: serviceDetail };
        case ServiceName.SERVICES:
          return { ...baseData, service: serviceDetail };
        case ServiceName.ITEMS:
          return { ...baseData, item: serviceDetail };
        default:
          return baseData;
      }
    });
  };

  if (serviceName !== 'ALL') {
    whereClause.service_name = serviceName;
  }

  // First, get the basic payment history with patient info
  const paymentHistory = await PaymentHistory.findAll({
    where: whereClause,
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'firstname', 'lastname', 'phone'],
      },
    ],
    order: [['transaction_date', 'DESC']],
  });

  if (paymentHistory?.length === 0) {
    return [];
  }

  if (serviceName === 'ALL') {
    return await fetchAllServiceDetails(paymentHistory);
  }

  // Extract service IDs for batch fetching
  const serviceIds = paymentHistory.map(payment => payment.service_id);

  // Fetch service details based on service name in a single query
  let serviceDetails: any[] = [];

  switch (serviceName) {
    case ServiceName.DRUGS:
      serviceDetails = await PrescribedDrug.findAll({
        where: { id: { [Op.in]: serviceIds } },
        include: [
          {
            model: Drug,
            attributes: ['id', 'name'],
          },
        ],
        attributes: ['id', 'drug_id'],
      });
      break;

    case ServiceName.TESTS:
      serviceDetails = await PrescribedTest.findAll({
        where: { id: { [Op.in]: serviceIds } },
        include: [
          {
            model: Test,
            attributes: ['id', 'name'],
          },
        ],
        attributes: ['id', 'test_id'],
      });
      break;

    case ServiceName.INVESTIGATIONS:
      serviceDetails = await PrescribedInvestigation.findAll({
        where: { id: { [Op.in]: serviceIds } },
        include: [
          {
            model: Investigation,
            attributes: ['id', 'name'],
          },
        ],
        attributes: ['id', 'investigation_id'],
      });
      break;

    case ServiceName.SERVICES:
      serviceDetails = await PrescribedService.findAll({
        where: { id: { [Op.in]: serviceIds } },
        include: [
          {
            model: Service,
            attributes: ['id', 'name'],
          },
        ],
        attributes: ['id', 'service_id'],
      });
      break;

    case ServiceName.ITEMS:
      serviceDetails = await PrescribedAdditionalItem.findAll({
        where: { id: { [Op.in]: serviceIds } },
        include: [
          {
            model: Drug,
            attributes: ['id', 'name'],
          },
        ],
        attributes: ['id', 'drug_id'],
      });
      break;

    default:
      return paymentHistory.map(payment => ({
        id: payment.id,
        transaction_id: payment.transaction_id,
        transaction_date: payment.transaction_date,
        amount: payment.amount,
        mode_of_payment: payment.mode_of_payment,
        notes: payment.notes,
        narration: payment.narration,
        patient: payment.patient,
        serviceName: payment.service_name,
      }));
  }

  // Create a lookup map for O(1) service detail access
  const serviceDetailsMap = new Map(serviceDetails.map(detail => [detail.id, detail]));

  // Map payment history with service details
  return paymentHistory.map(payment => {
    const serviceDetail = serviceDetailsMap.get(payment.service_id);

    const baseData = {
      id: payment.id,
      transaction_id: payment.transaction_id,
      transaction_date: payment.transaction_date,
      amount: payment.amount,
      mode_of_payment: payment.mode_of_payment,
      notes: payment.notes,
      narration: payment.narration,
      patient: payment.patient,
      serviceName: payment.service_name,
    };

    // Add service-specific data
    switch (serviceName) {
      case ServiceName.DRUGS:
        return {
          ...baseData,
          drug: serviceDetail,
        };
      case ServiceName.TESTS:
        return {
          ...baseData,
          test: serviceDetail,
        };
      case ServiceName.INVESTIGATIONS:
        return {
          ...baseData,
          investigation: serviceDetail,
        };
      case ServiceName.SERVICES:
        return {
          ...baseData,
          service: serviceDetail,
        };
      case ServiceName.ITEMS:
        return {
          ...baseData,
          item: serviceDetail,
        };
      default:
        return baseData;
    }
  });
};

export const fetchAllServiceDetailsRaw = async (visitId: number) => {
  // Execute all queries in parallel
  const queries = getPaymentHistoryQueries();
  const queryPromises = queries.map(query =>
    PaymentHistory.sequelize.query(query, {
      replacements: { visitId },
      type: QueryTypes.SELECT,
    })
  );

  const results = await Promise.all(queryPromises);

  // Flatten and combine all results
  const allResults = results.flat();

  // Transform and sort the results
  return allResults
    .map((row: any) => {
      const baseData = {
        id: row.id,
        transaction_id: row.transaction_id,
        transaction_date: row.transaction_date,
        amount: row.amount,
        mode_of_payment: row.mode_of_payment,
        notes: row.notes,
        narration: row.narration,
        serviceName: row.serviceName,
        patient: {
          id: row.patient_id,
          firstname: row.patient_firstname,
          lastname: row.patient_lastname,
          phone: row.patient_phone,
        },
      };

      // Create service detail object
      const serviceDetail = row.service_detail_id
        ? {
            id: row.service_detail_id,
            [`${row.service_type}_id`]: row.service_reference_id,
            [row.service_type === 'item' ? 'drug' : row.service_type]: {
              id: row.reference_id,
              name: row.reference_name,
            },
          }
        : null;

      // Add service-specific data based on service_type
      switch (row.service_type) {
        case 'drug':
          return { ...baseData, drug: serviceDetail };
        case 'test':
          return { ...baseData, test: serviceDetail };
        case 'investigation':
          return { ...baseData, investigation: serviceDetail };
        case 'service':
          return { ...baseData, service: serviceDetail };
        case 'item':
          return { ...baseData, item: serviceDetail };
        default:
          return baseData;
      }
    })
    .sort(
      (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    );
};

// Alternative approach using raw SQL for even better performance
export const getPaymentHistoryDataForPrintRaw = async (
  serviceName: ServiceName | 'ALL',
  visitId: number
) => {
  if (serviceName === 'ALL') {
    return await fetchAllServiceDetailsRaw(visitId);
  }

  // Define the service table mapping
  const serviceTableMap = {
    [ServiceName.DRUGS]: {
      table: 'Prescribed_Drugs',
      joinTable: 'Drugs',
      joinField: 'drug_id',
    },
    [ServiceName.TESTS]: {
      table: 'Prescribed_Tests',
      joinTable: 'Tests',
      joinField: 'test_id',
    },
    [ServiceName.INVESTIGATIONS]: {
      table: 'Prescribed_Investigations',
      joinTable: 'Investigations',
      joinField: 'investigation_id',
    },
    [ServiceName.SERVICES]: {
      table: 'Prescribed_Services',
      joinTable: 'Services',
      joinField: 'service_id',
    },
    [ServiceName.ITEMS]: {
      table: 'Prescribed_Additional_Items',
      joinTable: 'Drugs',
      joinField: 'drug_id',
    },
  };

  const serviceConfig = serviceTableMap[serviceName];

  if (!serviceConfig) {
    return [];
  }

  const query = `
    SELECT 
      ph.id,
      ph.transaction_id,
      ph.transaction_date,
      ph.amount,
      ph.mode_of_payment,
      ph.notes,
      ph.narration,
      ph.service_name as serviceName,
      p.id as patient_id,
      p.firstname as patient_firstname,
      p.lastname as patient_lastname,
      p.phone as patient_phone,
      s.id as service_detail_id,
      s.${serviceConfig.joinField} as service_reference_id,
      ref.id as reference_id,
      ref.name as reference_name
    FROM Payment_Histories ph
    LEFT JOIN Patients p ON ph.patient_id = p.id
    LEFT JOIN ${serviceConfig.table} s ON ph.service_id = s.id
    LEFT JOIN ${serviceConfig.joinTable} ref ON s.${serviceConfig.joinField} = ref.id
    WHERE ph.visit_id = :visitId 
      AND ph.service_name = :serviceName
    ORDER BY ph.transaction_date DESC
  `;

  const results = await PaymentHistory.sequelize.query(query, {
    replacements: { visitId, serviceName },
    type: QueryTypes.SELECT,
  });

  // Transform the raw results
  return results.map((row: any) => {
    const baseData = {
      id: row.id,
      transaction_id: row.transaction_id,
      transaction_date: row.transaction_date,
      amount: row.amount,
      mode_of_payment: row.mode_of_payment,
      notes: row.notes,
      narration: row.narration,
      serviceName: row.serviceName,
      patient: {
        id: row.patient_id,
        firstname: row.patient_firstname,
        lastname: row.patient_lastname,
        phone: row.patient_phone,
      },
    };

    // Create service detail object
    const serviceDetail = row.service_detail_id
      ? {
          id: row.service_detail_id,
          [serviceConfig.joinField]: row.service_reference_id,
          [serviceConfig.joinTable.slice(0, -1).toLowerCase()]: {
            id: row.reference_id,
            name: row.reference_name,
          },
        }
      : null;

    // Add service-specific data
    switch (serviceName) {
      case ServiceName.DRUGS:
        return { ...baseData, drug: serviceDetail };
      case ServiceName.TESTS:
        return { ...baseData, test: serviceDetail };
      case ServiceName.INVESTIGATIONS:
        return { ...baseData, investigation: serviceDetail };
      case ServiceName.SERVICES:
        return { ...baseData, service: serviceDetail };
      case ServiceName.ITEMS:
        return { ...baseData, item: serviceDetail };
      default:
        return baseData;
    }
  });
};
