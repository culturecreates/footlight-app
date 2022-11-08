import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userDetails: (state, action) => {
      state.value = action.payload;
    },
    logout: (state) => {
      state.value = null;
    }
  }
});

export const { userDetails, logout } = userSlice.actions;

export const getUserDetails = (state) => state.user;

export default userSlice.reducer;
