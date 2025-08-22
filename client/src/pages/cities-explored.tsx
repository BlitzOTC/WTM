import { ArrowLeft, MapPin, Calendar, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CitiesExplored() {
  const [, setLocation] = useLocation();
  
  // Mock cities data - in real app would come from API
  const exploredCities = [
    {
      id: '1',
      city: 'San Francisco',
      state: 'California',
      country: 'USA',
      eventsAttended: 8,
      firstVisit: '2023-01-15',
      lastVisit: '2024-01-15',
      favoriteVenues: ['Blue Note Cafe', 'Sky Lounge', 'Innovation Hub'],
      totalSpent: 245,
      topCategories: ['Music', 'Networking', 'Food & Drink']
    },
    {
      id: '2',
      city: 'Los Angeles',
      state: 'California', 
      country: 'USA',
      eventsAttended: 3,
      firstVisit: '2023-06-10',
      lastVisit: '2023-08-22',
      favoriteVenues: ['Hollywood Bowl', 'Santa Monica Pier'],
      totalSpent: 120,
      topCategories: ['Music', 'Entertainment']
    },
    {
      id: '3',
      city: 'New York',
      state: 'New York',
      country: 'USA', 
      eventsAttended: 2,
      firstVisit: '2023-11-05',
      lastVisit: '2023-11-08',
      favoriteVenues: ['Madison Square Garden'],
      totalSpent: 180,
      topCategories: ['Sports', 'Arts']
    },
    {
      id: '4',
      city: 'Seattle',
      state: 'Washington',
      country: 'USA',
      eventsAttended: 1,
      firstVisit: '2023-09-12',
      lastVisit: '2023-09-12',
      favoriteVenues: ['Pike Place Market'],
      totalSpent: 45,
      topCategories: ['Food & Drink']
    },
    {
      id: '5',
      city: 'Portland',
      state: 'Oregon',
      country: 'USA',
      eventsAttended: 1,
      firstVisit: '2023-07-20',
      lastVisit: '2023-07-20',
      favoriteVenues: ['Local Brewery'],
      totalSpent: 30,
      topCategories: ['Food & Drink']
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
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Cities Explored</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">You've explored events in {exploredCities.length} cities</p>
        </div>
      </div>

      {/* Cities List */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {exploredCities.map((city) => (
            <div key={city.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1" data-testid={`text-city-name-${city.id}`}>
                    {city.city}, {city.state}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2" data-testid={`text-city-country-${city.id}`}>
                    {city.country}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary" data-testid={`text-events-count-${city.id}`}>
                    {city.eventsAttended}
                  </div>
                  <div className="text-xs text-gray-600">events</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span data-testid={`text-first-visit-${city.id}`}>
                    First: {new Date(city.firstVisit).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span data-testid={`text-last-visit-${city.id}`}>
                    Last: {new Date(city.lastVisit).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Top Categories */}
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Top Categories:</p>
                <div className="flex flex-wrap gap-1">
                  {city.topCategories.map((category, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                      data-testid={`tag-category-${city.id}-${index}`}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Favorite Venues */}
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Favorite Venues:</p>
                <div className="text-sm text-gray-800" data-testid={`text-venues-${city.id}`}>
                  {city.favoriteVenues.join(', ')}
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium" data-testid={`text-total-spent-${city.id}`}>
                      Total spent: ${city.totalSpent}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    data-testid={`button-view-city-events-${city.id}`}
                  >
                    View Events
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {exploredCities.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cities explored yet</h3>
              <p className="text-gray-600">Start attending events to explore new cities and venues</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}