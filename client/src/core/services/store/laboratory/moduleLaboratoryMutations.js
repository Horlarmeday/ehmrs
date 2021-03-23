export default {
  ADD_TEST(state, test) {
    state.tests.unshift(test);
  },

  SET_TESTS(state, tests) {
    state.tests = tests;
  },

  SET_TESTS_TOTAL(state, total) {
    state.total = total;
  },

  SET_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  UPDATE_TEST(state, test) {
    const testIndex = state.tests.findIndex(p => p.id === test.id);
    Object.assign(state.tests[testIndex], test);
  },

  /**
   * SAMPLES
   */
  ADD_SAMPLE(state, sample) {
    state.samples.unshift(sample);
  },

  SET_SAMPLES(state, samples) {
    state.samples = samples;
  },

  SET_SAMPLES_TOTAL(state, total) {
    state.totalSample = total;
  },

  SET_SAMPLE_PAGES(state, pages) {
    state.totalPages = pages;
  },

  UPDATE_SAMPLE(state, sample) {
    const sampleIndex = state.samples.findIndex(p => p.id === sample.id);
    Object.assign(state.samples[sampleIndex], sample);
  },

  /**
   * NHIS TESTS
   */
  ADD_NHIS_TEST(state, test) {
    state.nhisTests.unshift(test);
  },

  SET_NHIS_TESTS(state, nhisTests) {
    state.nhisTests = nhisTests;
  },

  SET_NHIS_TESTS_TOTAL(state, total) {
    state.totalNhisTest = total;
  },

  SET_NHIS_NUMB_PAGES(state, pages) {
    state.totalNhisPages = pages;
  },

  UPDATE_NHIS_TEST(state, test) {
    const testIndex = state.nhisTests.findIndex(p => p.id === test.id);
    Object.assign(state.nhisTests[testIndex], test);
  }
};
