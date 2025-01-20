import { DarkModeOptions } from "./types";

export const defaultOptions: DarkModeOptions = {
    darkModeClass: 'dark-mode',
    lightModeClass: 'light-mode',
    preloadingClass: 'dark-mode-preloading',
    storageKey: 'dark-mode',
    element: document.body,
  };