import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginUser, registerUser, logoutUser, getCurrentUser, migrateGuestData } from '../../services/authAPI';

export const register = createAsyncThunk('auth/register', async ({ username, email, password, passwordConfirm }) => {
  const response = await registerUser(username, email, password, passwordConfirm);
  localStorage.setItem('shadow-archive-access-token', response.tokens.access);
  return response.user;
});

export const login = createAsyncThunk('auth/login', async ({ username, password }) => {
  const response = await loginUser(username, password);
  localStorage.setItem('shadow-archive-access-token', response.access);
  return response;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await logoutUser();
  } catch (error) {
    console.error('Logout error:', error);
  }
  localStorage.removeItem('shadow-archive-access-token');
  return null;
});

export const fetchUser = createAsyncThunk('auth/fetchUser', async () => {
  const response = await getCurrentUser();
  return response;
});

export const migrateGuest = createAsyncThunk('auth/migrateGuest', async ({ deviceId, recentCards }) => {
  const response = await migrateGuestData(deviceId, recentCards);
  return response;
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(migrateGuest.fulfilled, (state) => {
        state.isAuthenticated = true;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;