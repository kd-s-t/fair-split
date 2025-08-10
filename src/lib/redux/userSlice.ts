import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  principal: string | null;
  name: string | null;
  icpBalance?: string | null;
  ckbtcAddress?: string | null;
  ckbtcBalance?: string | null;
}

const initialState: UserState = {
  principal: null,
  name: null,
  icpBalance: null,
  ckbtcAddress: null,
  ckbtcBalance: null,
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
  },
});

export const { 
  setUser, 
  clearUser, 
  setUserName, 
  setIcpBalance,
  setCkbtcAddress,
  setCkbtcBalance
} = userSlice.actions;
export default userSlice.reducer; 