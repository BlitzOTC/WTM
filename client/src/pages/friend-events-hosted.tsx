import { useRoute } from "wouter";
import { ArrowLeft, User, MapPin, Clock, DollarSign, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface HostedEvent {
  id: string;
  name: string;
  venue: string;
  address: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  category: string;
  attendees: number;
  maxCapacity: number;
}

const getFriendEventsHosted = (friendId: string): { friendName: string; events: HostedEvent[] } => {
  const friendEvents: Record<string, { friendName: string; events: HostedEvent[] }> = {
    '1': {
      friendName: 'Sarah Chen',
      events: [
        {
          id: '1',
          name: 'Women in Tech Networking',
          venue: 'WeWork SOMA',
          address: '535 Mission St, San Francisco, CA',
          date: '2025-02-15',
          startTime: '6:00 PM',
          endTime: '9:00 PM',
          price: 1500,
          category: 'networking',
          attendees: 45,
          maxCapacity: 60
        },
        {
          id: '2',
          name: 'Asian Food Festival Meetup',
          venue: 'Golden Gate Park',
          address: 'Golden Gate Park, San Francisco, CA',
          date: '2025-02-22',
          startTime: '12:00 PM',
          endTime: '4:00 PM',
          price: 0,
          category: 'food',
          attendees: 28,
          maxCapacity: 40
        }
      ]
    },
    '2': {
      friendName: 'Mike Rodriguez',
      events: [
        {
          id: '3',
          name: 'Basketball Pickup Games',
          venue: 'Mission Dolores Park',
          address: 'Mission Dolores Park, San Francisco, CA',
          date: '2025-02-10',
          startTime: '10:00 AM',
          endTime: '2:00 PM',
          price: 0,
          category: 'sports',
          attendees: 16,
          maxCapacity: 20
        }
      ]
    },
    '5': {
      friendName: 'Lisa Park',
      events: [
        {
          id: '4',
          name: 'Photography Workshop',
          venue: 'Art Institute',
          address: '800 Chestnut St, San Francisco, CA',
          date: '2025-02-18',
          startTime: '2:00 PM',
          endTime: '5:00 PM',
          price: 4500,
          category: 'culture',
          attendees: 12,
          maxCapacity: 15
        },
        {
          id: '5',
          name: 'Wine & Cheese Social',
          venue: 'Private Venue',
          address: '123 Pacific Heights, San Francisco, CA',
          date: '2025-02-25',
          startTime: '7:00 PM',
          endTime: '10:00 PM',
          price: 3500,
          category: 'drinks',
          attendees: 22,
          maxCapacity: 25
        }
      ]
    },
    '6': {
      friendName: 'David Brown',
      events: [
        {
          id: '6',
          name: 'Startup Pitch Competition',
          venue: 'Tech Hub SF',
          address: '901 Market St, San Francisco, CA',
          date: '2025-02-20',
          startTime: '6:30 PM',
          endTime: '9:30 PM',
          price: 2500,
          category: 'networking',
          attendees: 75,
          maxCapacity: 100
        }
      ]
    }
  };

  return friendEvents[friendId] || friendEvents['1'];
};

export default function FriendEventsHosted() {
  const [match, params] = useRoute("/friend-events-hosted/:friendId");
  const friendId = params?.friendId || '1';
  const { friendName, events } = getFriendEventsHosted(friendId);

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
                  <span className="text-xl font-bold text-gray-900">Events Hosted</span>
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
              <User className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Events Hosted</h1>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{friendName}'s Hosted Events</h2>
          <p className="text-gray-600">{events.length} events hosted</p>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="w-full h-48 bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                <User className="h-12 w-12 text-primary/60" />
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
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
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
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{event.attendees}/{event.maxCapacity} attending</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Hosted by {friendName}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(event.attendees / event.maxCapacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events hosted</h3>
            <p className="text-gray-600">{friendName} hasn't hosted any events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}