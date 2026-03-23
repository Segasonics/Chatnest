import { createSlice } from '@reduxjs/toolkit';

const persisted = JSON.parse(localStorage.getItem('chatnest_auth') || 'null');

const initialState = {
  accessToken: persisted?.accessToken || null,
  user: persisted?.user || null,
  isAuthenticated: Boolean(persisted?.accessToken)
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem(
        'chatnest_auth',
        JSON.stringify({ accessToken: state.accessToken, user: state.user })
      );
    },
    clearAuth(state) {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('chatnest_auth');
    }
  }
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
