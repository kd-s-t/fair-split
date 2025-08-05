import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  principal: string | null;
  name: string | null;
  icpBalance?: string | null;
  btcBalance?: string | null;
  btcAddress?: string | null;
}

const initialState: UserState = {
  principal: null,
  name: null,
  icpBalance: null,
  btcBalance: null,
  btcAddress: null,
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
      state.icpBalance = null;
      state.btcBalance = null;
      state.btcAddress = null;
    },
    setUserName(state, action: PayloadAction<string | null>) {
      state.name = action.payload;
    },
    setIcpBalance(state, action: PayloadAction<string | null>) {
      state.icpBalance = action.payload;
    },
    setBtcBalance(state, action: PayloadAction<string | null>) {
      state.btcBalance = action.payload;
    },
    setBtcAddress(state, action: PayloadAction<string | null>) {
      state.btcAddress = action.payload;
    },
  },
});

export const { setUser, clearUser, setUserName, setIcpBalance, setBtcBalance, setBtcAddress } = userSlice.actions;
export default userSlice.reducer; 