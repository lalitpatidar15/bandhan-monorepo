import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SelectedLocation {
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

interface LocationState {
  location: SelectedLocation | null;
  loaded: boolean;
}

const STORAGE_KEY = 'bandhan_location';

const initialState: LocationState = {
  location: null,
  loaded: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<SelectedLocation>) => {
      state.location = action.payload;
      state.loaded = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      }
    },
    loadLocation: (state) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            state.location = JSON.parse(saved);
          } catch {
            /* ignore */
          }
        }
      }
      state.loaded = true;
    },
    clearLocation: (state) => {
      state.location = null;
      if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { setLocation, loadLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
