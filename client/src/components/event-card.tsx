import { type Event } from "@shared/schema";
import { Clock, MapPin, Menu, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface EventCardProps {
  event: Event;
  onAddToPlan: (event: Event) => void;
  onViewDetails: (event: Event) => void;
  isInPlan: boolean;
}

const categoryEmojis: Record<string, string> = {
  music: "🎵",
  fastfood: "🍟",
  restaurant: "🍽️",
  drinks: "🍸",
  dancing: "💃",
  entertainment: "🎭",
  sports: "⚽",
  art: "🎨"
};

const categoryLabels: Record<string, string> = {
  music: "Live Music",
  fastfood: "Fast Food",
  restaurant: "Restaurant",
  drinks: "Cocktails",
  dancing: "Dancing",
  entertainment: "Entertainment",
  sports: "Sports & Games",
  art: "Arts & Culture"
};

export default function EventCard({ event, onAddToPlan, onViewDetails, isInPlan }: EventCardProps) {
  const formatPrice = (priceInCents: number) => {
    if (priceInCents === 0) return "FREE";
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleTicketClick = () => {
    // Get ticket links from event
    const ticketLinks = typeof event.ticketLinks === 'object' && event.ticketLinks !== null 
      ? event.ticketLinks as Record<string, string>
      : {};
    
    // Find first available ticket link
    const ticketmaster = ticketLinks.ticketmaster;
    const stubhub = ticketLinks.stubhub;
    const seatgeek = ticketLinks.seatgeek;
    
    // Open first available ticket link
    if (ticketmaster) {
      window.open(ticketmaster, '_blank');
    } else if (stubhub) {
      window.open(stubhub, '_blank');
    } else if (seatgeek) {
      window.open(seatgeek, '_blank');
    }
  };

  const categories = Array.isArray(event.categories) ? event.categories : [];
  
  // Determine if this is a restaurant/bar without an event
  const isRestaurantVenue = (categories.includes('fastfood') || categories.includes('restaurant')) && event.name === event.venue;
  const isBarVenue = (categories.includes('drinks') || categories.includes('dancing')) && event.name === event.venue;
  const isVenueOnly = isRestaurantVenue || isBarVenue;
  
  // Check if tickets are available
  const ticketLinks = typeof event.ticketLinks === 'object' && event.ticketLinks !== null 
    ? event.ticketLinks as Record<string, string>
    : {};
  const hasTickets = ticketLinks.ticketmaster || ticketLinks.stubhub || ticketLinks.seatgeek;
  
  // Determine display structure
  const mainTitle = event.name;
  const subTitle = event.name === event.venue ? null : event.venue;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative">
      <img 
        src={event.imageUrl || "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240"} 
        alt={event.name}
        className="w-full h-48 object-cover"
        data-testid={`img-event-${event.id}`}
      />
      
      <div className="p-5 pb-16">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1" data-testid={`text-event-name-${event.id}`}>
              {mainTitle}
            </h3>
            {subTitle && (
              <p className="text-sm text-gray-600" data-testid={`text-event-venue-${event.id}`}>
                {subTitle}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${event.price === 0 ? 'text-green-600' : 'text-primary'}`} data-testid={`text-event-price-${event.id}`}>
              {formatPrice(event.price)}
            </p>
            <p className="text-xs text-gray-500" data-testid={`text-event-age-${event.id}`}>
              {event.ageRequirement === 'all' ? 'All Ages' : `${event.ageRequirement}+`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center" data-testid={`text-event-time-${event.id}`}>
            <Clock className="h-4 w-4 mr-1" />
            {formatTime(event.startTime)}
          </span>
          <span className="flex items-center" data-testid={`text-event-distance-${event.id}`}>
            <MapPin className="h-4 w-4 mr-1" />
            {event.city}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant="secondary" 
              className="text-xs"
              data-testid={`badge-category-${category}-${event.id}`}
            >
              {categoryEmojis[category]} {categoryLabels[category] || category}
            </Badge>
          ))}
          {event.price === 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs" data-testid={`badge-free-${event.id}`}>
              🎉 Free Entry
            </Badge>
          )}
        </div>
      </div>
      
      {/* Fixed positioned buttons at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-white">
        <div className="flex space-x-2">
          {/* Left side - Details button */}
          <Button
            onClick={() => onViewDetails(event)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-2 border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-500 hover:text-yellow-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            data-testid={`button-view-details-${event.id}`}
          >
            Details
          </Button>
          
          {/* Center - Add to Plan button */}
          <Button
            onClick={() => onAddToPlan(event)}
            disabled={isInPlan}
            className="flex-1 bg-primary text-white hover:bg-indigo-700 disabled:bg-gray-300"
            size="sm"
            data-testid={`button-add-to-plan-${event.id}`}
          >
            {isInPlan ? 'In Plan' : 'Add to Plan'}
          </Button>
          
          {/* Right side - Menu and Tickets buttons */}
          <div className="flex space-x-2">
            {isRestaurantVenue && (
              <Button
                onClick={() => {
                  const ticketLinks = typeof event.ticketLinks === 'object' && event.ticketLinks !== null 
                    ? event.ticketLinks as Record<string, string>
                    : {};
                  
                  // Check if restaurant has a website URL
                  const websiteUrl = ticketLinks.website;
                  
                  if (websiteUrl) {
                    window.open(websiteUrl, '_blank');
                  } else {
                    // Fallback to Google search for restaurant menu
                    const searchQuery = `${event.venue} menu`;
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                  }
                }}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-2 border-red-300 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 hover:text-red-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                data-testid={`button-menu-${event.id}`}
              >
                <Menu className="h-4 w-4" />
                Menu
              </Button>
            )}
            {hasTickets && (
              <Button
                onClick={handleTicketClick}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-2 border-green-400 text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-500 hover:text-green-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                data-testid={`button-tickets-${event.id}`}
              >
                Tickets
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
