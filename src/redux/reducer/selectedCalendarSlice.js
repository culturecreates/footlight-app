import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: '',
};

export const selectedCalendarSlice = createSlice({
  name: 'selectedCalendar',
  initialState,
  reducers: {
    setSelectedCalendar: (state, action) => {
      state.id = action.payload;
    },
  },
});

export const { setSelectedCalendar } = selectedCalendarSlice.actions;

export const getSelectedCalendar = (state) => state.calendar;

export default selectedCalendarSlice.reducer;
