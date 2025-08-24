import axios from 'axios';

// Dialysis Visits
export const createDialysisVisit = async ({ commit }, visitData) => {
  try {
    const response = await axios.post('/dialysis/visits', visitData);
    if (response.data.success) {
      commit('SET_DIALYSIS_VISIT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create dialysis visit');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create dialysis visit'
    );
  }
};

export const getDialysisVisits = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/dialysis/visits', { params });
    if (response.data.success) {
      commit('SET_DIALYSIS_VISITS', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch dialysis visits');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch dialysis visits'
    );
  }
};

export const getDialysisVisit = async ({ commit }, visitId) => {
  try {
    const response = await axios.get(`/dialysis/visits/${visitId}`);
    if (response.data.success) {
      commit('SET_DIALYSIS_VISIT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch dialysis visit');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch dialysis visit'
    );
  }
};

export const updateDialysisVisit = async ({ commit }, { id, ...updateData }) => {
  const { dialysis_info } = updateData;
  try {
    const response = await axios.put(`/dialysis/visits/${id}`, dialysis_info);
    if (response.data.success) {
      commit('UPDATE_DIALYSIS_VISIT', { id, data: response.data.data });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update dialysis visit');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update dialysis visit'
    );
  }
};

// Dialysis Treatment
export const startDialysisTreatment = async (
  { commit },
  { visitId, started_by, treatment_data }
) => {
  try {
    const response = await axios.post(`/dialysis/visits/${visitId}/start`, {
      started_by,
      treatment_data,
    });
    if (response.data.success) {
      commit('SET_DIALYSIS_TREATMENT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to start dialysis treatment');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to start dialysis treatment'
    );
  }
};

export const completeDialysisTreatment = async (
  { commit },
  { visitId, completed_by, treatment_data }
) => {
  try {
    const response = await axios.post(`/dialysis/visits/${visitId}/complete`, {
      completed_by,
      treatment_data,
    });
    if (response.data.success) {
      commit('UPDATE_DIALYSIS_TREATMENT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to complete dialysis treatment');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to complete dialysis treatment'
    );
  }
};

export const updateDialysisTreatment = async ({ commit }, { visitId, treatmentId, updateData }) => {
  try {
    const response = await axios.put(`/dialysis/visits/${visitId}/treatment`, {
      treatment_id: treatmentId,
      ...updateData,
    });
    if (response.data.success) {
      commit('UPDATE_DIALYSIS_TREATMENT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update dialysis treatment');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update dialysis treatment'
    );
  }
};

// Dialysis Management
export const cancelDialysisVisit = async (
  { commit },
  { visitId, cancelled_by, cancellation_reason }
) => {
  try {
    const response = await axios.post(`/dialysis/visits/${visitId}/cancel`, {
      cancelled_by,
      cancellation_reason,
    });
    if (response.data.success) {
      commit('UPDATE_DIALYSIS_VISIT', { id: visitId, data: response.data.data });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to cancel dialysis visit');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to cancel dialysis visit'
    );
  }
};

// Dialysis Analytics
export const getDialysisStatistics = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/dialysis/statistics', { params });
    if (response.data.success) {
      commit('SET_DIALYSIS_STATISTICS', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch dialysis statistics');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch dialysis statistics'
    );
  }
};

export const getPatientDialysisHistory = async (
  { commit },
  { patientId, page = 1, limit = 10 }
) => {
  try {
    const response = await axios.get(`/dialysis/patients/${patientId}/history`, {
      params: { page, limit },
    });
    if (response.data.success) {
      commit('SET_PATIENT_DIALYSIS_HISTORY', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch patient dialysis history');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch patient dialysis history'
    );
  }
};

export const getDoctorDialysisSchedule = async ({ commit }, { doctorId, date_from, date_to }) => {
  try {
    const response = await axios.get(`/dialysis/doctors/${doctorId}/schedule`, {
      params: { date_from, date_to },
    });
    if (response.data.success) {
      commit('SET_DOCTOR_DIALYSIS_SCHEDULE', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch doctor dialysis schedule');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch doctor dialysis schedule'
    );
  }
};

export const getNurseDialysisSchedule = async ({ commit }, { nurseId, date_from, date_to }) => {
  try {
    const response = await axios.get(`/dialysis/nurses/${nurseId}/schedule`, {
      params: { date_from, date_to },
    });
    if (response.data.success) {
      commit('SET_NURSE_DIALYSIS_SCHEDULE', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch nurse dialysis schedule');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch nurse dialysis schedule'
    );
  }
};

// Dialysis Export
export const exportDialysisReport = async ({ commit }, { date_from, date_to, format = 'pdf' }) => {
  try {
    const response = await axios.get('/dialysis/reports/export', {
      params: { date_from, date_to, format },
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dialysis-report.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    commit('SET_DIALYSIS_REPORT', response.data);

    return { success: true, message: 'Report exported successfully' };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to export dialysis report'
    );
  }
};

// ========================================
// DIALYSIS ASSESSMENT ACTIONS
// ========================================

export const createDialysisAssessment = async ({ commit }, { visitId, assessmentData }) => {
  try {
    const response = await axios.post(`/dialysis/visits/${visitId}/assessment`, {
      visit_id: visitId,
      ...assessmentData,
    });
    if (response.data.success) {
      commit('SET_DIALYSIS_ASSESSMENT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create dialysis assessment');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create dialysis assessment'
    );
  }
};

export const updateDialysisAssessment = async (
  { commit },
  { visitId, assessmentId, updateData }
) => {
  try {
    const response = await axios.put(`/dialysis/visits/${visitId}/assessment`, {
      assessment_id: assessmentId,
      ...updateData,
    });
    if (response.data.success) {
      commit('UPDATE_DIALYSIS_ASSESSMENT', { id: assessmentId, data: response.data.data });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update dialysis assessment');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update dialysis assessment'
    );
  }
};

export const getDialysisAssessment = async ({ commit }, visitId) => {
  try {
    const response = await axios.get(`/dialysis/visits/${visitId}/assessment`);
    if (response.data.success) {
      commit('SET_DIALYSIS_ASSESSMENT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch dialysis assessment');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch dialysis assessment'
    );
  }
};

// ========================================
// DIALYSIS VITALS ACTIONS
// ========================================

export const createDialysisVitals = async ({ commit }, { visitId, staffId, vitalsData }) => {
  try {
    const response = await axios.post(`/dialysis/visits/${visitId}/vitals`, {
      visit_id: visitId,
      staff_id: staffId,
      ...vitalsData,
    });
    if (response.data.success) {
      commit('ADD_DIALYSIS_VITALS', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create dialysis vitals');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create dialysis vitals'
    );
  }
};

export const getDialysisVitals = async ({ commit }, visitId) => {
  try {
    const response = await axios.get(`/dialysis/visits/${visitId}/vitals`);
    if (response.data.success) {
      commit('SET_DIALYSIS_VITALS', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch dialysis vitals');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch dialysis vitals'
    );
  }
};

// ========================================
// DIALYSIS NOTES ACTIONS
// ========================================

export const createDialysisNotes = async ({ commit }, { visitId, staffId, notesData }) => {
  try {
    const response = await axios.post(`/dialysis/visits/${visitId}/notes`, {
      visit_id: visitId,
      staff_id: staffId,
      ...notesData,
    });
    if (response.data.success) {
      commit('ADD_DIALYSIS_NOTES', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create dialysis notes');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create dialysis notes'
    );
  }
};

export const updateDialysisNotes = async ({ commit }, { visitId, notesId, updateData }) => {
  try {
    const response = await axios.put(`/dialysis/visits/${visitId}/notes`, {
      notes_id: notesId,
      ...updateData,
    });
    if (response.data.success) {
      commit('UPDATE_DIALYSIS_NOTES', { id: notesId, data: response.data.data });
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update dialysis notes');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update dialysis notes'
    );
  }
};

export const getDialysisNotes = async ({ commit }, { visitId, type = null }) => {
  try {
    const params = type ? { type } : {};
    const response = await axios.get(`/dialysis/visits/${visitId}/notes`, { params });
    if (response.data.success) {
      commit('SET_DIALYSIS_NOTES', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch dialysis notes');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch dialysis notes'
    );
  }
};

// ========================================
// COMPREHENSIVE DATA ACTIONS
// ========================================

export const getComprehensiveDialysisVisit = async ({ commit }, visitId) => {
  try {
    const response = await axios.get(`/dialysis/visits/${visitId}/comprehensive`);
    if (response.data.success) {
      const data = response.data.data;
      commit('SET_DIALYSIS_VISIT', data.visit);
      commit('SET_DIALYSIS_ASSESSMENT', data.assessment);
      commit('SET_DIALYSIS_VITALS', data.vitals);
      commit('SET_DIALYSIS_NOTES', data.notes);
      commit('SET_DIALYSIS_TREATMENTS', data.treatments);
      return data;
    }
    throw new Error(response.data.message || 'Failed to fetch comprehensive dialysis visit data');
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to fetch comprehensive dialysis visit data'
    );
  }
};

// ========================================
// ICD10 DIAGNOSIS ACTIONS
// ========================================

export const searchICD10Diagnoses = async ({ commit }, { searchTerm, limit = 20 }) => {
  try {
    const response = await axios.get('/dialysis/icd10/search', {
      params: { q: searchTerm, limit },
    });
    if (response.data.success) {
      commit('SET_ICD10_DIAGNOSES', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search ICD10 diagnoses');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to search ICD10 diagnoses'
    );
  }
};

// Legacy actions for backward compatibility (these will be removed once components are updated)
export const createTreatment = async ({ commit }, treatmentData) => {
  // This should be replaced with startDialysisTreatment
  console.warn('createTreatment is deprecated. Use startDialysisTreatment instead.');
  return startDialysisTreatment({ commit }, treatmentData);
};

export const updateTreatment = async ({ commit }, { id, ...updateData }) => {
  // This should be replaced with updateDialysisVisit
  console.warn('updateTreatment is deprecated. Use updateDialysisVisit instead.');
  return updateDialysisVisit({ commit }, { id, ...updateData });
};

export const createAppointment = async ({ commit }, appointmentData) => {
  // This should be replaced with createDialysisVisit
  console.warn('createAppointment is deprecated. Use createDialysisVisit instead.');
  return createDialysisVisit({ commit }, appointmentData);
};

export const updateAppointment = async ({ commit }, { id, ...updateData }) => {
  // This should be replaced with updateDialysisVisit
  console.warn('updateAppointment is deprecated. Use updateDialysisVisit instead.');
  return updateDialysisVisit({ commit }, { id, ...updateData });
};

export const cancelAppointment = async ({ commit }, appointmentId) => {
  // This should be replaced with cancelDialysisVisit
  console.warn('cancelAppointment is deprecated. Use cancelDialysisVisit instead.');
  return cancelDialysisVisit(
    { commit },
    { visitId: appointmentId, cancelled_by: 1, cancellation_reason: 'Cancelled by user' }
  );
};
