import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Event } from "@shared/schema";
import EventCard from "@/components/event-card";
import { Calendar, MapPin } from "lucide-react";

export default function Tonight() {
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

  // Get events happening tonight
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', 'tonight'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    }
  });

  // Filter events for tonight (simplified - you could add date filtering here)
  const tonightEvents = events.filter(event => {
    const now = new Date();
    const currentHour = now.getHours();
    const eventHour = parseInt(event.startTime.split(':')[0]);
    // Show events starting from current time onwards
    return eventHour >= currentHour;
  });

  const handleAddToPlan = (event: Event) => {
    if (!selectedEvents.find(e => e.id === event.id)) {
      setSelectedEvents([...selectedEvents, event]);
    }
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
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">Tonight</h1>
          </div>
          <p className="text-gray-600">Events happening tonight</p>
        </div>

        {/* Current Location */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">San Francisco, CA</span>
          </div>
        </div>

        {/* Events List */}
        {tonightEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events tonight</h3>
            <p className="text-gray-600">Check back later or explore other dates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tonightEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onAddToPlan={handleAddToPlan}
                onViewDetails={handleViewDetails}
                isInPlan={selectedEvents.some(e => e.id === event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}