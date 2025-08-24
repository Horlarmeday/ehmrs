export const getDialysisVisits = state => state.visits;

export const getDialysisVisitById = state => id => {
  return state.visits.find(visit => visit.id === id);
};

export const getDialysisTreatments = state => state.treatments;

export const getDialysisTreatmentById = state => id => {
  return state.treatments.find(treatment => treatment.id === id);
};

export const getDialysisStatistics = state => state.statistics;

export const getPatientDialysisHistory = state => state.patientHistory;

export const getDoctorDialysisSchedule = state => state.doctorSchedule;

export const getNurseDialysisSchedule = state => state.nurseSchedule;

export const isLoading = state => state.loading;

export const getError = state => state.error;

export const getVisitsByStatus = state => status => {
  return state.visits.filter(visit => visit.status === status);
};

export const getVisitsByDate = state => date => {
  return state.visits.filter(visit => {
    const visitDate = new Date(visit.visit_date).toDateString();
    const targetDate = new Date(date).toDateString();
    return visitDate === targetDate;
  });
};

export const getVisitsByPatient = state => patientId => {
  return state.visits.filter(visit => visit.patient_id === patientId);
};

export const getVisitsByDoctor = state => doctorId => {
  return state.visits.filter(visit => visit.doctor_id === doctorId);
};
