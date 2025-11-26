import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import FilterDrawer from './components/FilterDrawer';
import MediaCard from './components/MediaCard';
import MediaDetailModal from './components/MediaDetailModal';
import HeroSlider from './components/HeroSlider';
import AuthModal from './components/AuthModal';
import { useStore, StoreProvider } from './store/StoreContext';
import { tmdbService } from './services/tmdbService';
import { MediaItem, FilterState, TabView } from './types';
import { Search as SearchIcon, Calendar as CalendarIcon, Loader2, ArrowRight } from 'lucide-react';

// Reusable Tab Component for Filter Pills
const FilterTabs = ({ 
  activeTab, 
  onTabChange, 
  counts 
}: { 
  activeTab: 'all' | 'movie' | 'tv'; 
  onTabChange: (t: 'all' | 'movie' | 'tv') => void;
  counts: { all: number; movie: number; tv: number };
}) => (
  <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
    <button
      onClick={() => onTabChange('all')}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
        activeTab === 'all'
          ? 'bg-violet-100 text-violet-800'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      Tout <span className="ml-1 text-xs opacity-70">{counts.all}</span>
    </button>
    <button
      onClick={() => onTabChange('movie')}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
        activeTab === 'movie'
          ? 'bg-violet-100 text-violet-800'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      Films <span className="ml-1 text-xs opacity-70">{counts.movie}</span>
    </button>
    <button
      onClick={() => onTabChange('tv')}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
        activeTab === 'tv'
          ? 'bg-violet-100 text-violet-800'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      Séries <span className="ml-1 text-xs opacity-70">{counts.tv}</span>
    </button>
  </div>
);

const ViewContainer = ({ 
  children, 
  title, 
  subtitle, 
  headerContent 
}: { 
  children?: React.ReactNode; 
  title: string; 
  subtitle?: React.ReactNode; 
  headerContent?: React.ReactNode; 
}) => (
  <div className="p-4 sm:p-8 w-full max-w-[1920px] mx-auto mt-12 md:mt-0">
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        {subtitle && <div className="text-gray-500 mt-1">{subtitle}</div>}
      </div>
      
      {headerContent && (
        <div className="flex-shrink-0">
           {headerContent}
        </div>
      )}
    </div>
    {children}
  </div>
);

// Helper to filter and sort items based on state
const filterItems = (items: MediaItem[], filters: FilterState) => {
  const filtered = items.filter(item => {
    // Rating Filter
    if (item.vote_average < filters.minVote) return false;

    // Genre Filter
    if (filters.genre !== 'all') {
      const g = filters.genre;
      const ids = item.genre_ids || [];
      
      // TMDB Genre IDs
      if (g === 'action') {
         if (!ids.includes(28) && !ids.includes(10759)) return false;
      } else if (g === 'comedy') {
         if (!ids.includes(35)) return false;
      } else if (g === 'drama') {
         if (!ids.includes(18)) return false;
      } else if (g === 'scifi') {
         if (!ids.includes(878) && !ids.includes(10765)) return false;
      } else if (g === 'horror') {
         if (!ids.includes(27)) return false;
      }
    }
    return true;
  });

  // Sort Logic
  if (filters.sort === 'alpha') {
    filtered.sort((a, b) => {
      const nameA = a.title || a.name || '';
      const nameB = b.title || b.name || '';
      return nameA.localeCompare(nameB);
    });
  } else if (filters.sort === 'year') {
    filtered.sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || '';
      const dateB = b.release_date || b.first_air_date || '';
      // Descending order (newest first)
      return dateB.localeCompare(dateA);
    });
  }
  // 'recent' relies on existing order (usually provided by API or insertion order)

  return filtered;
};

// Helper for Grid Classes
const getGridClass = (cols: number) => {
  switch (cols) {
    case 4: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    case 6: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
    case 5: default: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
  }
};

const DiscoverView = ({ filters, onSelect }: { filters: FilterState, onSelect: (item: MediaItem) => void }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await tmdbService.getTrending();
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sliderItems = useMemo(() => items.slice(0, 4), [items]);
  const gridItems = useMemo(() => filterItems(items.slice(4), filters), [items, filters]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-violet-600" size={40} /></div>;

  return (
    <ViewContainer title="Tendances" subtitle="Les plus populaires cette semaine">
      <HeroSlider items={sliderItems} onSelect={onSelect} />
      
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">À découvrir aussi</h3>
        <div className={`grid gap-4 sm:gap-6 ${getGridClass(filters.gridColumns)}`}>
          {gridItems.map(item => <MediaCard key={item.id} item={item} onClick={onSelect} />)}
        </div>
      </div>
    </ViewContainer>
  );
};

const SearchView = ({ filters, onSelect }: { filters: FilterState, onSelect: (item: MediaItem) => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const res = await tmdbService.searchMulti(query);
          setResults(res);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500); 
    return () => clearTimeout(timeout);
  }, [query]);

  const filteredResults = useMemo(() => filterItems(results, filters), [results, filters]);

  return (
    <ViewContainer title="Rechercher" subtitle="Ajouter des films et séries">
      <div className="relative mb-8 max-w-2xl">
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Titre de film, série..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-violet-500 bg-white text-lg text-gray-900"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {loading ? (
         <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : (
        <div className={`grid gap-4 sm:gap-6 ${getGridClass(filters.gridColumns)}`}>
          {filteredResults.map(item => <MediaCard key={item.id} item={item} onClick={onSelect} />)}
          {filteredResults.length === 0 && query && !loading && <p className="text-gray-500 col-span-full">Aucun résultat correspondant aux filtres.</p>}
        </div>
      )}
    </ViewContainer>
  );
};

const WatchlistView = ({ filters, onSelect }: { filters: FilterState, onSelect: (item: MediaItem) => void }) => {
  const { watchlist, user } = useStore();
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');

  // Calculate counts on the full list
  const counts = useMemo(() => ({
    all: watchlist.length,
    movie: watchlist.filter(i => i.media_type === 'movie').length,
    tv: watchlist.filter(i => i.media_type === 'tv').length
  }), [watchlist]);

  // Apply Type Filter first, then Global Filters
  const displayedItems = useMemo(() => {
    const byType = watchlist.filter(item => typeFilter === 'all' || item.media_type === typeFilter);
    return filterItems(byType, filters);
  }, [watchlist, typeFilter, filters]);

  const getSubtitle = () => {
    const count = counts[typeFilter];
    const type = typeFilter === 'movie' ? 'film' : typeFilter === 'tv' ? 'série' : 'élément';
    const s = count > 1 ? 's' : '';
    return <span className="font-medium text-violet-600">{count} {type}{s} <span className="text-gray-500 font-normal">dans {user ? 'votre liste' : 'la liste invité'}</span></span>;
  };

  return (
    <ViewContainer 
      title="À voir" 
      subtitle={getSubtitle()}
      headerContent={
        <FilterTabs activeTab={typeFilter} onTabChange={setTypeFilter} counts={counts} />
      }
    >
      {watchlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
           <p className="text-gray-500 text-lg mb-4">Votre liste "À voir" est vide.</p>
           <p className="text-gray-400">Utilisez la recherche pour ajouter des films ou séries.</p>
        </div>
      ) : (
        <div className={`grid gap-4 sm:gap-6 ${getGridClass(filters.gridColumns)}`}>
          {displayedItems.map(item => <MediaCard key={item.id} item={item} onClick={onSelect} />)}
          {displayedItems.length === 0 && <p className="text-gray-500 col-span-full">Aucun élément ne correspond aux filtres.</p>}
        </div>
      )}
    </ViewContainer>
  );
};

const VuView = ({ filters, onSelect }: { filters: FilterState, onSelect: (item: MediaItem) => void }) => {
  const { watchedList } = useStore();
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');

  // Calculate counts
  const counts = useMemo(() => ({
    all: watchedList.length,
    movie: watchedList.filter(i => i.media_type === 'movie').length,
    tv: watchedList.filter(i => i.media_type === 'tv').length
  }), [watchedList]);

  // Apply Filters
  const displayedItems = useMemo(() => {
    const byType = watchedList.filter(item => typeFilter === 'all' || item.media_type === typeFilter);
    return filterItems(byType, filters);
  }, [watchedList, typeFilter, filters]);

  const getSubtitle = () => {
    const count = counts[typeFilter];
    const type = typeFilter === 'movie' ? 'film' : typeFilter === 'tv' ? 'série' : 'élément';
    const s = count > 1 ? 's' : '';
    return <span className="font-medium text-violet-600">{count} {type}{s} <span className="text-gray-500 font-normal">vu{s} au total</span></span>;
  };

  return (
    <ViewContainer 
      title="Vu" 
      subtitle={getSubtitle()}
      headerContent={
        <FilterTabs activeTab={typeFilter} onTabChange={setTypeFilter} counts={counts} />
      }
    >
      {watchedList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
           <p className="text-gray-500 text-lg">Vous n'avez rien marqué comme vu.</p>
        </div>
      ) : (
        <div className={`grid gap-4 sm:gap-6 ${getGridClass(filters.gridColumns)}`}>
          {displayedItems.map(item => <MediaCard key={item.id} item={item} onClick={onSelect} />)}
          {displayedItems.length === 0 && <p className="text-gray-500 col-span-full">Aucun élément ne correspond aux filtres.</p>}
        </div>
      )}
    </ViewContainer>
  );
};

const AgendaView = () => {
  const { watchlist } = useStore();
  const [agendaItems, setAgendaItems] = useState<(MediaItem & { displayDate: string, displayLabel: string })[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAgendaDetails = async () => {
      setLoading(true);
      const itemsWithDates = await Promise.all(watchlist.map(async (item) => {
        let displayDate = 'Inconnue';
        let displayLabel = 'En attente';
        let sortDate = new Date(8640000000000000).getTime();

        try {
          // Robust inference for media_type to prevent 404
          const type = item.media_type || (item.title ? 'movie' : 'tv');
          const details = await tmdbService.getDetails(item.id, type);
          
          if (type === 'movie') {
            if (details.release_date) {
               const d = new Date(details.release_date);
               if (d > new Date()) {
                  displayDate = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                  displayLabel = 'Sortie Cinéma';
                  sortDate = d.getTime();
               } else {
                  displayDate = "Déjà sorti";
                  displayLabel = "Disponible";
                  sortDate = 0;
               }
            }
          } else {
            if (details.next_episode_to_air) {
              const d = new Date(details.next_episode_to_air.air_date);
              displayDate = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
              displayLabel = `S${details.next_episode_to_air.season_number}E${details.next_episode_to_air.episode_number}`;
              sortDate = d.getTime();
            } else {
              displayLabel = details.status === 'Ended' ? 'Terminée' : 'En pause';
            }
          }
          // Ensure we attach the type back if needed
          return { ...details, media_type: type, displayDate, displayLabel, sortDate };
        } catch (e) {
          console.error("Failed to load details for agenda", item.title || item.name);
          return null; // Return null so we can filter it out
        }
      }));

      const sorted = itemsWithDates
        .filter((i): i is NonNullable<typeof i> => i !== null && i.sortDate > 0 && i.sortDate !== 8640000000000000)
        .sort((a, b) => a.sortDate - b.sortDate);
      
      setAgendaItems(sorted);
      setLoading(false);
    };

    if (watchlist.length > 0) {
      fetchAgendaDetails();
    } else {
      setAgendaItems([]);
    }
  }, [watchlist]);

  return (
    <ViewContainer title="Agenda" subtitle="Vos prochaines sorties">
      {watchlist.length === 0 && (
         <div className="text-center py-10 text-gray-500">Ajoutez des séries à votre liste "À voir" pour peupler l'agenda.</div>
      )}
      
      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-violet-600" size={40} /></div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          {agendaItems.length === 0 && watchlist.length > 0 && (
            <div className="p-6 bg-blue-50 text-blue-800 rounded-lg">
              Aucun épisode futur ou sortie prochaine détecté pour votre liste actuelle.
            </div>
          )}
          {agendaItems.map(item => (
            <div key={item.id} className="flex bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
               <div className="w-24 sm:w-32 bg-gray-200">
                  <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} className="h-full w-full object-cover" alt="" />
               </div>
               <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{item.title || item.name}</h3>
                      <p className="text-violet-600 font-medium mt-1">{item.displayDate}</p>
                    </div>
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wide hidden sm:block">
                      {item.media_type === 'tv' ? 'Série' : 'Film'}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-gray-500 text-sm sm:text-base">
                    <CalendarIcon size={16} className="mr-2" />
                    <span>{item.displayLabel}</span>
                  </div>
               </div>
               <button className="w-12 sm:w-16 bg-gray-50 hover:bg-violet-50 flex items-center justify-center border-l transition-colors group">
                  <ArrowRight className="text-gray-400 group-hover:text-violet-600" />
               </button>
            </div>
          ))}
        </div>
      )}
    </ViewContainer>
  );
};

const MainContent = () => {
  const [currentTab, setCurrentTab] = useState<TabView>('discover');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    gridColumns: 5,
    genre: 'all',
    year: 'all',
    sort: 'recent',
    minVote: 0
  });

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <Sidebar 
        currentTab={currentTab} 
        setTab={setCurrentTab} 
        toggleFilter={() => setFilterOpen(true)}
        openAuth={() => setAuthOpen(true)}
      />
      
      <main className="flex-1 transition-all duration-300 ease-in-out pl-0 md:pl-20">
        <div key={currentTab} className="animate-slide-enter">
          {currentTab === 'discover' && <DiscoverView filters={filters} onSelect={setSelectedItem} />}
          {currentTab === 'home' && <VuView filters={filters} onSelect={setSelectedItem} />} 
          {currentTab === 'watchlist' && <WatchlistView filters={filters} onSelect={setSelectedItem} />}
          {currentTab === 'search' && <SearchView filters={filters} onSelect={setSelectedItem} />}
          {currentTab === 'agenda' && <AgendaView />}
        </div>
      </main>

      <FilterDrawer 
        isOpen={filterOpen} 
        onClose={() => setFilterOpen(false)} 
        filters={filters} 
        setFilters={setFilters} 
      />

      {selectedItem && (
        <MediaDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}

      <AuthModal 
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
};

export default App;