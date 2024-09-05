import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTabKey: null,
};

const readOnlyTabSlice = createSlice({
  name: 'readOnlyTabs',
  initialState,
  reducers: {
    setActiveTabKey: (state, action) => {
      state.activeTabKey = action.payload;
    },
  },
});

export const { setActiveTabKey } = readOnlyTabSlice.actions;

export const getActiveTabKey = (state) => state?.readOnlyTabs?.activeTabKey;

export default readOnlyTabSlice.reducer;
