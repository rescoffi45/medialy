import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MediaItem, User } from '../types';

interface StoreContextType {
  user: User | null;
  watchedList: MediaItem[];
  watchlist: MediaItem[];
  addToWatched: (item: MediaItem) => void;
  removeFromWatched: (id: number) => void;
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: number) => void;
  isWatched: (id: number) => boolean;
  isInWatchlist: (id: number) => boolean;
  login: (email: string, pass: string) => boolean;
  register: (email: string, pass: string, name: string) => boolean;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const GUEST_KEY_WATCHED = 'trakt_guest_watched';
const GUEST_KEY_WATCHLIST = 'trakt_guest_watchlist';
const USERS_DB_KEY = 'trakt_users_db';
const SESSION_KEY = 'trakt_current_session';

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  // Current User State
  const [user, setUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    return savedSession ? JSON.parse(savedSession) : null;
  });

  // Data States
  const [watchedList, setWatchedList] = useState<MediaItem[]>([]);
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  
  // Helper to get storage keys based on auth status
  const getStorageKeys = (currentUser: User | null) => {
    if (currentUser) {
      return {
        watched: `trakt_user_${currentUser.email}_watched`,
        watchlist: `trakt_user_${currentUser.email}_watchlist`
      };
    }
    return {
      watched: GUEST_KEY_WATCHED,
      watchlist: GUEST_KEY_WATCHLIST
    };
  };

  // Load Data Effect: Triggers when User changes
  useEffect(() => {
    const keys = getStorageKeys(user);
    
    const savedWatched = localStorage.getItem(keys.watched);
    const savedWatchlist = localStorage.getItem(keys.watchlist);

    setWatchedList(savedWatched ? JSON.parse(savedWatched) : []);
    setWatchlist(savedWatchlist ? JSON.parse(savedWatchlist) : []);
  }, [user]);

  // Save Data Effect: Triggers when Lists change
  useEffect(() => {
    const keys = getStorageKeys(user);
    localStorage.setItem(keys.watched, JSON.stringify(watchedList));
  }, [watchedList, user]);

  useEffect(() => {
    const keys = getStorageKeys(user);
    localStorage.setItem(keys.watchlist, JSON.stringify(watchlist));
  }, [watchlist, user]);


  // Auth Functions
  const login = (email: string, pass: string): boolean => {
    const usersDB = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    const foundUser = usersDB.find((u: User) => u.email === email && u.password === pass);
    
    if (foundUser) {
      const sessionUser = { email: foundUser.email, name: foundUser.name };
      setUser(sessionUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return true;
    }
    return false;
  };

  const register = (email: string, pass: string, name: string): boolean => {
    const usersDB = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    
    if (usersDB.find((u: User) => u.email === email)) {
      return false; // User exists
    }

    const newUser = { email, password: pass, name }; // Note: Storing plain text password for demo only
    usersDB.push(newUser);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDB));
    
    // Auto login after register
    const sessionUser = { email, name };
    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    // Data will automatically revert to Guest lists via the Load Data Effect
  };

  // Actions
  const addToWatched = (item: MediaItem) => {
    if (!watchedList.find((i) => i.id === item.id)) {
      setWatchedList((prev) => [item, ...prev]);
      // Remove from watchlist if added to watched
      removeFromWatchlist(item.id);
    }
  };

  const removeFromWatched = (id: number) => {
    setWatchedList((prev) => prev.filter((i) => i.id !== id));
  };

  const addToWatchlist = (item: MediaItem) => {
    if (!watchlist.find((i) => i.id === item.id)) {
      setWatchlist((prev) => [item, ...prev]);
    }
  };

  const removeFromWatchlist = (id: number) => {
    setWatchlist((prev) => prev.filter((i) => i.id !== id));
  };

  const isWatched = (id: number) => !!watchedList.find((i) => i.id === id);
  const isInWatchlist = (id: number) => !!watchlist.find((i) => i.id === id);

  return (
    <StoreContext.Provider
      value={{
        user,
        watchedList,
        watchlist,
        addToWatched,
        removeFromWatched,
        addToWatchlist,
        removeFromWatchlist,
        isWatched,
        isInWatchlist,
        login,
        register,
        logout
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
