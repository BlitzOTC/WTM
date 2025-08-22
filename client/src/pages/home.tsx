import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Event } from "@shared/schema";
import FilterSidebar from "@/components/filter-sidebar";
import FiltersModal from "@/components/filters-modal";
import EventCard from "@/components/event-card";
import NightPlan from "@/components/night-plan";
import HostEventModal from "@/components/host-event-modal";
import EventDetailModal from "@/components/event-detail-modal";
import LocationSearch from "@/components/location-search";
import { usePlan } from "@/hooks/use-plan";
import { Filter, User, ChevronDown } from "lucide-react";
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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    ageRequirements: [],
    freeOnly: false
  });
  const [sortBy, setSortBy] = useState("time");
  const { events: selectedEvents, addEvent, removeEvent, isInPlan } = usePlan();
  const [showHostModal, setShowHostModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Mock user preferences based on previous activity
  const userPreferences = {
    favoriteCategories: ['music', 'drinks', 'food'],
    preferredAgeGroup: '21',
    budgetRange: { min: 0, max: 50 },
    attendedEvents: ['jazz', 'cocktail', 'rooftop']
  };

  // Parse location for API call
  const [city, state] = searchQuery.split(',').map(s => s.trim());

  // Build query parameters
  const queryParams = new URLSearchParams();
  // Add location for Google Places API
  queryParams.append('location', searchQuery);
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

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/events?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    enabled: !!searchQuery // Only run query when we have a search location
  });

  // Calculate recommendation score for each event
  const getRecommendationScore = (event: Event) => {
    let score = 0;
    
    // Boost events in user's favorite categories
    const eventCategories = Array.isArray(event.categories) ? event.categories : [];
    eventCategories.forEach(category => {
      if (userPreferences.favoriteCategories.includes(category)) {
        score += 3;
      }
    });
    
    // Boost events matching preferred age group
    if (event.ageRequirement === userPreferences.preferredAgeGroup) {
      score += 2;
    }
    
    // Boost events within preferred budget range
    const eventPrice = event.price / 100;
    if (eventPrice >= userPreferences.budgetRange.min && eventPrice <= userPreferences.budgetRange.max) {
      score += 2;
    }
    
    // Boost events with keywords from attended events
    userPreferences.attendedEvents.forEach(keyword => {
      if (event.name.toLowerCase().includes(keyword) || (event.description && event.description.toLowerCase().includes(keyword))) {
        score += 1;
      }
    });
    
    return score;
  };

  // Sort events
  const sortedEvents = [...events].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'popularity':
        return (b.currentAttendees || 0) - (a.currentAttendees || 0);
      case 'recommended':
        const scoreA = getRecommendationScore(a);
        const scoreB = getRecommendationScore(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.startTime.localeCompare(b.startTime);
      case 'distance':
        return 0; // Would need geolocation for real distance sorting
      default:
        return a.startTime.localeCompare(b.startTime);
    }
  });

  const handleAddToPlan = (event: Event) => {
    addEvent(event);
  };

  const handleRemoveFromPlan = (eventId: string) => {
    removeEvent(eventId);
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const totalBudget = selectedEvents.reduce((sum, event) => sum + (event.price / 100), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Desktop Dropdown Navigation */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center space-x-2 p-2 hover:bg-gray-50" data-testid="dropdown-navigation-menu">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">Search</span>
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
            </div>

            {/* Center Title */}
            <div className="hidden md:flex flex-1 justify-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {searchQuery ? `Events in ${searchQuery}` : 'Tonight - Find Real Events'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
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
              
              <Button
                onClick={() => setShowHostModal(true)}
                className="bg-primary text-white hover:bg-indigo-700"
                data-testid="button-host-event"
              >
                Host Event
              </Button>
              
              <Button variant="ghost" size="icon" data-testid="button-user-menu">
                <User className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile header for search location */}
        {searchQuery && (
          <div className="md:hidden mb-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <p className="text-sm text-gray-600">Current location:</p>
              <p className="font-medium text-gray-900">{searchQuery}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Change Location
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <aside className={`lg:w-80 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <FilterSidebar 
              filters={filters} 
              onFiltersChange={setFilters}
              data-testid="component-filter-sidebar"
            />
            <NightPlan
              selectedEvents={selectedEvents}
              totalBudget={totalBudget}
              onRemoveEvent={handleRemoveFromPlan}
              data-testid="component-night-plan"
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Show location search if no location is set */}
            {!searchQuery ? (
              <div className="text-center py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Real Events Near You</h1>
                <p className="text-gray-600 mb-8">Search for live events in any city using Google's real-time data</p>
                <div className="max-w-md mx-auto">
                  <LocationSearch
                    onLocationSelect={(location) => {
                      setSearchQuery(location);
                    }}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
                      What's Happening Tonight
                    </h1>
                    <p className="text-gray-600" data-testid="text-location-count">
                      {searchQuery} • {events.length} events found
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48" data-testid="select-sort-by">
                        <SelectValue placeholder="Sort by..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recommended">Recommended for You</SelectItem>
                        <SelectItem value="time">Sort by Time</SelectItem>
                        <SelectItem value="price">Sort by Price</SelectItem>
                        <SelectItem value="popularity">Sort by Popularity</SelectItem>
                        <SelectItem value="distance">Sort by Distance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-gray-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedEvents.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2" data-testid="text-no-events">
                  No events found
                </h3>
                <p className="text-gray-600" data-testid="text-no-events-description">
                  Try adjusting your filters or search for a different location.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onAddToPlan={handleAddToPlan}
                    onViewDetails={handleViewDetails}
                    isInPlan={isInPlan(event.id)}
                    data-testid={`card-event-${event.id}`}
                  />
                ))}
                </div>
              )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <HostEventModal 
        isOpen={showHostModal} 
        onClose={() => setShowHostModal(false)}
        data-testid="modal-host-event"
      />
      <EventDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        event={selectedEvent}
        onAddToPlan={handleAddToPlan}
        isInPlan={selectedEvent ? selectedEvents.some(e => e.id === selectedEvent.id) : false}
        data-testid="modal-event-detail"
      />
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
