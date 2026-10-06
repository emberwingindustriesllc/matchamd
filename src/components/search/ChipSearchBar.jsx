import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Stethoscope, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { loadSpecialties, filterSpecialties } from '@/lib/search/specialtyTypeahead';
import { loadLocations, filterLocations } from '@/lib/search/locationTypeahead';

export default function ChipSearchBar({
  specialties = [],
  onAddSpecialty,
  onRemoveSpecialty,
  locations = [],
  onAddLocation,
  onRemoveLocation,
  searchQuery = '',
  onSearchQueryChange,
  onExecuteSearch,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  filters = {},
  onFilterChange
}) {
  const [inputValue, setInputValue] = useState('');
  const [specialtySuggestions, setSpecialtySuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Load typeahead caches on mount
  useEffect(() => {
    loadSpecialties();
    loadLocations();
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync input value with parent searchQuery
  useEffect(() => {
    if (searchQuery !== inputValue) {
      setInputValue(searchQuery || '');
    }
  }, [searchQuery]);

  // Update suggestions when user types
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onSearchQueryChange(val);

    if (val.trim()) {
      setSpecialtySuggestions(filterSpecialties(val, 5));
      setLocationSuggestions(filterLocations(val, 5));
      setIsOpen(true);
    } else {
      setSpecialtySuggestions([]);
      setLocationSuggestions([]);
      setIsOpen(false);
    }
  };

  // Debounced free-text search
  useEffect(() => {
    const term = inputValue.trim();
    if (!term || !onExecuteSearch) return undefined;
    const id = setTimeout(() => {
      onExecuteSearch(term);
    }, 450);
    return () => clearTimeout(id);
  }, [inputValue, onExecuteSearch]);

  const handleClearInput = () => {
    setInputValue('');
    onSearchQueryChange('');
    if (onExecuteSearch) onExecuteSearch('');
    setIsOpen(false);
  };

  const handleSelectSpecialty = (specName) => {
    onAddSpecialty(specName);
    setInputValue('');
    onSearchQueryChange('');
    if (onExecuteSearch) onExecuteSearch('');
    setIsOpen(false);
  };

  const handleSelectLocation = (locLabel) => {
    onAddLocation(locLabel);
    setInputValue('');
    onSearchQueryChange('');
    if (onExecuteSearch) onExecuteSearch('');
    setIsOpen(false);
  };

  const handleExecute = () => {
    const term = inputValue.trim();
    if (!term) {
      setIsOpen(false);
      return;
    }

    // Prefer an explicit typeahead pick when one is available...
    const topSpecialty = specialtySuggestions[0];
    const topLocation = locationSuggestions[0];
    if (topSpecialty) {
      const specName = topSpecialty.specialty || topSpecialty.name;
      if (specName) onAddSpecialty(specName);
    } else if (topLocation) {
      onAddLocation(topLocation.location_label || `${topLocation.city}, ${topLocation.state}`);
    }

    // ...but always also run the raw text as a free-text query, so the search
    // is never silently reduced to a chip the user did not choose.
    onSearchQueryChange(term);
    if (onExecuteSearch) {
      onExecuteSearch(term);
    }
    setInputValue('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  const hasChips = specialties.length > 0 || locations.length > 0;

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Search Input Box with Chips */}
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 p-2 min-h-[52px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#1B4332] dark:focus-within:ring-[#D8F3DC]">
          <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />

          {/* Render Active Specialty Chips */}
          {specialties.map((spec) => (
            <Badge
              key={`spec-${spec}`}
              className="bg-[#D8F3DC] dark:bg-emerald-950/60 text-[#1B4332] dark:text-[#D8F3DC] hover:bg-[#D8F3DC]/80 border border-emerald-300/40 py-1.5 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{spec}</span>
              <button
                type="button"
                onClick={() => onRemoveSpecialty(spec)}
                className="hover:bg-emerald-300 dark:hover:bg-emerald-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}

          {/* Render Active Location Chips */}
          {locations.map((loc) => (
            <Badge
              key={`loc-${loc}`}
              className="bg-[#D8F3DC] dark:bg-emerald-950/60 text-[#1B4332] dark:text-[#D8F3DC] hover:bg-[#D8F3DC]/80 border border-emerald-300/40 py-1.5 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{loc}</span>
              <button
                type="button"
                onClick={() => onRemoveLocation(loc)}
                className="hover:bg-emerald-300 dark:hover:bg-emerald-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}

          {/* Text Input */}
          <div className="flex-1 flex items-center min-w-[140px] relative">
            <input
              type="text"
              className="w-full bg-transparent border-0 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm px-2 pr-7"
              placeholder={
                hasChips
                  ? "Add more (e.g. Pediatrics, Cleveland, OH)..."
                  : "Type specialty, program, or location (e.g. Pediatrics, Miami, Cleveland, OH)..."
              }
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => {
                if (inputValue.trim()) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClearInput}
                className="absolute right-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <Button
            type="button"
            onClick={handleExecute}
            className="h-10 rounded-xl bg-[#1B4332] hover:bg-[#1B4332]/90 text-[#D8F3DC] active:scale-95 transition-all px-5 font-semibold text-xs shrink-0 cursor-pointer shadow-sm"
          >
            Search
          </Button>

          {/* Filters Toggle Button */}
          {onToggleAdvancedFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={onToggleAdvancedFilters}
              className={`h-10 rounded-xl px-3 text-xs shrink-0 ${
                showAdvancedFilters
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5 mr-1" />
              Filters
            </Button>
          )}
        </div>

        {/* Typeahead Suggestions Dropdown */}
        {isOpen && (specialtySuggestions.length > 0 || locationSuggestions.length > 0) && (
          <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
            {/* Specialties Group */}
            {specialtySuggestions.length > 0 && (
              <div className="p-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-indigo-500" />
                  Specialties
                </div>
                {specialtySuggestions.map((item) => (
                  <button
                    key={`s-sug-${item.specialty || item.name}`}
                    type="button"
                    onClick={() => handleSelectSpecialty(item.specialty || item.name)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                  >
                    <span className="font-medium">{item.specialty || item.name}</span>
                    <span className="text-xs text-slate-400">{item.program_count} programs</span>
                  </button>
                ))}
              </div>
            )}

            {/* Locations Group */}
            {locationSuggestions.length > 0 && (
              <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  Locations (City / State)
                </div>
                {locationSuggestions.map((loc) => (
                  <button
                    key={`l-sug-${loc.location_label || `${loc.city}-${loc.state}`}`}
                    type="button"
                    onClick={() => handleSelectLocation(loc.location_label || `${loc.city}, ${loc.state}`)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                  >
                    <span className="font-medium">{loc.location_label || `${loc.city}, ${loc.state}`}</span>
                    <span className="text-xs text-slate-400">{loc.program_count} programs</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Boolean Filter Toggles */}
      {showAdvancedFilters && filters && onFilterChange && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.acgmeAccredited === true}
              onChange={(e) => onFilterChange('acgmeAccredited', e.target.checked ? true : null)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">ACGME Accredited</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.ecfmgPathway === true}
              onChange={(e) => onFilterChange('ecfmgPathway', e.target.checked ? true : null)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">ECFMG Pathway</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.j1Visa === true}
              onChange={(e) => onFilterChange('j1Visa', e.target.checked ? true : null)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">J-1 Visa Sponsor</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.h1bVisa === true}
              onChange={(e) => onFilterChange('h1bVisa', e.target.checked ? true : null)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">H-1B Visa Sponsor</span>
          </label>
        </div>
      )}
    </div>
  );
}
