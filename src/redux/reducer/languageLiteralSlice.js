import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: false,
};

export const languageLiteralSlice = createSlice({
  name: 'languageLiteral',
  initialState,
  reducers: {
    setLanguageLiteralBannerDisplayStatus: (state, action) => {
      state.status = action.payload;
    },
  },
});

export const { setLanguageLiteralBannerDisplayStatus } = languageLiteralSlice.actions;

export const getLanguageLiteralBannerDisplayStatus = (state) => state?.languageLiteral?.status;

export default languageLiteralSlice.reducer;
