import { ArrowLeft, Calendar, MapPin, Users, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function EventsAttended() {
  const [, setLocation] = useLocation();
  
  // Mock attended events data - in real app would come from API
  const attendedEvents = [
    {
      id: '1',
      name: 'Jazz Night at Blue Note',
      venue: 'Blue Note Cafe',
      date: '2024-01-15',
      time: '8:00 PM',
      location: 'Downtown SF',
      attendees: 45,
      price: 25,
      category: 'Music'
    },
    {
      id: '2', 
      name: 'Wine Tasting Experience',
      venue: 'Vintage Cellars',
      date: '2024-01-10',
      time: '6:30 PM',
      location: 'Napa Valley',
      attendees: 20,
      price: 45,
      category: 'Food & Drink'
    },
    {
      id: '3',
      name: 'Tech Meetup: AI & Future',
      venue: 'Innovation Hub',
      date: '2024-01-05',
      time: '7:00 PM',
      location: 'SOMA',
      attendees: 80,
      price: 0,
      category: 'Networking'
    },
    {
      id: '4',
      name: 'Rooftop Comedy Show',
      venue: 'Sky Lounge',
      date: '2023-12-28',
      time: '9:00 PM',
      location: 'Union Square',
      attendees: 60,
      price: 35,
      category: 'Comedy'
    },
    {
      id: '5',
      name: 'Art Gallery Opening',
      venue: 'Modern Arts Center',
      date: '2023-12-20',
      time: '7:30 PM',
      location: 'Mission District',
      attendees: 35,
      price: 15,
      category: 'Arts'
    },
    {
      id: '6',
      name: 'Craft Beer Festival',
      venue: 'Golden Gate Park',
      date: '2023-12-15',
      time: '3:00 PM',
      location: 'Golden Gate Park',
      attendees: 200,
      price: 40,
      category: 'Festival'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/profile')}
              data-testid="button-back-to-profile"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Events Attended</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">You've attended {attendedEvents.length} events</p>
        </div>
      </div>

      {/* Events List */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {attendedEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1" data-testid={`text-event-name-${event.id}`}>
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2" data-testid={`text-event-venue-${event.id}`}>
                    {event.venue}
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {event.category}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span data-testid={`text-event-date-${event.id}`}>
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span data-testid={`text-event-time-${event.id}`}>
                    {event.time}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span data-testid={`text-event-location-${event.id}`}>
                    {event.location}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span data-testid={`text-event-attendees-${event.id}`}>
                    {event.attendees} attended
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600" data-testid={`text-event-price-${event.id}`}>
                      {event.price === 0 ? 'Free' : event.price}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    data-testid={`button-view-event-${event.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {attendedEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events attended yet</h3>
              <p className="text-gray-600">Start exploring events to build your attendance history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}