import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: false,
  activeFallbackFieldsInfo: {},
  isBannerDismissed: false,
};

export const languageLiteralSlice = createSlice({
  name: 'languageLiteral',
  initialState,
  reducers: {
    setLanguageLiteralBannerDisplayStatus: (state, action) => {
      state.status = action.payload;
    },
    setActiveFallbackFieldsInfo: (state, action) => {
      if (action.payload?.method == 'remove') state.activeFallbackFieldsInfo = action.payload.data;
      else state.activeFallbackFieldsInfo = { ...state.activeFallbackFieldsInfo, ...action.payload.data };
    },
    clearActiveFallbackFieldsInfo: (state) => {
      state.activeFallbackFieldsInfo = {};
    },
    setBannerDismissed: (state, action) => {
      state.isBannerDismissed = action.payload;
    },
  },
});

export const {
  setLanguageLiteralBannerDisplayStatus,
  setActiveFallbackFieldsInfo,
  clearActiveFallbackFieldsInfo,
  setBannerDismissed,
} = languageLiteralSlice.actions;

export const getLanguageLiteralBannerDisplayStatus = (state) => state?.languageLiteral?.status;
export const getActiveFallbackFieldsInfo = (state) => state?.languageLiteral?.activeFallbackFieldsInfo;
export const getIsBannerDismissed = (state) => state?.languageLiteral?.isBannerDismissed;

export default languageLiteralSlice.reducer;
