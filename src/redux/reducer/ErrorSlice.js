import { createSlice } from '@reduxjs/toolkit';

const initialState = { errorCode: '', isError: false, isServerDown: false };

const errorSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    setErrorStates(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const getErrorDetails = (state) => state.errors;

export const { setErrorStates } = errorSlice.actions;

export default errorSlice.reducer;
