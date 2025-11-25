export interface MediaItem {
  id: number;
  title?: string;
  name?: string; // For TV shows
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
  status?: string;
  runtime?: number; // For movies
  episode_run_time?: number[]; // For TV
  // For detailed TV view
  next_episode_to_air?: {
    air_date: string;
    episode_number: number;
    season_number: number;
    name: string;
  };
  number_of_episodes?: number;
  number_of_seasons?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface VideoResult {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProvidersResponse {
  id: number;
  results: {
    [key: string]: {
      link: string;
      flatrate?: WatchProvider[];
      rent?: WatchProvider[];
      buy?: WatchProvider[];
    }
  }
}

export interface SearchResponse {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}

export interface CreditsResponse {
  id: number;
  cast: CastMember[];
}

export interface VideosResponse {
  id: number;
  results: VideoResult[];
}

export interface FilterState {
  gridColumns: number;
  genre: string;
  year: string;
  sort: string;
  minVote: number;
}

export type TabView = 'home' | 'discover' | 'watchlist' | 'agenda' | 'search';