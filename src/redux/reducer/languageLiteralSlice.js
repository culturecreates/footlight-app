import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: false,
  activeFallbackFieldsInfo: {},
};

export const languageLiteralSlice = createSlice({
  name: 'languageLiteral',
  initialState,
  reducers: {
    setLanguageLiteralBannerDisplayStatus: (state, action) => {
      state.status = action.payload;
    },
    setActiveFallbackFieldsInfo: (state, action) => {
      state.activeFallbackFieldsInfo = action.payload;
    },
  },
});

export const { setLanguageLiteralBannerDisplayStatus, setActiveFallbackFieldsInfo } = languageLiteralSlice.actions;

export const getLanguageLiteralBannerDisplayStatus = (state) => state?.languageLiteral?.status;
export const getActiveFallbackFieldsInfo = (state) => state?.languageLiteral?.activeFallbackFieldsInfo;

export default languageLiteralSlice.reducer;
