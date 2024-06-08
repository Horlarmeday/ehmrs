import sequelizeConnection from '../../database/config/config';
import {
  PaymentHistory,
  PrescribedAdditionalItem,
  PrescribedDrug,
  PrescribedInvestigation,
  PrescribedService,
  PrescribedTest,
} from '../../database/models';
import { PaymentStatus } from '../../database/models/prescribedDrug';
import { ServiceName } from '../../database/models/paymentHistory';
import { generateRandomNumbers } from '../../core/helpers/helper';
import { Transaction } from 'sequelize';

export const createPaymentHistory = async data => {
  const {
    type,
    mode_of_payment,
    totalAmount,
    selectedItems,
    staff_id,
    visit_id,
    patient_id,
  } = data;

  const serviceMappings = {
    Drugs: {
      model: PrescribedDrug,
      serviceName: ServiceName.DRUGS,
      narration: 'Prescribed Drugs',
    },
    Tests: {
      model: PrescribedTest,
      serviceName: ServiceName.TESTS,
      narration: 'Prescribed Tests',
    },
    Investigations: {
      model: PrescribedInvestigation,
      serviceName: ServiceName.INVESTIGATIONS,
      narration: 'Prescribed Investigations',
    },
    Items: {
      model: PrescribedAdditionalItem,
      serviceName: ServiceName.ITEMS,
      narration: 'Prescribed Items',
    },
    Services: {
      model: PrescribedService,
      serviceName: ServiceName.SERVICES,
      narration: 'Prescribed Services',
    },
  };

  const processPayment = async ({ model, serviceName, narration }, transaction: Transaction) => {
    await model.update(
      { payment_status: PaymentStatus.PAID },
      { where: { id: selectedItems }, transaction }
    );
    const mappedItems = selectedItems.map((item: any) => ({
      service_id: item,
      service_name: serviceName,
      narration,
      transaction_id: `${generateRandomNumbers(7)}-${Date.now()}`,
      transaction_date: Date.now(),
      amount: totalAmount,
      mode_of_payment,
      staff_id,
      visit_id,
      patient_id,
    }));
    await PaymentHistory.bulkCreate(mappedItems, { transaction });
  };

  await sequelizeConnection.transaction(async t => {
    if (serviceMappings[type]) {
      await processPayment(serviceMappings[type], t);
      return true;
    }
    return false;
  });
};
