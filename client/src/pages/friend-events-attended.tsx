import { useRoute } from "wouter";
import { ArrowLeft, Calendar, MapPin, Clock, DollarSign, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AttendedEvent {
  id: string;
  name: string;
  venue: string;
  address: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  category: string;
  rating: number;
  imageUrl: string;
}

const getFriendEventsAttended = (friendId: string): { friendName: string; events: AttendedEvent[] } => {
  const friendEvents: Record<string, { friendName: string; events: AttendedEvent[] }> = {
    '1': {
      friendName: 'Sarah Chen',
      events: [
        {
          id: '1',
          name: 'Jazz Night at Blue Note',
          venue: 'Blue Note SF',
          address: '2239 Market St, San Francisco, CA',
          date: '2025-01-15',
          startTime: '8:00 PM',
          endTime: '11:30 PM',
          price: 2500,
          category: 'music',
          rating: 4.8,
          imageUrl: '/images/jazz-night.jpg'
        },
        {
          id: '2',
          name: 'Rooftop Cocktails & City Views',
          venue: 'Sky Lounge',
          address: '345 California St, San Francisco, CA',
          date: '2025-01-10',
          startTime: '6:00 PM',
          endTime: '10:00 PM',
          price: 1800,
          category: 'drinks',
          rating: 4.5,
          imageUrl: '/images/rooftop-bar.jpg'
        },
        {
          id: '3',
          name: 'Tech Startup Networking Mixer',
          venue: 'Innovation Hub',
          address: '123 Mission St, San Francisco, CA',
          date: '2025-01-05',
          startTime: '7:00 PM',
          endTime: '9:30 PM',
          price: 0,
          category: 'networking',
          rating: 4.2,
          imageUrl: '/images/networking.jpg'
        }
      ]
    },
    '2': {
      friendName: 'Mike Rodriguez',
      events: [
        {
          id: '4',
          name: 'Warriors vs Lakers Game',
          venue: 'Chase Center',
          address: '1 Warriors Way, San Francisco, CA',
          date: '2025-01-12',
          startTime: '7:30 PM',
          endTime: '10:30 PM',
          price: 8500,
          category: 'sports',
          rating: 4.9,
          imageUrl: '/images/warriors-game.jpg'
        },
        {
          id: '5',
          name: 'Craft Beer Tasting',
          venue: 'Anchor Brewing',
          address: '495 De Haro St, San Francisco, CA',
          date: '2025-01-08',
          startTime: '5:00 PM',
          endTime: '8:00 PM',
          price: 3500,
          category: 'drinks',
          rating: 4.6,
          imageUrl: '/images/beer-tasting.jpg'
        }
      ]
    },
    '6': {
      friendName: 'David Brown',
      events: [
        {
          id: '6',
          name: 'Wine & Dine Experience',
          venue: 'The French Laundry',
          address: '6640 Washington St, Yountville, CA',
          date: '2025-01-20',
          startTime: '6:30 PM',
          endTime: '10:00 PM',
          price: 15000,
          category: 'food',
          rating: 4.9,
          imageUrl: '/images/french-laundry.jpg'
        },
        {
          id: '7',
          name: 'Art Gallery Opening',
          venue: 'SFMOMA',
          address: '151 3rd St, San Francisco, CA',
          date: '2025-01-18',
          startTime: '6:00 PM',
          endTime: '9:00 PM',
          price: 2500,
          category: 'culture',
          rating: 4.4,
          imageUrl: '/images/sfmoma.jpg'
        },
        {
          id: '8',
          name: 'Silicon Valley Tech Conference',
          venue: 'Convention Center',
          address: '5001 Great America Pkwy, Santa Clara, CA',
          date: '2025-01-16',
          startTime: '9:00 AM',
          endTime: '6:00 PM',
          price: 12500,
          category: 'networking',
          rating: 4.3,
          imageUrl: '/images/tech-conference.jpg'
        }
      ]
    }
  };

  return friendEvents[friendId] || friendEvents['1'];
};

export default function FriendEventsAttended() {
  const [match, params] = useRoute("/friend-events-attended/:friendId");
  const friendId = params?.friendId || '1';
  const { friendName, events } = getFriendEventsAttended(friendId);

  const formatPrice = (price: number) => {
    if (price === 0) return "FREE";
    return `$${(price / 100).toFixed(0)}`;
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      'music': 'bg-purple-100 text-purple-800',
      'drinks': 'bg-orange-100 text-orange-800',
      'networking': 'bg-blue-100 text-blue-800',
      'sports': 'bg-green-100 text-green-800',
      'food': 'bg-red-100 text-red-800',
      'culture': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

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
                  <span className="text-xl font-bold text-gray-900">Events Attended</span>
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
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Events Attended</h1>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{friendName}'s Events</h2>
          <p className="text-gray-600">{events.length} events attended</p>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-primary/60" />
              </div>
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{event.venue}</p>
                  </div>
                  <Badge className={getCategoryBadgeColor(event.category)}>
                    {event.category}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{event.address}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="font-medium text-gray-900">{formatPrice(event.price)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{event.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600">{friendName} hasn't attended any events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}