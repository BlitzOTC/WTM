import { ArrowLeft, Calendar, MapPin, Users, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function CityEvents() {
  const [location, setLocation] = useLocation();
  const [cityData, setCityData] = useState<any>(null);
  
  // Extract city from URL params (in real app would use proper routing params)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cityId = urlParams.get('city');
    
    // Mock city events data - in real app would come from API based on cityId
    const cityEventsData = {
      '1': {
        city: 'San Francisco',
        state: 'California',
        events: [
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
            id: '3',
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
            id: '4',
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
            id: '5',
            name: 'Craft Beer Festival',
            venue: 'Golden Gate Park',
            date: '2023-12-15',
            time: '3:00 PM',
            location: 'Golden Gate Park',
            attendees: 200,
            price: 40,
            category: 'Festival'
          },
          {
            id: '6',
            name: 'Startup Networking Event',
            venue: 'WeWork SOMA',
            date: '2023-11-10',
            time: '6:00 PM',
            location: 'SOMA',
            attendees: 55,
            price: 20,
            category: 'Networking'
          },
          {
            id: '7',
            name: 'Wine & Paint Night',
            venue: 'Local Art Studio',
            date: '2023-10-22',
            time: '7:00 PM',
            location: 'Mission District',
            attendees: 25,
            price: 30,
            category: 'Arts'
          },
          {
            id: '8',
            name: 'Food Truck Festival',
            venue: 'Pier 39',
            date: '2023-09-18',
            time: '12:00 PM',
            location: 'Fisherman\'s Wharf',
            attendees: 150,
            price: 0,
            category: 'Food & Drink'
          }
        ]
      },
      '2': {
        city: 'Los Angeles',
        state: 'California',
        events: [
          {
            id: '9',
            name: 'Hollywood Bowl Concert',
            venue: 'Hollywood Bowl',
            date: '2023-08-22',
            time: '8:00 PM',
            location: 'Hollywood',
            attendees: 500,
            price: 75,
            category: 'Music'
          },
          {
            id: '10',
            name: 'Beach Volleyball Tournament',
            venue: 'Santa Monica Beach',
            date: '2023-07-15',
            time: '10:00 AM',
            location: 'Santa Monica',
            attendees: 80,
            price: 15,
            category: 'Sports'
          },
          {
            id: '11',
            name: 'Film Festival Screening',
            venue: 'TCL Chinese Theatre',
            date: '2023-06-10',
            time: '7:30 PM',
            location: 'Hollywood',
            attendees: 300,
            price: 30,
            category: 'Entertainment'
          }
        ]
      },
      '3': {
        city: 'New York',
        state: 'New York',
        events: [
          {
            id: '12',
            name: 'Broadway Show',
            venue: 'Majestic Theatre',
            date: '2023-11-08',
            time: '8:00 PM',
            location: 'Times Square',
            attendees: 1500,
            price: 120,
            category: 'Theatre'
          },
          {
            id: '13',
            name: 'Yankees Game',
            venue: 'Yankee Stadium',
            date: '2023-11-05',
            time: '1:00 PM',
            location: 'Bronx',
            attendees: 40000,
            price: 60,
            category: 'Sports'
          }
        ]
      },
      '4': {
        city: 'Seattle',
        state: 'Washington',
        events: [
          {
            id: '14',
            name: 'Coffee Tasting Experience',
            venue: 'Pike Place Market',
            date: '2023-09-12',
            time: '2:00 PM',
            location: 'Downtown Seattle',
            attendees: 20,
            price: 45,
            category: 'Food & Drink'
          }
        ]
      },
      '5': {
        city: 'Portland',
        state: 'Oregon',
        events: [
          {
            id: '15',
            name: 'Craft Beer Tasting',
            venue: 'Local Brewery',
            date: '2023-07-20',
            time: '6:00 PM',
            location: 'Pearl District',
            attendees: 30,
            price: 30,
            category: 'Food & Drink'
          }
        ]
      }
    };
    
    if (cityId && cityEventsData[cityId as keyof typeof cityEventsData]) {
      setCityData(cityEventsData[cityId as keyof typeof cityEventsData]);
    }
  }, [location]);

  if (!cityData) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/cities-explored')}
            data-testid="button-back-to-cities"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cities
          </Button>
          <div className="text-center py-12">
            <p className="text-gray-600">City not found</p>
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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/cities-explored')}
              data-testid="button-back-to-cities"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cities
            </Button>
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">
                {cityData.city}, {cityData.state}
              </h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            You attended {cityData.events.length} events in this city
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {cityData.events.map((event: any) => (
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
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    data-testid={`button-view-event-details-${event.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {cityData.events.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events in this city</h3>
              <p className="text-gray-600">You haven't attended any events in {cityData.city} yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}