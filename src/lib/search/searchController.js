import { loadSpecialties, filterSpecialties } from './specialtyTypeahead';
import { loadLocations, filterLocations } from './locationTypeahead';
import { multiSearch, defaultSearchState, resetPagination, nextPage } from './multiSearch';

export class SearchController {
  constructor(options = {}) {
    this.state = { ...defaultSearchState, ...options.initialState };
    this.onStateChange = options.onStateChange || (() => {});
    this.onResults = options.onResults || (() => {});
    this.onError = options.onError || (() => {});
    this.onLoading = options.onLoading || (() => {});
  }

  async init() {
    this.onLoading(true);
    try {
      await Promise.all([loadSpecialties(), loadLocations()]);
      await this.executeSearch();
    } catch (err) {
      this.onError(err);
    } finally {
      this.onLoading(false);
    }
  }

  getSpecialtySuggestions(query) {
    return filterSpecialties(query);
  }

  getLocationSuggestions(query) {
    return filterLocations(query);
  }

  async executeSearch() {
    this.onLoading(true);
    const { data, error } = await multiSearch(this.state);
    this.onLoading(false);
    if (error) {
      this.onError(error);
    } else {
      this.onResults(data);
    }
  }

  addSpecialty(specialty) {
    if (!specialty || this.state.specialties.includes(specialty)) return;
    this.state = resetPagination({
      ...this.state,
      specialties: [...this.state.specialties, specialty]
    });
    this.onStateChange(this.state);
    this.executeSearch();
  }

  removeSpecialty(specialty) {
    this.state = resetPagination({
      ...this.state,
      specialties: this.state.specialties.filter(s => s !== specialty)
    });
    this.onStateChange(this.state);
    this.executeSearch();
  }

  addLocation(locationLabel) {
    if (!locationLabel || this.state.locations.includes(locationLabel)) return;
    this.state = resetPagination({
      ...this.state,
      locations: [...this.state.locations, locationLabel]
    });
    this.onStateChange(this.state);
    this.executeSearch();
  }

  removeLocation(locationLabel) {
    this.state = resetPagination({
      ...this.state,
      locations: this.state.locations.filter(l => l !== locationLabel)
    });
    this.onStateChange(this.state);
    this.executeSearch();
  }

  setSearchQuery(query) {
    this.state = resetPagination({
      ...this.state,
      searchQuery: query
    });
    this.onStateChange(this.state);
    this.executeSearch();
  }

  setFilter(filterName, value) {
    this.state = resetPagination({
      ...this.state,
      filters: {
        ...this.state.filters,
        [filterName]: value
      }
    });
    this.onStateChange(this.state);
    this.executeSearch();
  }

  async loadMore() {
    this.state = nextPage(this.state);
    this.onStateChange(this.state);
    this.onLoading(true);
    const { data, error } = await multiSearch(this.state);
    this.onLoading(false);
    if (error) {
      this.onError(error);
    } else {
      return data;
    }
  }
}
