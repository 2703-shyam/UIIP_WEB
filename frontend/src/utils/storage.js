export const storage = {
  getToken: () => sessionStorage.getItem('uiip_token'),
  setToken: (token) => sessionStorage.setItem('uiip_token', token),
  removeToken: () => sessionStorage.removeItem('uiip_token'),

  getUser: () => {
    const user = sessionStorage.getItem('uiip_user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => sessionStorage.setItem('uiip_user', JSON.stringify(user)),
  removeUser: () => sessionStorage.removeItem('uiip_user'),

  clearLegacyPersistentSession: () => {
    localStorage.removeItem('uiip_token');
    localStorage.removeItem('uiip_user');
  },

  clear: () => {
    sessionStorage.removeItem('uiip_token');
    sessionStorage.removeItem('uiip_user');
    localStorage.removeItem('uiip_token');
    localStorage.removeItem('uiip_user');
  }
};
