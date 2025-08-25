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
import { taxonomyApi } from '../services/taxonomy';
import { imageApi } from '../services/image';
import { placesApi } from '../services/places';
import { entitiesApi } from '../services/entities';
import { inviteApi } from '../services/invite';
import { organizationApi } from '../services/organization';
import { peopleApi } from '../services/people';
import { postalAddressApi } from '../services/postalAddress';
import ErrorSliceReducer from './reducer/ErrorSlice';
import { externalSourceApi } from '../services/externalSource';
import languageLiteralReducer from './reducer/languageLiteralSlice';
import readOnlyTabReducer from './reducer/readOnlyTabSlice';
import { notificationApi } from '../services/notification';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'interfaceLanguage', 'selectedCalendar', 'errors', 'languageLiteral'],
  blacklist: [
    'eventsApi',
    'calendarApi',
    'taxonomyApi',
    'imageApi',
    'placesApi',
    'entitiesApi',
    'inviteApi',
    'organizationApi',
    'peopleApi',
    'postalAddressApi',
    'externalSourceApi',
  ],
};
const middlewares = [
  loginApi.middleware,
  usersApi.middleware,
  eventsApi.middleware,
  calendarApi.middleware,
  taxonomyApi.middleware,
  imageApi.middleware,
  placesApi.middleware,
  entitiesApi.middleware,
  inviteApi.middleware,
  organizationApi.middleware,
  peopleApi.middleware,
  postalAddressApi.middleware,
  externalSourceApi.middleware,
  notificationApi.middleware,
];

const appReducer = combineReducers({
  user: userReducer,
  interfaceLanguage: interfaceLanguageReducer,
  selectedCalendar: selectedCalendarReducer,
  errors: ErrorSliceReducer,
  languageLiteral: languageLiteralReducer,
  readOnlyTabs: readOnlyTabReducer,
  [loginApi.reducerPath]: loginApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [eventsApi.reducerPath]: eventsApi.reducer,
  [calendarApi.reducerPath]: calendarApi.reducer,
  [taxonomyApi.reducerPath]: taxonomyApi.reducer,
  [imageApi.reducerPath]: imageApi.reducer,
  [placesApi.reducerPath]: placesApi.reducer,
  [entitiesApi.reducerPath]: entitiesApi.reducer,
  [inviteApi.reducerPath]: inviteApi.reducer,
  [organizationApi.reducerPath]: organizationApi.reducer,
  [peopleApi.reducerPath]: peopleApi.reducer,
  [postalAddressApi.reducerPath]: postalAddressApi.reducer,
  [externalSourceApi.reducerPath]: externalSourceApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
});

const rootReducer = (state, action) => appReducer(state, action);

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }).concat(middlewares),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);
