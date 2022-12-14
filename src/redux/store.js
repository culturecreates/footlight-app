import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import userReducer from './reducer/userSlice';
import interfaceLanguageReducer from './reducer/interfaceLanguageSlice';
import selectedCalendarReducer from './reducer/selectedCalendarSlice';
import { loginApi } from '../services/login';
import { usersApi } from '../services/users';
import { eventsApi } from '../services/events';
import { calendarApi } from '../services/calendar';

const persistConfig = {
  key: 'root',
  storage,
};
const middlewares = [loginApi.middleware, usersApi.middleware, eventsApi.middleware, calendarApi.middleware];

const appReducer = combineReducers({
  user: userReducer,
  interfaceLanguage: interfaceLanguageReducer,
  selectedCalendar: selectedCalendarReducer,
  [loginApi.reducerPath]: loginApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [eventsApi.reducerPath]: eventsApi.reducer,
  [calendarApi.reducerPath]: calendarApi.reducer,
});

const rootReducer = (state, action) => appReducer(state, action);

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(middlewares),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);
