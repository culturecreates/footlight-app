import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: '',
  reload: false,
};

export const selectedCalendarSlice = createSlice({
  name: 'selectedCalendar',
  initialState,
  reducers: {
    setSelectedCalendar: (state, action) => {
      state.id = action.payload;
    },
    setReloadCalendar: (state, action) => {
      state.reload = action.payload;
    },
  },
});

export const { setSelectedCalendar, setReloadCalendar } = selectedCalendarSlice.actions;

export const getSelectedCalendar = (state) => state.selectedCalendar;

export const getReloadStatusForCalendar = (state) => state.selectedCalendar;

export default selectedCalendarSlice.reducer;
