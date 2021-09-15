export default {
  searchTests: state => (id, name) =>
    state.tests.filter(test => test.name === name && test.sample_id === id)
}
