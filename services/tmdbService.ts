import { MediaItem, SearchResponse, CreditsResponse, VideosResponse, CastMember, VideoResult, WatchProvider, WatchProvidersResponse } from '../types';

const API_KEY = 'ef5d138e190f392876196b60d31eee5c';
const BASE_URL = 'https://api.themoviedb.org/3';

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

const fetchFromTMDB = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  // Default to fr-FR if not specified in params
  const defaultParams = {
    api_key: API_KEY,
    language: 'fr-FR',
    include_image_language: 'en,null',
    include_adult: 'false',
  };

  const queryParams = new URLSearchParams({ ...defaultParams, ...params });

  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Helper to fetch list data in French (for text) and English (for images) and merge them
// This ensures we get English posters (instead of Original/Korean fallback) while keeping French text.
const fetchWithEnglishImages = async (endpoint: string, params: Record<string, string> = {}): Promise<SearchResponse> => {
    // Primary Request: French Data (Critical)
    const frPromise = fetchFromTMDB<SearchResponse>(endpoint, { ...params, language: 'fr-FR' });
    
    // Secondary Request: English Data (Enhancement, Non-critical)
    // We catch errors here so the main content still loads even if this fails
    const enPromise = fetchFromTMDB<SearchResponse>(endpoint, { ...params, language: 'en-US' })
        .catch(e => {
            console.warn('Failed to fetch English images override:', e);
            return null;
        });

    const [frData, enData] = await Promise.all([frPromise, enPromise]);

    // Create a map of English images by ID if available
    if (enData && enData.results) {
        const imageMap = new Map<number, { poster: string | null, backdrop: string | null }>();
        enData.results.forEach((item) => {
            imageMap.set(item.id, { poster: item.poster_path, backdrop: item.backdrop_path });
        });

        // Override French images with English ones
        if (frData.results) {
            frData.results = frData.results.map((item) => {
                const enImages = imageMap.get(item.id);
                if (enImages) {
                    // Prefer English poster if available
                    if (enImages.poster) item.poster_path = enImages.poster;
                    if (enImages.backdrop) item.backdrop_path = enImages.backdrop;
                }
                return item;
            });
        }
    }

    return frData;
};

export const tmdbService = {
  getTrending: async (): Promise<MediaItem[]> => {
    const data = await fetchWithEnglishImages('/trending/all/week');
    // Filter out 'person' results if any
    return data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  },

  searchMulti: async (query: string): Promise<MediaItem[]> => {
    if (!query) return [];
    // Use the merging strategy for search results to fix posters
    const data = await fetchWithEnglishImages('/search/multi', { query });
    return data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  },

  getDetails: async (id: number, type: 'movie' | 'tv'): Promise<MediaItem> => {
    // Fetch details with images appended to allow overriding the poster/backdrop with English versions
    const data = await fetchFromTMDB<any>(`/${type}/${id}`, {
      append_to_response: 'images',
      include_image_language: 'en,null'
    });

    // Logic to force English poster if available
    if (data.images?.posters) {
      // Find 'en' poster. If not found, 'null' (textless) is also good.
      const enPoster = data.images.posters.find((p: any) => p.iso_639_1 === 'en') || 
                       data.images.posters.find((p: any) => p.iso_639_1 === null);
      if (enPoster) {
        data.poster_path = enPoster.file_path;
      }
    }

    // Logic to force English backdrop if available
    if (data.images?.backdrops) {
      const enBackdrop = data.images.backdrops.find((p: any) => p.iso_639_1 === 'en') ||
                         data.images.backdrops.find((p: any) => p.iso_639_1 === null);
      if (enBackdrop) {
        data.backdrop_path = enBackdrop.file_path;
      }
    }

    // Map genres array ( {id, name}[] ) to genre_ids ( number[] ) for filter compatibility
    if (data.genres) {
      data.genre_ids = data.genres.map((g: any) => g.id);
    }

    return data as MediaItem;
  },
  
  getDiscoverMovie: async (): Promise<MediaItem[]> => {
      const data = await fetchWithEnglishImages('/discover/movie', { sort_by: 'popularity.desc' });
      return data.results.map(m => ({ ...m, media_type: 'movie' }));
  },
  
  getDiscoverTV: async (): Promise<MediaItem[]> => {
      const data = await fetchWithEnglishImages('/discover/tv', { sort_by: 'popularity.desc' });
      return data.results.map(m => ({ ...m, media_type: 'tv' }));
  },

  getCast: async (id: number, type: 'movie' | 'tv'): Promise<CastMember[]> => {
    try {
        const data = await fetchFromTMDB<CreditsResponse>(`/${type}/${id}/credits`);
        return data.cast.slice(0, 10); // Return top 10 cast members
    } catch (e: any) {
        if (e instanceof Error && e.message.includes('404')) return [];
        console.warn('Failed to fetch cast', e);
        return [];
    }
  },

  getVideos: async (id: number, type: 'movie' | 'tv'): Promise<VideoResult[]> => {
    try {
        const data = await fetchFromTMDB<VideosResponse>(`/${type}/${id}/videos`);
        return data.results.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    } catch (e: any) {
        if (e instanceof Error && e.message.includes('404')) return [];
        console.warn('Failed to fetch videos', e);
        return [];
    }
  },

  getWatchProviders: async (id: number, type: 'movie' | 'tv'): Promise<WatchProvider[]> => {
    try {
      const data = await fetchFromTMDB<WatchProvidersResponse>(`/${type}/${id}/watch/providers`);
      // Return flatrate providers for France (FR)
      return data.results?.FR?.flatrate || [];
    } catch (e: any) {
      // 404 is common for watch providers if none exist for that ID in that region
      if (e instanceof Error && e.message.includes('404')) return [];
      console.warn('Error fetching watch providers', e);
      return [];
    }
  }
};