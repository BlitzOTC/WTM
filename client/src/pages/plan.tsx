import { type Event } from "@shared/schema";
import EventCard from "@/components/event-card";
import { BookOpen, MapPin, Clock, DollarSign, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePlan } from "@/hooks/use-plan";

export default function Plan() {
  const { events: selectedEvents, removeEvent, clearPlan } = usePlan();

  // Calculate total cost
  const totalCost = selectedEvents.reduce((sum, event) => sum + event.price, 0);
  
  // Format total cost
  const formatTotalCost = (cost: number) => {
    if (cost === 0) return "FREE";
    return `$${(cost / 100).toFixed(0)}`;
  };

  // Calculate estimated time span
  const getTimeSpan = () => {
    if (selectedEvents.length === 0) return null;
    
    const times = selectedEvents.map(event => {
      const [hours, minutes] = event.startTime.split(':');
      return parseInt(hours) * 60 + parseInt(minutes);
    }).sort((a, b) => a - b);
    
    const startTime = times[0];
    const endTime = times[times.length - 1] + 120; // Assume 2 hours per event
    
    const formatTime = (minutes: number) => {
      const hour = Math.floor(minutes / 60) % 24;
      const min = minutes % 60;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`;
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const handleRemoveFromPlan = (event: Event) => {
    removeEvent(event.id);
  };

  const handleViewDetails = (event: Event) => {
    console.log('View details for:', event.name);
  };

  const handleOptimizeRoute = () => {
    // TODO: Implement route optimization
    console.log('Optimizing route for:', selectedEvents.length, 'events');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex items-center space-x-2 p-2 hover:bg-gray-50" data-testid="dropdown-navigation-menu">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">My Plan</span>
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
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">My Plan</h1>
            </div>
          </div>
          <p className="text-gray-600 md:ml-14">Your curated night out</p>
        </div>

        {selectedEvents.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events in your plan</h3>
            <p className="text-gray-600 mb-4">Start adding events to create your perfect night</p>
            <Button 
              onClick={() => window.history.back()}
              className="bg-primary text-white hover:bg-indigo-700"
              data-testid="button-browse-events"
            >
              Browse Events
            </Button>
          </div>
        ) : (
          <>
            {/* Plan Summary */}
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Plan Summary</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{selectedEvents.length} events</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{formatTotalCost(totalCost)}</span>
                </div>
                
                {getTimeSpan() && (
                  <div className="flex items-center space-x-2 col-span-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{getTimeSpan()}</span>
                  </div>
                )}
              </div>
              
              {selectedEvents.length > 1 && (
                <Button
                  onClick={handleOptimizeRoute}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  data-testid="button-optimize-route"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Optimize Route
                </Button>
              )}
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {selectedEvents.map((event, index) => (
                <div key={event.id} className="relative">
                  {index > 0 && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gray-300 rounded-full p-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      </div>
                    </div>
                  )}
                  
                  <EventCard
                    event={event}
                    onAddToPlan={handleRemoveFromPlan}
                    onViewDetails={handleViewDetails}
                    isInPlan={true}
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                className="w-full bg-green-600 text-white hover:bg-green-700"
                size="lg"
                data-testid="button-start-night"
              >
                Start Your Night
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={clearPlan}
                data-testid="button-clear-plan"
              >
                Clear Plan
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}