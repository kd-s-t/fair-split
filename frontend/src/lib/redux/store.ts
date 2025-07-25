import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionsSlice';
import userReducer from './userSlice';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { createSlice } from '@reduxjs/toolkit';

const initialLayoutState = {
  activePage: 'dashboard',
  title: 'Welcome back',
  subtitle: 'Manage your Bitcoin escrow transactions with confidence',
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState: initialLayoutState,
  reducers: {
    setActivePage(state, action) {
      state.activePage = action.payload;
    },
    setTitle(state, action) {
      state.title = action.payload;
    },
    setSubtitle(state, action) {
      state.subtitle = action.payload;
    },
  },
});

export const { setActivePage, setTitle, setSubtitle } = layoutSlice.actions;
export const layoutReducer = layoutSlice.reducer;

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    user: userReducer,
    layout: layoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 