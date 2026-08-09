import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ChevronDown, Check, X, Search, Sparkles } from 'lucide-react';

export default function MultiSelectDropdown({
  title = 'Options',
  placeholder = 'Select items...',
  options = [],
  selectedValues = [],
  onChange = () => {},
  presets = [],
  icon: Icon,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase().trim())
  );

  const toggleOption = (val) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleSelectAll = () => {
    const allVals = normalizedOptions.map((o) => o.value);
    onChange(allVals);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const applyPreset = (presetValues) => {
    const combined = Array.from(new Set([...selectedValues, ...presetValues]));
    onChange(combined);
  };

  const count = selectedValues.length;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between rounded-xl h-11 px-3.5 border-slate-200 dark:border-slate-800 text-left font-normal ${
              count > 0 ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate pr-2">
              {Icon && <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />}
              <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                {count === 0
                  ? placeholder
                  : `${title} (${count})`}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {count > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 text-xs px-1.5 py-0.5 rounded-md"
                >
                  {count}
                </Badge>
              )}
              <ChevronDown className="w-4 h-4 text-slate-400 opacity-70" />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] sm:w-[340px] p-3 rounded-2xl shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" align="start">
          {/* Header & Quick Action */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Presets if provided */}
          {presets.length > 0 && (
            <div className="mb-3 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Wide Net Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => applyPreset(preset.values)}
                    className="h-7 text-xs px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border border-indigo-200/50 dark:border-indigo-800/50"
                  >
                    + {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs rounded-lg border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* List Options */}
          <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No options found</p>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOption(opt.value)}
                        className="rounded border-slate-300 dark:border-slate-700"
                      />
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Selected Badges */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedValues.map((val) => {
            const label = normalizedOptions.find((o) => o.value === val)?.label || val;
            return (
              <Badge
                key={val}
                variant="outline"
                className="bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium py-0.5 pl-2 pr-1 rounded-md flex items-center gap-1"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => toggleOption(val)}
                  className="hover:bg-indigo-200 dark:hover:bg-indigo-900 rounded p-0.5 transition-colors"
                >
                  <X className="w-3 h-3 text-indigo-500" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
