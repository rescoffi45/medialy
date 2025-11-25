import React, { useEffect, useState } from 'react';
import { ChevronLeft, Share2, Plus, Check, MoreHorizontal, Play, Star } from 'lucide-react';
import { MediaItem, CastMember, VideoResult, WatchProvider } from '../types';
import { tmdbService, IMAGE_BASE_URL, BACKDROP_BASE_URL } from '../services/tmdbService';
import { useStore } from '../store/StoreContext';

interface MediaDetailModalProps {
  item: MediaItem;
  onClose: () => void;
}

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ item, onClose }) => {
  const { isWatched, isInWatchlist, addToWatched, removeFromWatched, addToWatchlist, removeFromWatchlist } = useStore();
  const [cast, setCast] = useState<CastMember[]>([]);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [details, setDetails] = useState<MediaItem>(item);

  const watched = isWatched(item.id);
  const inWatchlist = isInWatchlist(item.id);
  
  const title = details.title || details.name;
  const year = (details.release_date || details.first_air_date || '').split('-')[0];
  
  // Format runtime: "2h 30min"
  const formatRuntime = (mins?: number) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };
  
  const runtime = details.runtime 
    ? formatRuntime(details.runtime)
    : (details.episode_run_time?.[0] ? formatRuntime(details.episode_run_time[0]) : '');
    
  const typeLabel = details.media_type === 'movie' ? 'Film' : 'Série';

  // Extract genre names
  const genres = details.genre_ids ? "Genres" : ""; // In a real app we'd map IDs to names, but TMDB detail endpoint returns full genre objects which we don't strictly have in MediaItem interface here unless we expand it. 
  // For now let's use the type label + any available info.

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailsData, castData, videosData, providersData] = await Promise.all([
           tmdbService.getDetails(item.id, item.media_type),
           tmdbService.getCast(item.id, item.media_type),
           tmdbService.getVideos(item.id, item.media_type),
           tmdbService.getWatchProviders(item.id, item.media_type)
        ]);
        setDetails(detailsData);
        setCast(castData);
        setVideos(videosData);
        setProviders(providersData);
      } catch (e) {
        console.error("Failed to load details", e);
      }
    };
    fetchData();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [item]);

  const toggleWatched = () => watched ? removeFromWatched(item.id) : addToWatched(item);
  const toggleWatchlist = () => inWatchlist ? removeFromWatchlist(item.id) : addToWatchlist(item);

  return (
    <div className="fixed inset-0 z-[60] bg-[#0d1117] overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
        
        {/* Top Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
           <button 
             onClick={onClose} 
             className="pointer-events-auto w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors"
           >
             <ChevronLeft size={24} />
           </button>
           <button 
             className="pointer-events-auto w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors"
           >
             <Share2 size={20} />
           </button>
        </div>

        {/* Backdrop Image */}
        <div className="relative w-full h-[400px] sm:h-[500px]">
           {details.backdrop_path ? (
              <>
                <img 
                  src={`${BACKDROP_BASE_URL}${details.backdrop_path}`} 
                  className="w-full h-full object-cover opacity-60"
                  alt="Backdrop"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117]/40 to-transparent" />
              </>
           ) : (
              <div className="w-full h-full bg-gray-900" />
           )}
        </div>

        {/* Content Container (Negative margin to overlap backdrop) */}
        <div className="relative -mt-48 px-4 sm:px-6 pb-20 flex flex-col items-center max-w-5xl mx-auto w-full">
            
            {/* Poster Card */}
            <div className="w-48 sm:w-56 rounded-xl overflow-hidden shadow-2xl border border-white/10 mb-6 bg-[#1f2125]">
               {details.poster_path ? (
                  <img src={`${IMAGE_BASE_URL}${details.poster_path}`} alt="Poster" className="w-full h-auto object-cover" />
               ) : (
                  <div className="aspect-[2/3] w-full flex items-center justify-center text-gray-500 bg-gray-800">No Image</div>
               )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2 drop-shadow-lg">
              {title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400 font-medium mb-8">
               <span>{year}</span>
               {runtime && (
                 <>
                   <span className="text-gray-600">•</span>
                   <span>{runtime}</span>
                 </>
               )}
               <span className="text-gray-600">•</span>
               <span>{typeLabel}</span>
               
               {details.vote_average > 0 && (
                  <>
                    <span className="text-gray-600">•</span>
                    <div className="flex items-center text-yellow-500 gap-1">
                       <Star size={14} fill="currentColor" />
                       <span className="text-white">{details.vote_average.toFixed(1)}</span>
                    </div>
                  </>
               )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3 w-full max-w-md mb-10">
               <button 
                 onClick={toggleWatchlist}
                 className={`flex-1 h-12 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg ${
                    inWatchlist 
                    ? 'bg-gray-800 text-white border border-gray-700' 
                    : 'bg-[#ff5263] hover:bg-[#ff6b7a] text-white'
                 }`}
               >
                  {inWatchlist ? <Check size={18} /> : <Plus size={18} />}
                  <span>{inWatchlist ? 'Dans votre liste' : 'Ajouter à la liste'}</span>
               </button>

               <button 
                 onClick={toggleWatched}
                 className={`h-12 w-12 rounded-full flex items-center justify-center bg-[#24262b] hover:bg-[#2f3238] text-gray-300 transition-colors ${watched ? 'text-[#ff5263]' : ''}`}
                 title={watched ? 'Marqué comme vu' : 'Marquer comme vu'}
               >
                  {watched ? <Check size={20} /> : <span className="text-[10px] font-bold uppercase">Vue</span>}
               </button>

               <button className="h-12 w-12 rounded-full flex items-center justify-center bg-[#24262b] hover:bg-[#2f3238] text-gray-300 transition-colors">
                  <MoreHorizontal size={20} />
               </button>
            </div>

            {/* Watch Providers Box */}
            <div className="w-full max-w-3xl bg-[#161b22] border border-white/5 rounded-xl p-4 mb-10 shadow-lg">
                <div className="flex items-center gap-4">
                   {providers.length > 0 ? (
                      <>
                        <div className="flex -space-x-2">
                           {providers.slice(0, 3).map(p => (
                             <img 
                               key={p.provider_id}
                               src={`https://image.tmdb.org/t/p/original${p.logo_path}`} 
                               className="w-10 h-10 rounded-md shadow-md border border-[#161b22]"
                               alt={p.provider_name}
                               title={p.provider_name}
                             />
                           ))}
                        </div>
                        <div className="h-8 w-px bg-gray-700 mx-2"></div>
                      </>
                   ) : (
                     <div className="w-10 h-10 bg-gray-800 rounded-md flex items-center justify-center">
                        <span className="text-xs text-gray-500">N/A</span>
                     </div>
                   )}
                   
                   <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Provided by</span>
                      <div className="flex items-center text-yellow-500 font-bold text-sm">
                         <span className="text-white mr-1">Just</span>Watch
                      </div>
                   </div>
                </div>
            </div>

            {/* Synopsis */}
            <div className="w-full max-w-3xl text-gray-300 text-sm sm:text-base leading-7 text-justify mb-12 font-light">
               {details.overview || "Aucun résumé disponible."}
            </div>

            {/* Extras Section */}
            <div className="w-full max-w-3xl mb-12">
               <h3 className="text-lg font-bold text-white mb-4">Extras</h3>
               {videos.length > 0 ? (
                   <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-white/5 group cursor-pointer bg-black">
                       <iframe 
                           src={`https://www.youtube.com/embed/${videos[0].key}?autoplay=0`} 
                           title={videos[0].name}
                           className="w-full h-full pointer-events-none" 
                           allowFullScreen 
                         />
                         {/* Interactive Overlay */}
                         <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-black via-transparent to-transparent">
                            <div className="flex items-center justify-center flex-1">
                               <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                   <Play size={28} fill="white" className="ml-1 text-white" />
                               </div>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bande-annonce</p>
                               <h4 className="text-white font-bold text-lg line-clamp-1">{videos[0].name}</h4>
                            </div>
                         </div>
                   </div>
               ) : (
                   <p className="text-gray-500 text-sm">Aucune vidéo disponible.</p>
               )}
            </div>

            {/* Casting Section */}
            <div className="w-full max-w-3xl">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Casting</h3>
               </div>
               
               {cast.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                     {cast.map(actor => (
                        <div key={actor.id} className="flex flex-col items-center text-center">
                           <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2 shadow-md">
                              {actor.profile_path ? (
                                <img src={`${IMAGE_BASE_URL}${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                   <span className="text-xs">No Img</span>
                                </div>
                              )}
                           </div>
                           <p className="text-xs font-bold text-white line-clamp-1 w-full">{actor.name}</p>
                           <p className="text-[10px] text-gray-500 line-clamp-1 w-full">{actor.character}</p>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className="text-gray-500 text-sm">Casting indisponible.</p>
               )}
            </div>

        </div>
    </div>
  );
};

export default MediaDetailModal;