import React, { useState, useEffect } from 'react';
import { Play, Info, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { MediaItem } from '../types';
import { BACKDROP_BASE_URL } from '../services/tmdbService';

interface HeroSliderProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ items, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const title = currentItem.title || currentItem.name;
  const year = (currentItem.release_date || currentItem.first_air_date || '').split('-')[0];

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] rounded-2xl overflow-hidden shadow-2xl mb-10 group bg-gray-900">
      {/* Background Images with Fade Transition */}
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {item.backdrop_path ? (
            <img
              src={`${BACKDROP_BASE_URL}${item.backdrop_path}`}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
             <div className="w-full h-full bg-gray-800" />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#f3f4f6] via-[#f3f4f6]/10 to-transparent sm:from-gray-900 sm:via-gray-900/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end sm:justify-center p-8 sm:p-12 md:pl-20 max-w-4xl">
        <div className="animate-in slide-in-from-bottom-5 fade-in duration-700" key={currentItem.id}>
           <div className="flex items-center space-x-2 mb-3">
              <span className="bg-violet-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                Tendance N°{currentIndex + 1}
              </span>
              <span className="flex items-center text-yellow-400 text-sm font-bold gap-1">
                 <Star size={14} fill="currentColor" />
                 {currentItem.vote_average.toFixed(1)}
              </span>
           </div>

           <h2 className="text-3xl sm:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
             {title}
           </h2>

           <div className="flex items-center text-gray-300 text-sm sm:text-base mb-6 font-medium">
             <span>{year}</span>
             <span className="mx-2">•</span>
             <span>{currentItem.media_type === 'movie' ? 'Film' : 'Série'}</span>
           </div>

           <p className="text-gray-300 text-sm sm:text-base mb-8 line-clamp-2 max-w-xl drop-shadow-md hidden sm:block">
             {currentItem.overview}
           </p>

           <div className="flex items-center gap-4">
             <button 
                onClick={() => onSelect(currentItem)}
                className="px-6 py-3 bg-[#ff5263] hover:bg-[#ff6b7a] text-white rounded-full font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg"
             >
                <Info size={20} />
                <span>Détails</span>
             </button>
           </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-6 right-6 flex items-center space-x-2">
         <button onClick={prevSlide} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors">
            <ChevronLeft size={20} />
         </button>
         <div className="flex space-x-1.5 mx-2">
           {items.map((_, idx) => (
             <div 
               key={idx} 
               className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
             />
           ))}
         </div>
         <button onClick={nextSlide} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors">
            <ChevronRight size={20} />
         </button>
      </div>
    </div>
  );
};

export default HeroSlider;