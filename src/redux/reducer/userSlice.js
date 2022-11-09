import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  _id: '',
  accessToken: '',
  refreshToken: '',
  isEmailVerified: false,
  lastLogin: '',
  status: '',
  firstName: '',
  lastName: '',
  profileImage: '',
  email: '',
  timezone: '',
  userRoleInfo: {
    editingPermissions: [''],
    name: '',
    pagePermissions: ['']
  }
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, { payload: { accessToken, refreshToken } }) => {
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
    },
    setUser: (state, action) => {
      return {
        ...state,
        ...action.payload
      };
    },
    clearUser: () => {
      Cookies.remove('accessToken');
      return initialState;
    }
  }
});

export const { userDetails, logout } = userSlice.actions;

export const getUserDetails = (state) => state.user;

export default userSlice.reducer;
