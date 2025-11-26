import React, { useState } from 'react';
import { Search, Compass, List, Filter, Calendar, Settings, User, CheckCircle, Clock, Menu, X, LogIn, LogOut } from 'lucide-react';
import { TabView } from '../types';
import { useStore } from '../store/StoreContext';

interface SidebarProps {
  currentTab: TabView;
  setTab: (tab: TabView) => void;
  toggleFilter: () => void;
  openAuth: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab, toggleFilter, openAuth }) => {
  const { user, logout } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleTabClick = (tab: TabView) => {
    setTab(tab);
    setIsMobileOpen(false);
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab?: TabView; icon: any; label: string }) => {
    const isActive = tab === currentTab;
    return (
      <button
        onClick={() => tab ? handleTabClick(tab) : null}
        className={`w-full flex items-center h-14 transition-all duration-200 relative group overflow-hidden
          ${isActive 
            ? 'text-violet-900 bg-white/40 font-semibold border-r-4 border-violet-600' 
            : 'text-gray-500 hover:text-gray-900 hover:bg-white/30'
          }`}
      >
        <div className="w-20 min-w-[5rem] flex items-center justify-center">
           <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={`text-base whitespace-nowrap transition-opacity duration-200 ${isHovered || isMobileOpen ? 'opacity-100 delay-75' : 'opacity-0 md:opacity-0'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-[60] p-2 bg-white/80 backdrop-blur-md rounded-md shadow-md md:hidden text-gray-700"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed left-0 top-0 h-screen bg-[#f3f4f6]/85 backdrop-blur-xl z-50 flex flex-col justify-between py-6 transition-all duration-300 ease-in-out border-r border-white/20 shadow-lg 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          w-64 ${isHovered ? 'md:w-64' : 'md:w-20'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div>
          {/* Header Logo */}
          <div className="flex items-center h-16 mb-6">
             <div className="w-20 min-w-[5rem] flex items-center justify-center">
                <div className="w-10 h-10 bg-violet-600/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xl">✓</span>
                </div>
             </div>
             <span className={`text-2xl font-bold text-gray-800 tracking-tight transition-opacity duration-200 ${isHovered || isMobileOpen ? 'opacity-100 delay-75' : 'opacity-0 md:opacity-0'}`}>
               favly
             </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <NavItem tab="search" icon={Search} label="Rechercher" />
            <NavItem tab="discover" icon={Compass} label="Découvrir" />
            <NavItem tab="home" icon={List} label="Vu" />
            <NavItem tab="watchlist" icon={Clock} label="À voir" />
            <NavItem tab="agenda" icon={Calendar} label="Agenda" />
            
            <div className="my-4 border-t border-gray-300/30 mx-4"></div>
            
            <button
              onClick={() => { toggleFilter(); setIsMobileOpen(false); }}
              className={`w-full flex items-center h-14 transition-all duration-200 relative group overflow-hidden text-gray-500 hover:text-gray-900 hover:bg-white/30`}
            >
               <div className="w-20 min-w-[5rem] flex items-center justify-center">
                  <Filter size={24} />
               </div>
               <span className={`text-base whitespace-nowrap transition-opacity duration-200 ${isHovered || isMobileOpen ? 'opacity-100 delay-75' : 'opacity-0 md:opacity-0'}`}>
                 Filtres
               </span>
            </button>
          </nav>
        </div>

        {/* Footer / Profile */}
        <div className="space-y-4 px-3">
          {user ? (
            <div className={`flex items-center rounded-xl bg-white/40 border border-white/50 p-2 overflow-hidden shadow-sm ${isHovered || isMobileOpen ? '' : 'justify-center'}`}>
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
               </div>
               {(isHovered || isMobileOpen) && (
                 <div className="ml-3 flex-1 overflow-hidden flex items-center justify-between animate-in fade-in duration-300">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={logout}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Se déconnecter"
                    >
                      <LogOut size={16} />
                    </button>
                 </div>
               )}
            </div>
          ) : (
            <button 
               onClick={openAuth}
               className={`flex items-center w-full rounded-xl p-2 transition-all cursor-pointer border border-transparent
                 ${isHovered || isMobileOpen ? 'bg-violet-600 text-white shadow-lg hover:bg-violet-700' : 'justify-center hover:bg-white/40 text-gray-500'}`}
            >
               <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0`}>
                  <LogIn size={20} />
               </div>
               {(isHovered || isMobileOpen) && (
                 <span className="ml-2 text-sm font-bold whitespace-nowrap animate-in fade-in duration-300">
                    Se connecter
                 </span>
               )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
