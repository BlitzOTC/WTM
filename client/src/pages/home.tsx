import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Event } from "@shared/schema";
import FilterSidebar from "@/components/filter-sidebar";
import EventCard from "@/components/event-card";
import NightPlan from "@/components/night-plan";
import HostEventModal from "@/components/host-event-modal";
import EventDetailModal from "@/components/event-detail-modal";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Filters {
  maxBudget?: number;
  minBudget?: number;
  groupSize?: string;
  categories: string[];
  ageRequirements: string[];
  freeOnly: boolean;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("San Francisco, CA");
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    ageRequirements: [],
    freeOnly: false
  });
  const [sortBy, setSortBy] = useState("time");
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/events?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    }
  });

  // Sort events
  const sortedEvents = [...events].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'popularity':
        return (b.currentAttendees || 0) - (a.currentAttendees || 0);
      case 'distance':
        return 0; // Would need geolocation for real distance sorting
      default:
        return a.startTime.localeCompare(b.startTime);
    }
  });

  const handleAddToPlan = (event: Event) => {
    if (!selectedEvents.find(e => e.id === event.id)) {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  const handleRemoveFromPlan = (eventId: string) => {
    setSelectedEvents(selectedEvents.filter(e => e.id !== eventId));
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const totalBudget = selectedEvents.reduce((sum, event) => sum + (event.price / 100), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Tonight</span>
              </div>
            </div>

            {/* Location Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Enter city, state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-location-search"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                data-testid="button-mobile-filters"
              >
                <Menu className="h-6 w-6" />
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
                    isInPlan={selectedEvents.some(e => e.id === event.id)}
                    data-testid={`card-event-${event.id}`}
                  />
                ))}
              </div>
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
    </div>
  );
}
