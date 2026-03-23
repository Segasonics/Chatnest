import { createSlice } from '@reduxjs/toolkit';

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    activeWorkspaceId: localStorage.getItem('chatnest_workspace') || null
  },
  reducers: {
    setActiveWorkspace(state, action) {
      state.activeWorkspaceId = action.payload;
      localStorage.setItem('chatnest_workspace', action.payload);
    },
    clearActiveWorkspace(state) {
      state.activeWorkspaceId = null;
      localStorage.removeItem('chatnest_workspace');
    }
  }
});

export const { setActiveWorkspace, clearActiveWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
