import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  language: 'en',
};

export const interfaceLanguageSlice = createSlice({
  name: 'interfaceLanguage',
  initialState,
  reducers: {
    setInterfaceLanguage: (state, action) => {
      Cookies.set('interfaceLanguage', action.payload);
      state.language = action.payload;
    },
  },
});

export const { setInterfaceLanguage } = interfaceLanguageSlice.actions;

export const getinterfaceLanguage = (state) => state.language;

export default interfaceLanguageSlice.reducer;
