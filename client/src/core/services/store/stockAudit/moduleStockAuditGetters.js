export const getStockAudits = state => state.audits;

export const getStockAuditById = state => id => {
  return state.audits.find(audit => audit.id === id);
};

export const isLoading = state => state.loading;

export const getError = state => state.error;

// Filter audits by status
export const getAuditsByStatus = state => status => {
  return state.audits.filter(audit => audit.status === status);
};

// Filter audits by date range
export const getAuditsByDateRange = state => (startDate, endDate) => {
  return state.audits.filter(audit => {
    const auditDate = new Date(audit.audit_date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return auditDate >= start && auditDate <= end;
  });
};

// Filter audits by auditor
export const getAuditsByAuditor = state => auditorId => {
  return state.audits.filter(audit => audit.auditor_id === auditorId);
};

// Get pending audits
export const getPendingAudits = state => {
  return state.audits.filter(audit => audit.status === 'Pending');
};

// Get in progress audits
export const getInProgressAudits = state => {
  return state.audits.filter(audit => audit.status === 'In Progress');
};

// Get completed audits
export const getCompletedAudits = state => {
  return state.audits.filter(audit => audit.status === 'Completed');
};

// Get approved audits
export const getApprovedAudits = state => {
  return state.audits.filter(audit => audit.status === 'Approved');
};

// Get rejected audits
export const getRejectedAudits = state => {
  return state.audits.filter(audit => audit.status === 'Rejected');
};
