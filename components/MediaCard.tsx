import React, { useState } from 'react';
import { MoreVertical, Check, Clock, Star, Loader2 } from 'lucide-react';
import { MediaItem } from '../types';
import { IMAGE_BASE_URL, tmdbService } from '../services/tmdbService';
import { useStore } from '../store/StoreContext';

interface MediaCardProps {
  item: MediaItem;
  onClick?: (item: MediaItem) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onClick }) => {
  const { isWatched, isInWatchlist, addToWatched, removeFromWatched, addToWatchlist, removeFromWatchlist } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  
  const watched = isWatched(item.id);
  const inWatchlist = isInWatchlist(item.id);

  const title = item.title || item.name || 'Untitled';
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  
  // Robust type inference
  const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const isMovie = mediaType === 'movie';
  const typeLabel = isMovie ? 'Films' : 'Séries';
  
  const vote = item.vote_average ? item.vote_average.toFixed(1) : '';

  // Helper to get fresh details with English poster before adding
  const handleActionWithDetails = async (action: (i: MediaItem) => void) => {
      setLoadingAction(true);
      try {
          // Fetch full details which enforces English poster via getDetails logic
          const details = await tmdbService.getDetails(item.id, mediaType);
          // Ensure we preserve the inferred type if API doesn't return it explicitly (though getDetails usually does)
          if (!details.media_type) details.media_type = mediaType;
          action(details);
      } catch (error) {
          console.error("Error fetching details for add", error);
          // Fallback to existing item if fetch fails, ensuring type is set
          action({ ...item, media_type: mediaType });
      } finally {
          setLoadingAction(false);
          setMenuOpen(false);
      }
  };

  const handleToggleWatched = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (watched) {
      removeFromWatched(item.id);
      setMenuOpen(false);
    } else {
      await handleActionWithDetails(addToWatched);
    }
  };

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(item.id);
      setMenuOpen(false);
    } else {
      await handleActionWithDetails(addToWatchlist);
    }
  };

  return (
    <div 
      onClick={() => onClick && onClick({ ...item, media_type: mediaType })}
      className="group relative flex flex-col h-full rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl bg-gray-900 cursor-pointer"
    >
      <div className="relative aspect-[2/3] w-full">
        {item.poster_path ? (
          <img
            src={`${IMAGE_BASE_URL}${item.poster_path}`}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-500">
            <span className="text-xs text-center p-2">{title}</span>
          </div>
        )}

        {/* Hover Overlay with Gradient and Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
           
           <h3 className="text-white font-bold text-lg leading-tight mb-2 drop-shadow-md line-clamp-2">{title}</h3>
           
           <div className="flex items-center justify-between text-gray-300 text-xs font-medium">
             <div className="flex items-center space-x-2">
               <span>{year}</span>
               {vote && (
                 <div className="flex items-center space-x-1 text-yellow-400">
                   <Star size={12} fill="currentColor" />
                   <span>{vote}</span>
                 </div>
               )}
             </div>
             
             <span className="bg-gray-700/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
               {typeLabel}
             </span>
           </div>
        </div>

        {/* Top Right Menu Button */}
        <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="relative">
             <button 
               onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
               className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
               disabled={loadingAction}
             >
               {loadingAction ? <Loader2 size={20} className="animate-spin" /> : <MoreVertical size={20} />}
             </button>

             {/* Dropdown Menu */}
             {menuOpen && (
               <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-1 text-gray-800 z-50 animate-in fade-in zoom-in-95 duration-200">
                 <button 
                    onClick={handleToggleWatchlist}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 text-left"
                    disabled={loadingAction}
                 >
                    <div className={`p-1 rounded-full ${inWatchlist ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Clock size={16} />
                    </div>
                    <span className="text-sm font-medium">{inWatchlist ? 'Retirer de À voir' : 'Ajouter à À voir'}</span>
                 </button>
                 
                 <button 
                    onClick={handleToggleWatched}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 text-left border-t border-gray-100"
                    disabled={loadingAction}
                 >
                    <div className={`p-1 rounded-full ${watched ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Check size={16} />
                    </div>
                    <span className="text-sm font-medium">{watched ? 'Marquer non vu' : 'Marquer vu'}</span>
                 </button>
               </div>
             )}
           </div>
        </div>
        
        {/* Status Indicators */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
             {watched && (
                 <div className="p-1 rounded-full bg-violet-600/90 text-white shadow-sm" title="Vu">
                     <Check size={14} />
                 </div>
             )}
             {inWatchlist && !watched && (
                 <div className="p-1 rounded-full bg-blue-600/90 text-white shadow-sm" title="À voir">
                     <Clock size={14} />
                 </div>
             )}
        </div>
      </div>
      
      {menuOpen && (
        <div className="fixed inset-0 z-0" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
      )}
    </div>
  );
};

export default MediaCard;