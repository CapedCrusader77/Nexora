import { useState, useEffect } from 'react';

/**
 * Custom React hook to sync state with localStorage dynamically
 * @param key The localStorage key
 * @param initialValue Default value if none exists in cache
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // SSR safety: only access localStorage on client
    if (typeof window === 'undefined') return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    setIsMounted(true);
  }, [key]);

  useEffect(() => {
    // SSR safety: only access localStorage on client
    if (!isMounted || typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, isMounted]);

  return [storedValue, setStoredValue];
}

