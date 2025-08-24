import axios from 'axios';

// Emergency Visits
export const createEmergencyVisit = async ({ commit }, visitData) => {
  try {
    const response = await axios.post('/emergency/visits', visitData);
    if (response.data.success) {
      commit('SET_EMERGENCY_VISIT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create emergency visit');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create emergency visit'
    );
  }
};

export const updateEmergencyVisit = async ({ commit }, { id, ...visitData }) => {
  try {
    const response = await axios.put(`/emergency/visits/${id}`, visitData);
    if (response.data.success) {
      commit('UPDATE_EMERGENCY_VISIT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update emergency visit');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update emergency visit'
    );
  }
};

export const getEmergencyVisits = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/emergency/visits', { params });
    if (response.data.success) {
      commit('SET_EMERGENCY_VISITS', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch emergency visits');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch emergency visits'
    );
  }
};

export const getEmergencyVisit = async ({ commit }, id) => {
  try {
    const response = await axios.get(`/emergency/visits/${id}`);
    if (response.data.success) {
      commit('SET_EMERGENCY_VISIT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch emergency visit');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch emergency visit'
    );
  }
};

export const dischargeEmergencyPatient = async ({ commit }, { id, dischargeData }) => {
  try {
    const response = await axios.post(`/emergency/visits/${id}/discharge`, dischargeData);
    if (response.data.success) {
      commit('UPDATE_EMERGENCY_VISIT', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to discharge emergency patient');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to discharge emergency patient'
    );
  }
};

// Emergency Triage
export const createEmergencyTriage = async ({ commit }, triageData) => {
  try {
    const response = await axios.post('/emergency/triage', triageData);
    if (response.data.success) {
      commit('SET_EMERGENCY_TRIAGE', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create emergency triage');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create emergency triage'
    );
  }
};

export const updateEmergencyTriage = async ({ commit }, { id, ...triageData }) => {
  try {
    const response = await axios.put(`/emergency/triage/${id}`, triageData);
    if (response.data.success) {
      commit('UPDATE_EMERGENCY_TRIAGE', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update emergency triage');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update emergency triage'
    );
  }
};

export const getEmergencyTriage = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/emergency/triage', { params });
    if (response.data.success) {
      commit('SET_EMERGENCY_TRIAGE_LIST', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch emergency triage');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch emergency triage'
    );
  }
};

// Emergency Beds
export const createEmergencyBed = async ({ commit }, bedData) => {
  try {
    const response = await axios.post('/emergency/beds', bedData);
    if (response.data.success) {
      commit('SET_EMERGENCY_BED', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create emergency bed');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create emergency bed'
    );
  }
};

export const updateEmergencyBed = async ({ commit }, { id, ...bedData }) => {
  try {
    const response = await axios.put(`/emergency/beds/${id}`, bedData);
    if (response.data.success) {
      commit('UPDATE_EMERGENCY_BED', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update emergency bed');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update emergency bed'
    );
  }
};

export const getEmergencyBeds = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/emergency/beds', { params });
    if (response.data.success) {
      commit('SET_EMERGENCY_BEDS', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch emergency beds');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch emergency beds'
    );
  }
};

export const assignBedToPatient = async ({ commit }, { bedId, patientId, assignmentData }) => {
  try {
    const response = await axios.post(`/emergency/beds/${bedId}/assign`, {
      patient_id: patientId,
      ...assignmentData,
    });
    if (response.data.success) {
      commit('UPDATE_EMERGENCY_BED', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to assign bed to patient');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to assign bed to patient'
    );
  }
};

export const releaseBed = async ({ commit }, { bedId, releaseData }) => {
  try {
    const response = await axios.post(`/emergency/beds/${bedId}/release`, releaseData);
    if (response.data.success) {
      commit('UPDATE_EMERGENCY_BED', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to release bed');
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to release bed');
  }
};

// Emergency Procedures
export const createEmergencyProcedure = async ({ commit }, procedureData) => {
  try {
    const response = await axios.post('/emergency/procedures', procedureData);
    if (response.data.success) {
      commit('SET_EMERGENCY_PROCEDURE', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create emergency procedure');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create emergency procedure'
    );
  }
};

export const updateEmergencyProcedure = async ({ commit }, { id, ...procedureData }) => {
  try {
    const response = await axios.put(`/emergency/procedures/${id}`, procedureData);
    if (response.data.success) {
      commit('UPDATE_EMERGENCY_PROCEDURE', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update emergency procedure');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update emergency procedure'
    );
  }
};

export const getEmergencyProcedures = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/emergency/procedures', { params });
    if (response.data.success) {
      commit('SET_EMERGENCY_PROCEDURES', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch emergency procedures');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch emergency procedures'
    );
  }
};

// Emergency Statistics and Reports
export const getEmergencyStatistics = async ({ commit }, params = {}) => {
  try {
    const response = await axios.get('/emergency/statistics', { params });
    if (response.data.success) {
      commit('SET_EMERGENCY_STATISTICS', response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch emergency statistics');
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch emergency statistics'
    );
  }
};

export const exportEmergencyReport = async (_, params = {}) => {
  try {
    const response = await axios.get('/emergency/export', {
      params,
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `emergency-report-${new Date().toISOString().split('T')[0]}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Emergency report exported successfully' };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to export emergency report'
    );
  }
};
