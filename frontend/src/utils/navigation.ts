import type { NavigateFunction } from 'react-router-dom';

// This will hold the navigation function from React Router
let navigate: NavigateFunction | null = null;

export const setNavigate = (navigateFunction: NavigateFunction) => {
  navigate = navigateFunction;
};

export const getNavigate = () => navigate;

export const navigateTo = (path: string, options?: { replace?: boolean }) => {
  if (navigate) {
    navigate(path, options);
  } else {
    console.warn('Navigation not initialized. Make sure NavigationProvider is mounted.');
  }
};