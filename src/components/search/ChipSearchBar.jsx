import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Stethoscope, Filter, Check } from 'lucide-react';
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

  const handleSelectSpecialty = (specName) => {
    onAddSpecialty(specName);
    setInputValue('');
    onSearchQueryChange('');
    setIsOpen(false);
  };

  const handleSelectLocation = (locLabel) => {
    onAddLocation(locLabel);
    setInputValue('');
    onSearchQueryChange('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onExecuteSearch();
      setIsOpen(false);
    }
  };

  const hasChips = specialties.length > 0 || locations.length > 0;

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Search Input Box with Chips */}
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 p-2 min-h-[52px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
          <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />

          {/* Render Active Specialty Chips */}
          {specialties.map((spec) => (
            <Badge
              key={`spec-${spec}`}
              className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 border-0 py-1.5 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{spec}</span>
              <button
                type="button"
                onClick={() => onRemoveSpecialty(spec)}
                className="hover:bg-indigo-300 dark:hover:bg-indigo-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}

          {/* Render Active Location Chips */}
          {locations.map((loc) => (
            <Badge
              key={`loc-${loc}`}
              className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 border-0 py-1.5 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
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
          <input
            type="text"
            className="flex-1 bg-transparent border-0 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm px-2 min-w-[140px]"
            placeholder={
              hasChips
                ? "Add more (e.g. Pediatrics, Cleveland, OH)..."
                : "Type specialty or location (e.g. Pediatrics, Pittsburgh, California)..."
            }
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (inputValue.trim()) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
          />

          {/* Search Button */}
          <Button
            type="button"
            onClick={onExecuteSearch}
            className="h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 font-semibold text-xs shrink-0"
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
