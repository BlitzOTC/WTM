import { useRoute } from "wouter";
import { ArrowLeft, MapPin, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CityExplored {
  id: string;
  name: string;
  country: string;
  visitDate: string;
  eventsAttended: number;
  favoriteVenue: string;
  highlights: string[];
}

const getFriendCitiesExplored = (friendId: string): { friendName: string; cities: CityExplored[] } => {
  const friendCities: Record<string, { friendName: string; cities: CityExplored[] }> = {
    '1': {
      friendName: 'Sarah Chen',
      cities: [
        {
          id: '1',
          name: 'San Francisco',
          country: 'USA',
          visitDate: '2024-01-15',
          eventsAttended: 18,
          favoriteVenue: 'Blue Note SF',
          highlights: ['Jazz concerts', 'Tech meetups', 'Rooftop bars']
        },
        {
          id: '2',
          name: 'New York City',
          country: 'USA',
          visitDate: '2024-03-22',
          eventsAttended: 12,
          favoriteVenue: 'Brooklyn Bowl',
          highlights: ['Broadway shows', 'Food festivals', 'Art galleries']
        },
        {
          id: '3',
          name: 'Tokyo',
          country: 'Japan',
          visitDate: '2024-06-10',
          eventsAttended: 8,
          favoriteVenue: 'Shibuya Sky',
          highlights: ['Karaoke nights', 'Sake tastings', 'Pop culture events']
        }
      ]
    },
    '2': {
      friendName: 'Mike Rodriguez',
      cities: [
        {
          id: '4',
          name: 'Los Angeles',
          country: 'USA',
          visitDate: '2024-02-18',
          eventsAttended: 15,
          favoriteVenue: 'Hollywood Bowl',
          highlights: ['Concerts', 'Beach parties', 'Food trucks']
        },
        {
          id: '5',
          name: 'Miami',
          country: 'USA',
          visitDate: '2024-05-05',
          eventsAttended: 9,
          favoriteVenue: 'LIV Miami',
          highlights: ['Nightlife', 'Art Basel', 'Beach clubs']
        }
      ]
    },
    '6': {
      friendName: 'David Brown',
      cities: [
        {
          id: '6',
          name: 'London',
          country: 'UK',
          visitDate: '2024-04-12',
          eventsAttended: 22,
          favoriteVenue: 'Fabric',
          highlights: ['Pub culture', 'Theater district', 'Music festivals']
        },
        {
          id: '7',
          name: 'Berlin',
          country: 'Germany',
          visitDate: '2024-07-20',
          eventsAttended: 18,
          favoriteVenue: 'Berghain',
          highlights: ['Electronic music', 'Art scene', 'Beer gardens']
        },
        {
          id: '8',
          name: 'Barcelona',
          country: 'Spain',
          visitDate: '2024-08-14',
          eventsAttended: 10,
          favoriteVenue: 'Palau de la Música',
          highlights: ['Flamenco shows', 'Tapas tours', 'Beach events']
        }
      ]
    }
  };

  return friendCities[friendId] || friendCities['1'];
};

export default function FriendCitiesExplored() {
  const [match, params] = useRoute("/friend-cities-explored/:friendId");
  const friendId = params?.friendId || '1';
  const { friendName, cities } = getFriendCitiesExplored(friendId);

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex items-center space-x-2 p-2 hover:bg-gray-50">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Cities Explored</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => window.location.href = '/'}>
                  🔍 Search
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/tonight'}>
                  📅 Tonight
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/plan'}>
                  📋 My Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                  👤 Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center space-x-2 md:hidden">
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Cities Explored</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{friendName}'s Cities</h2>
          <p className="text-gray-600">{cities.length} cities explored</p>
        </div>

        {/* Cities List */}
        <div className="space-y-4">
          {cities.map((city) => (
            <div key={city.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="w-full h-32 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {city.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{city.country}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Visited: {new Date(city.visitDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Events attended:</span>
                    <span className="font-medium text-gray-900">{city.eventsAttended}</span>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">Favorite venue:</span>
                    <p className="font-medium text-gray-900 mt-1">{city.favoriteVenue}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Highlights:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {city.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    className="text-primary text-sm hover:text-indigo-700 transition-colors"
                    onClick={() => window.location.href = `/city-events?city=${encodeURIComponent(city.name)}`}
                    data-testid={`button-view-city-events-${city.id}`}
                  >
                    View events in {city.name} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cities.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cities explored</h3>
            <p className="text-gray-600">{friendName} hasn't explored any cities yet</p>
          </div>
        )}
      </div>
    </div>
  );
}