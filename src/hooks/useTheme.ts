import { ref, watchEffect } from 'vue';

const THEME_KEY = 'theme';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = ref<string>(localStorage.getItem(THEME_KEY) || (prefersDark ? 'dark' : 'light'));

document.documentElement.dataset.theme = theme.value;

watchEffect(() => {
  localStorage.setItem(THEME_KEY, theme.value);
  document.documentElement.dataset.theme = theme.value;
});

export function useTheme() {
  const toggle = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  };
  return { theme, toggle };
}
