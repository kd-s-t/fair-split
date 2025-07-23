import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  principal: string | null;
  name: string | null;
}

const initialState: UserState = {
  principal: null,
  name: null,
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
    },
    setUserName(state, action: PayloadAction<string | null>) {
      state.name = action.payload;
    },
  },
});

export const { setUser, clearUser, setUserName } = userSlice.actions;
export default userSlice.reducer; 