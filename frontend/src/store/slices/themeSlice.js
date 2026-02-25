import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDarkMode: localStorage.getItem('darkMode') === 'true',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('darkMode', state.isDarkMode.toString());
      document.documentElement.classList.toggle('dark', state.isDarkMode);
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
      localStorage.setItem('darkMode', state.isDarkMode.toString());
      document.documentElement.classList.toggle('dark', state.isDarkMode);
    },
  },
});

export const { toggleDarkMode, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;