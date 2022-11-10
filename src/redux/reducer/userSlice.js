import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  accessToken:
    '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MzA4ZTcxZWVlYjMxZTAwNGQyYjAyMjkiLCJpYXQiOjE2Njc5ODE4MDAsImV4cCI6MTY2ODA2ODIwMH0.PRMhplCWc4Oq2kMot4z8FQujP94Iu5YZ2-9tv-F-qlI',
  expiredTime: '',
  refreshToken: {
    token: '',
    expiredTime: ''
  },
  user: {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    profileImage: '',
    roles: [],
    isSuperAdmin: false,
    interfaceLanguage: ''
  }
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
        ...action.payload
      };
    },
    clearUser: () => {
      Cookies.remove('accessToken');
      return initialState;
    }
  }
});

export const { setToken, setUser, clearUser } = userSlice.actions;

export const getUserDetails = (state) => state.user;

export default userSlice.reducer;
