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
   * NHIS TESTS - DEPRECATED
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
  },

  /**
   * SAMPLES TO COLLECT
   */
  SET_SAMPLES_TO_COLLECT(state, samples) {
    state.samplesToCollect = samples;
  },

  SET_SAMPLES_TO_COLLECT_TOTAL(state, total) {
    state.totalSamplesToCollect = total;
  },

  SET_SAMPLES_TO_COLLECT_PAGES(state, pages) {
    state.totalSamplesToCollectPages = pages;
  },

  SET_SAMPLE_TO_COLLECT(state, sample) {
    state.sampleToCollect = sample;
  },

  GEN_ACCESSION_NUMBER(state, number) {
    state.accession_number = number;
  },

  COLLECT_SAMPLES(state, number) {
    console.log(number);
  },

  /**
   * SAMPLES COLLECTED
   */
  SET_SAMPLES_COLLECTED(state, samples) {
    state.samplesCollected = samples;
  },

  SET_SAMPLES_COLLECTED_TOTAL(state, total) {
    state.totalSamplesCollected = total;
  },

  SET_SAMPLES_COLLECTED_PAGES(state, pages) {
    state.totalSamplesCollectedPages = pages;
  },

  SET_SAMPLE_COLLECTED(state, sample) {
    state.sampleCollected = sample;
  },

  /****
   * TEST RESULT
   */
  SET_TEST_RESULT(state, result) {
    state.result = result;
  },

  SET_TEST_RESULTS(state, results) {
    state.results = results;
  },

  SET_TEST_RESULTS_TOTAL(state, total) {
    state.totalTestResults = total;
  },

  SET_TEST_RESULTS_PAGES(state, pages) {
    state.totalTestResultsPages = pages;
  },

  /****
   * VERIFIED TESTS
   */
  SET_VERIFIED_TEST(state, test) {
    state.verifiedTest = test;
  },

  SET_VERIFIED_TESTS(state, tests) {
    state.verifiedTests = tests;
  },

  SET_VERIFIED_TESTS_TOTAL(state, total) {
    state.totalVerifiedTest = total;
  },

  SET_VERIFIED_TESTS_PAGES(state, pages) {
    state.totalVerifiedTestPages = pages;
  },

  /****
   * STATS
   */
  SET_TODAY_STATS(state, stat) {
    state.stats = stat;
  },

  /****
   * TEST PRESCRIPTION
   */
  SET_TEST_PRESCRIPTION(state, test) {
    state.testPrescription = test;
  },

  /**
   * SELECTED TESTS
   */
  ADD_SELECTED_TEST(state, test) {
    state.selectedTests.push(test);
  },

  REMOVE_SELECTED_TEST(state, test) {
    const testIndex = state.selectedTests.findIndex(({ id }) => id === test.id);
    state.selectedTests.splice(testIndex, 1);
  },

  EMPTY_SELECTED_TESTS(state, tests) {
    state.selectedTests = tests;
  },

  // eslint-disable-next-line no-unused-vars
  SET_UPDATED_TESTS_RESULTS(state, tests) {},
};
