import { createSlice } from '@reduxjs/toolkit';

const initialState = { errorCode: '', isError: false, message: '', data: [] };

const errorSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    setErrorStates(state, action) {
      return { ...state, ...action.payload };
    },
    clearErrors() {
      return initialState;
    },
  },
});

export const getErrorDetails = (state) => state.errors;

export const { setErrorStates, clearErrors } = errorSlice.actions;

export default errorSlice.reducer;
