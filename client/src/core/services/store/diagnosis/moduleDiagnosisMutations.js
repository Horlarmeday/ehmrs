export default {
  /**
   * ICPC2 Diseases
   */
  ADD_ICPC2DISEASE(state, disease) {
    state.icpc2Diseases.push(disease);
  },

  SET_ICPC2DISEASES(state, diseases) {
    state.icpc2Diseases = diseases;
  },

  SET_ICPC2DISEASES_TOTAL(state, total) {
    state.total = total;
  },

  SET_ICPC2_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  UPDATE_ICPC2DISEASE(state, disease) {
    const diseaseIndex = state.icpc2Diseases.findIndex(p => p.id === disease.id);
    Object.assign(state.icpc2Diseases[diseaseIndex], disease);
  },

  /**
   * ICD10 Diseases
   */
  ADD_ICD10DISEASE(state, disease) {
    state.icd10Diseases.push(disease);
  },

  SET_ICD10DISEASES(state, diseases) {
    state.icd10Diseases = diseases;
  },

  SET_ICD10DISEASES_TOTAL(state, total) {
    state.total = total;
  },

  SET_ICD10_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  UPDATE_ICD10DISEASE(state, disease) {
    const diseaseIndex = state.icd10Diseases.findIndex(p => p.id === disease.id);
    Object.assign(state.icd10Diseases[diseaseIndex], disease);
  },
};
