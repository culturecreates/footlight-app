import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import userReducer from './reducer/userSlice';
import { loginApi } from '../services/login';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage
};
const middlewares = [loginApi.middleware];
const appReducer = combineReducers({
  user: userReducer,
  [loginApi.reducerPath]: loginApi.middleware
});
const rootReducer = (state, action) => appReducer(state, action);
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(middlewares)
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);
