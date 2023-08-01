export default {
  status: '',
  token: localStorage.getItem('user_token') || '',
  user: null,
  isLoggedInUser: null,
  search: null,
};
