import React from 'react';
import { X, Grid } from 'lucide-react';
import { FilterState } from '../types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, filters, setFilters }) => {
  const handleGridChange = (cols: number) => {
    setFilters(prev => ({ ...prev, gridColumns: cols }));
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-80 bg-white/70 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out z-30 flex flex-col border-l border-white/20 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6 border-b border-gray-200/50 flex items-center justify-between bg-white/40">
        <h2 className="text-xl font-bold text-gray-800">Filtres</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
          <X size={24} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Grid Size Control */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Affichage</label>
          <div className="flex bg-gray-100/50 p-1 rounded-lg">
             <button 
                onClick={() => handleGridChange(4)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${filters.gridColumns === 4 ? 'bg-white shadow-sm text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Petit
             </button>
             <button 
                onClick={() => handleGridChange(5)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${filters.gridColumns === 5 ? 'bg-white shadow-sm text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Moyen
             </button>
             <button 
                onClick={() => handleGridChange(6)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${filters.gridColumns === 6 ? 'bg-white shadow-sm text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Grand
             </button>
          </div>
        </div>

        {/* Sort */}
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Trier par</label>
           <select
             className="w-full bg-gray-100/50 border-none rounded-lg py-3 px-4 text-gray-700 focus:ring-2 focus:ring-violet-500"
             value={filters.sort}
             onChange={(e) => setFilters(prev => ({...prev, sort: e.target.value}))}
           >
             <option value="recent">Populaires / Récents</option>
             <option value="year">Année de sortie</option>
             <option value="alpha">Ordre alphabétique</option>
           </select>
        </div>

        {/* Genre */}
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Genre</label>
           <select 
             className="w-full bg-gray-100/50 border-none rounded-lg py-3 px-4 text-gray-700 focus:ring-2 focus:ring-violet-500"
             value={filters.genre}
             onChange={(e) => setFilters(prev => ({...prev, genre: e.target.value}))}
           >
             <option value="all">Tous</option>
             <option value="action">Action / Aventure</option>
             <option value="comedy">Comédie</option>
             <option value="drama">Drame</option>
             <option value="scifi">Science-Fiction / Fantastique</option>
             <option value="horror">Horreur</option>
           </select>
        </div>

        {/* Notes / Ratings Slider */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex justify-between">
            <span>Note Minimum</span>
            <span className="text-violet-600">{filters.minVote} / 10</span>
          </label>
          <div className="px-2">
             <input 
               type="range" 
               min="0" 
               max="10" 
               step="1" 
               value={filters.minVote} 
               onChange={(e) => setFilters(prev => ({ ...prev, minVote: parseInt(e.target.value) }))}
               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
             />
             <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0</span>
                <span>5</span>
                <span>10</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FilterDrawer;