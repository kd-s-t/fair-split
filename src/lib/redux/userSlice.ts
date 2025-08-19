import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  principal: string | null;
  name: string | null;
  icpBalance?: string | null;
  ckbtcAddress?: string | null;
  ckbtcBalance?: string | null;
  seiAddress?: string | null;
  seiBalance?: string | null;
}

const initialState: UserState = {
  principal: null,
  name: null,
  icpBalance: null,
  ckbtcAddress: null,
  ckbtcBalance: null,
  seiAddress: null,
  seiBalance: null,
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
      state.ckbtcAddress = null;
      state.ckbtcBalance = null;
      state.seiAddress = null;
      state.seiBalance = null;
    },
    setUserName(state, action: PayloadAction<string | null>) {
      state.name = action.payload;
    },
    setIcpBalance(state, action: PayloadAction<string | null>) {
      state.icpBalance = action.payload;
    },
    setCkbtcAddress(state, action: PayloadAction<string | null>) {
      state.ckbtcAddress = action.payload;
    },
    setCkbtcBalance(state, action: PayloadAction<string | null>) {
      state.ckbtcBalance = action.payload;
    },
    setSeiAddress(state, action: PayloadAction<string | null>) {
      state.seiAddress = action.payload;
    },
    setSeiBalance(state, action: PayloadAction<string | null>) {
      state.seiBalance = action.payload;
    },
  },
});

export const { 
  setUser, 
  clearUser, 
  setUserName, 
  setIcpBalance,
  setCkbtcAddress,
  setCkbtcBalance,
  setSeiAddress,
  setSeiBalance
} = userSlice.actions;
export default userSlice.reducer; 