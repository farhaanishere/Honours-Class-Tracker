const APP_KEY = 'bou_tracker_v1';

export const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(`${APP_KEY}_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error('Error loading from storage', e);
    return defaultValue;
  }
};

export const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(`${APP_KEY}_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to storage', e);
  }
};