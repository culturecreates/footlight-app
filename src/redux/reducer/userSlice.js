import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  accessToken: '',
  expiredTime: '',
  refreshToken: {
    token: '',
    expiredTime: '',
  },
  user: {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    profileImage: '',
    roles: [],
    isSuperAdmin: false,
    interfaceLanguage: '',
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, { payload: { accessToken } }) => {
      state.accessToken = accessToken;
    },
    setUser: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    clearUser: () => {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      localStorage.removeItem('persist:root');
      return initialState;
    },
  },
});

export const { setToken, setUser, clearUser } = userSlice.actions;

export const getUserDetails = (state) => state.user;

export default userSlice.reducer;
