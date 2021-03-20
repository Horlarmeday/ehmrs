import countries from "./countries.json";
import states from "./states.json";
import cities from "./cities.json";

function getCountries() {
  return countries.countries;
}

function getStates() {
  return states.states;
}

function getCities() {
  return cities.cities;
}

function getStateById(id) {
  const states = getStates();
  return states.filter(state => state.country_id === id.toString());
}
function getCityById(id) {
  const cities = getCities();
  return cities.filter(city => city.state_id === id.toString());
}

export { getCountries, getStateById, getCityById };
