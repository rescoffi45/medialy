import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MediaItem } from '../types';

interface StoreContextType {
  watchedList: MediaItem[];
  watchlist: MediaItem[];
  addToWatched: (item: MediaItem) => void;
  removeFromWatched: (id: number) => void;
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: number) => void;
  isWatched: (id: number) => boolean;
  isInWatchlist: (id: number) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const [watchedList, setWatchedList] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('trakt_watched');
    return saved ? JSON.parse(saved) : [];
  });

  const [watchlist, setWatchlist] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('trakt_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('trakt_watched', JSON.stringify(watchedList));
  }, [watchedList]);

  useEffect(() => {
    localStorage.setItem('trakt_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatched = (item: MediaItem) => {
    if (!watchedList.find((i) => i.id === item.id)) {
      setWatchedList((prev) => [item, ...prev]);
      // Usually if you watched it, you remove it from watchlist
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
        watchedList,
        watchlist,
        addToWatched,
        removeFromWatched,
        addToWatchlist,
        removeFromWatchlist,
        isWatched,
        isInWatchlist,
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