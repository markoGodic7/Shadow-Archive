import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    app: (state = { ready: true }) => state,
    auth: authReducer,
  },
});
