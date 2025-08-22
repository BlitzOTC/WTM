import { ArrowLeft, User, MapPin, Users, Clock, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function EventsHosted() {
  const [, setLocation] = useLocation();
  
  // Mock hosted events data - in real app would come from API
  const hostedEvents = [
    {
      id: '1',
      name: 'Summer BBQ & Networking',
      venue: 'My Backyard',
      date: '2024-01-20',
      time: '4:00 PM',
      location: 'San Francisco, CA',
      attendees: 25,
      maxCapacity: 30,
      price: 20,
      category: 'Social',
      status: 'Upcoming'
    },
    {
      id: '2',
      name: 'Book Club Discussion',
      venue: 'Local Coffee Shop',
      date: '2024-01-08',
      time: '2:00 PM',
      location: 'Castro District',
      attendees: 12,
      maxCapacity: 15,
      price: 0,
      category: 'Education',
      status: 'Completed'
    },
    {
      id: '3',
      name: 'Photography Walk',
      venue: 'Outdoor Event',
      date: '2023-12-10',
      time: '10:00 AM',
      location: 'Golden Gate Bridge',
      attendees: 18,
      maxCapacity: 20,
      price: 15,
      category: 'Arts',
      status: 'Completed'
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
              <User className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Events Hosted</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">You've hosted {hostedEvents.length} events</p>
        </div>
      </div>

      {/* Events List */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {hostedEvents.map((event) => (
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
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {event.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    event.status === 'Upcoming' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
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
                  <span data-testid={`text-event-capacity-${event.id}`}>
                    {event.attendees}/{event.maxCapacity} spots
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600" data-testid={`text-event-price-${event.id}`}>
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      data-testid={`button-edit-event-${event.id}`}
                    >
                      Edit Event
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      data-testid={`button-view-attendees-${event.id}`}
                    >
                      View Attendees
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {hostedEvents.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events hosted yet</h3>
              <p className="text-gray-600">Create your first event to start hosting amazing experiences</p>
              <Button className="mt-4" data-testid="button-create-first-event">
                Host Your First Event
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}