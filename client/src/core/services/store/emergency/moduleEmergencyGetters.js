export const getEmergencyVisits = state => state.visits;

export const getEmergencyVisitById = state => id => {
  return state.visits.find(visit => visit.id === id);
};

export const getEmergencyTriage = state => state.triageList;

export const getEmergencyTriageById = state => id => {
  return state.triageList.find(triage => triage.id === id);
};

export const getEmergencyBeds = state => state.beds;

export const getEmergencyBedById = state => id => {
  return state.beds.find(bed => bed.id === id);
};

export const getEmergencyProcedures = state => state.procedures;

export const getEmergencyProcedureById = state => id => {
  return state.procedures.find(procedure => procedure.id === id);
};

export const getEmergencyStatistics = state => state.statistics;

export const isLoading = state => state.loading;

export const getError = state => state.error;

// Filter visits by priority
export const getVisitsByPriority = state => priority => {
  return state.visits.filter(visit => visit.priority === priority);
};

// Filter visits by status
export const getVisitsByStatus = state => status => {
  return state.visits.filter(visit => visit.status === status);
};

// Get active emergency visits
export const getActiveEmergencyVisits = state => {
  return state.visits.filter(visit => visit.status === 'Active');
};

// Get available emergency beds
export const getAvailableEmergencyBeds = state => {
  return state.beds.filter(bed => bed.status === 'Available');
};

// Get occupied emergency beds
export const getOccupiedEmergencyBeds = state => {
  return state.beds.filter(bed => bed.status === 'Occupied');
};

// Filter beds by type
export const getBedsByType = state => bedType => {
  return state.beds.filter(bed => bed.bed_type === bedType);
};

// Get emergency visits by date range
export const getVisitsByDateRange = state => (startDate, endDate) => {
  return state.visits.filter(visit => {
    const visitDate = new Date(visit.arrival_time);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return visitDate >= start && visitDate <= end;
  });
};

// Get priority statistics
export const getPriorityStatistics = state => {
  const priorities = ['Red', 'Orange', 'Yellow', 'Green', 'Blue'];
  return priorities.map(priority => ({
    priority,
    count: state.visits.filter(visit => visit.priority === priority).length,
  }));
};
