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

// Filter orders by supplier
export const getOrdersBySupplier = state => supplierId => {
  return state.orders.filter(order => order.supplier_id === supplierId);
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
