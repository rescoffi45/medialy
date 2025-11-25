import { MediaItem, SearchResponse, CreditsResponse, VideosResponse, CastMember, VideoResult, WatchProvider, WatchProvidersResponse } from '../types';

const API_KEY = 'ef5d138e190f392876196b60d31eee5c';
const BASE_URL = 'https://api.themoviedb.org/3';

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

const fetchFromTMDB = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: 'fr-FR', // Request French data
    include_adult: 'false',
    ...params,
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }
  return response.json();
};

export const tmdbService = {
  getTrending: async (): Promise<MediaItem[]> => {
    const data = await fetchFromTMDB<SearchResponse>('/trending/all/week');
    // Filter out 'person' results if any
    return data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  },

  searchMulti: async (query: string): Promise<MediaItem[]> => {
    if (!query) return [];
    const data = await fetchFromTMDB<SearchResponse>('/search/multi', { query });
    return data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  },

  getDetails: async (id: number, type: 'movie' | 'tv'): Promise<MediaItem> => {
    return fetchFromTMDB<MediaItem>(`/${type}/${id}`);
  },
  
  getDiscoverMovie: async (): Promise<MediaItem[]> => {
      const data = await fetchFromTMDB<SearchResponse>('/discover/movie', { sort_by: 'popularity.desc' });
      return data.results.map(m => ({ ...m, media_type: 'movie' }));
  },
  
  getDiscoverTV: async (): Promise<MediaItem[]> => {
      const data = await fetchFromTMDB<SearchResponse>('/discover/tv', { sort_by: 'popularity.desc' });
      return data.results.map(m => ({ ...m, media_type: 'tv' }));
  },

  getCast: async (id: number, type: 'movie' | 'tv'): Promise<CastMember[]> => {
    const data = await fetchFromTMDB<CreditsResponse>(`/${type}/${id}/credits`);
    return data.cast.slice(0, 10); // Return top 10 cast members
  },

  getVideos: async (id: number, type: 'movie' | 'tv'): Promise<VideoResult[]> => {
    const data = await fetchFromTMDB<VideosResponse>(`/${type}/${id}/videos`);
    return data.results.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
  },

  getWatchProviders: async (id: number, type: 'movie' | 'tv'): Promise<WatchProvider[]> => {
    try {
      const data = await fetchFromTMDB<WatchProvidersResponse>(`/${type}/${id}/watch/providers`);
      // Return flatrate providers for France (FR)
      return data.results?.FR?.flatrate || [];
    } catch (e) {
      console.error('Error fetching watch providers', e);
      return [];
    }
  }
};