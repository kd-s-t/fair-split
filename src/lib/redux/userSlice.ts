import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  principal: string | null;
  name: string | null;
  btcBalance?: string | null;
}

const initialState: UserState = {
  principal: null,
  name: null,
  btcBalance: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ principal: string; name: string | null }>) {
      state.principal = action.payload.principal;
      state.name = action.payload.name;
    },
    clearUser(state) {
      state.principal = null;
      state.name = null;
      state.btcBalance = null;
    },
    setUserName(state, action: PayloadAction<string | null>) {
      state.name = action.payload;
    },
    setBtcBalance(state, action: PayloadAction<string | null>) {
      state.btcBalance = action.payload;
    },
  },
});

export const { setUser, clearUser, setUserName, setBtcBalance } = userSlice.actions;
export default userSlice.reducer; 