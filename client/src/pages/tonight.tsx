import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Event } from "@shared/schema";
import EventCard from "@/components/event-card";
import FilterSidebar from "@/components/filter-sidebar";
import FiltersModal from "@/components/filters-modal";
import LocationSearch from "@/components/location-search";
import { usePlan } from "@/hooks/use-plan";
import { Calendar, MapPin, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Filters {
  maxBudget?: number;
  minBudget?: number;
  groupSize?: string;
  categories: string[];
  ageRequirements: string[];
  freeOnly: boolean;
}

export default function Tonight() {
  const { addEvent, isInPlan } = usePlan();
  const [searchQuery, setSearchQuery] = useState("San Francisco, CA");
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    ageRequirements: [],
    freeOnly: false
  });
  const [sortBy, setSortBy] = useState("time");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Parse location for API call
  const [city, state] = searchQuery.split(',').map(s => s.trim());

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (city) queryParams.append('city', city);
  if (state) queryParams.append('state', state);
  if (filters.categories.length > 0) {
    filters.categories.forEach(cat => queryParams.append('categories', cat));
  }
  if (filters.ageRequirements.length > 0) {
    filters.ageRequirements.forEach(age => queryParams.append('ageRequirement', age));
  }
  if (filters.maxBudget !== undefined) {
    queryParams.append('maxPrice', filters.maxBudget.toString());
  }
  if (filters.minBudget !== undefined) {
    queryParams.append('minPrice', filters.minBudget.toString());
  }
  if (filters.freeOnly) {
    queryParams.append('maxPrice', '0');
  }

  // Get events happening tonight
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', 'tonight', queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/events?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    }
  });

  // Filter events for tonight and currently happening events
  const tonightEvents = events.filter(event => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinutes;
    
    const [startHour, startMinutes] = event.startTime.split(':').map(Number);
    const startTime = startHour * 60 + startMinutes;
    
    const [endHour, endMinutes] = event.endTime ? event.endTime.split(':').map(Number) : [startHour + 3, startMinutes]; // Default 3 hour duration
    const endTime = endHour * 60 + endMinutes;
    
    // Show events that are currently happening or starting later tonight
    return (currentTime >= startTime && currentTime <= endTime) || startTime >= currentTime;
  });

  // Sort events
  const sortedEvents = [...tonightEvents].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'popularity':
        return (b.currentAttendees || 0) - (a.currentAttendees || 0);
      case 'happening-now':
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const aStart = parseInt(a.startTime.split(':')[0]) * 60 + parseInt(a.startTime.split(':')[1]);
        const aEnd = a.endTime ? parseInt(a.endTime.split(':')[0]) * 60 + parseInt(a.endTime.split(':')[1]) : aStart + 180;
        const aIsHappening = currentTime >= aStart && currentTime <= aEnd;
        
        const bStart = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1]);
        const bEnd = b.endTime ? parseInt(b.endTime.split(':')[0]) * 60 + parseInt(b.endTime.split(':')[1]) : bStart + 180;
        const bIsHappening = currentTime >= bStart && currentTime <= bEnd;
        
        if (aIsHappening && !bIsHappening) return -1;
        if (!aIsHappening && bIsHappening) return 1;
        return a.startTime.localeCompare(b.startTime);
      default:
        return a.startTime.localeCompare(b.startTime);
    }
  });

  const handleAddToPlan = (event: Event) => {
    addEvent(event);
  };

  const handleViewDetails = (event: Event) => {
    // Handle event details view
    console.log('View details for:', event.name);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tonight's events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center space-x-2 p-2 hover:bg-gray-50" data-testid="dropdown-navigation-menu">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">Tonight</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => window.location.href = '/'} data-testid="nav-dropdown-search">
                    🔍 Search
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/tonight'} data-testid="nav-dropdown-tonight">
                    📅 Tonight
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/plan'} data-testid="nav-dropdown-plan">
                    📋 My Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/profile'} data-testid="nav-dropdown-profile">
                    👤 Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile header */}
              <div className="flex items-center space-x-2 md:hidden">
                <Calendar className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-gray-900">Tonight</h1>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersModal(true)}
              data-testid="button-filters"
              className="flex items-center space-x-1"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
          
          {/* Location Search */}
          <LocationSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search any city worldwide..."
          />
        </div>
      </div>

      <div className="p-4">
        {/* Filters (Mobile) */}
        {showMobileFilters && (
          <div className="mb-6">
            <FilterSidebar 
              filters={filters} 
              onFiltersChange={setFilters}
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600 text-sm">
              {searchQuery} • {sortedEvents.length} events
            </p>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="happening-now">Happening Now</SelectItem>
              <SelectItem value="time">By Time</SelectItem>
              <SelectItem value="price">By Price</SelectItem>
              <SelectItem value="popularity">By Popularity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events tonight</h3>
            <p className="text-gray-600">Try adjusting your filters or search another location</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onAddToPlan={handleAddToPlan}
                onViewDetails={handleViewDetails}
                isInPlan={isInPlan(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <FiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={filters}
        onFiltersChange={setFilters}
        data-testid="modal-filters"
      />
    </div>
  );
}