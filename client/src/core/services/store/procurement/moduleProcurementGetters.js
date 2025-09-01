export const getProcurementOrders = state => state.orders;

export const getProcurementOrderById = state => id => {
  return state.orders.find(order => order.id === id);
};

export const isLoading = state => state.loading;

export const getError = state => state.error;

// Filter orders by status
export const getOrdersByStatus = state => status => {
  return state.orders.filter(order => order.status === status);
};

// Filter orders by date range
export const getOrdersByDateRange = state => (startDate, endDate) => {
  return state.orders.filter(order => {
    const orderDate = new Date(order.order_date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return orderDate >= start && orderDate <= end;
  });
};

// Filter orders by vendor
export const getOrdersByVendor = state => vendorId => {
  return state.orders.filter(order => order.vendor_id === vendorId);
};

// Get pending approval orders
export const getPendingApprovalOrders = state => {
  return state.orders.filter(order => order.status === 'Pending Approval');
};

// Get approved orders
export const getApprovedOrders = state => {
  return state.orders.filter(order => order.status === 'Approved');
};

// Get sent orders
export const getSentOrders = state => {
  return state.orders.filter(order => order.status === 'Sent');
};

// Get received orders
export const getReceivedOrders = state => {
  return state.orders.filter(order => order.status === 'Received');
};

// Get cancelled orders
export const getCancelledOrders = state => {
  return state.orders.filter(order => order.status === 'Cancelled');
};

// Get procurement statistics
export const getProcurementStatistics = state => state.statistics;

// Get current order
export const getCurrentOrder = state => state.currentOrder;

// Get reports
export const getProcurementReports = state => state.reports;
