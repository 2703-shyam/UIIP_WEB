export const storage = {
  getToken: () => localStorage.getItem('uiip_token'),
  setToken: (token) => localStorage.setItem('uiip_token', token),
  removeToken: () => localStorage.removeItem('uiip_token'),

  getUser: () => {
    const user = localStorage.getItem('uiip_user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem('uiip_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('uiip_user'),

  clear: () => {
    localStorage.removeItem('uiip_token');
    localStorage.removeItem('uiip_user');
  }
};
