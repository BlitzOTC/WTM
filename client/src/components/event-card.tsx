import { type Event } from "@shared/schema";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  event: Event;
  onAddToPlan: (event: Event) => void;
  onViewDetails: (event: Event) => void;
  isInPlan: boolean;
}

const categoryEmojis: Record<string, string> = {
  music: "🎵",
  food: "🍽️",
  drinks: "🍸",
  dancing: "💃",
  entertainment: "🎭",
  sports: "⚽"
};

const categoryLabels: Record<string, string> = {
  music: "Live Music",
  food: "Food & Dining",
  drinks: "Cocktails",
  dancing: "Dancing",
  entertainment: "Entertainment",
  sports: "Sports & Games"
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

  const categories = Array.isArray(event.categories) ? event.categories : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <img 
        src={event.imageUrl || "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240"} 
        alt={event.name}
        className="w-full h-48 object-cover"
        data-testid={`img-event-${event.id}`}
      />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1" data-testid={`text-event-name-${event.id}`}>
              {event.name}
            </h3>
            <p className="text-sm text-gray-600" data-testid={`text-event-venue-${event.id}`}>
              {event.venue}
            </p>
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
        
        <div className="flex space-x-2">
          <Button
            onClick={() => onAddToPlan(event)}
            disabled={isInPlan}
            className="flex-1 bg-primary text-white hover:bg-indigo-700 disabled:bg-gray-300"
            size="sm"
            data-testid={`button-add-to-plan-${event.id}`}
          >
            {isInPlan ? 'In Plan' : 'Add to Plan'}
          </Button>
          <Button
            onClick={() => onViewDetails(event)}
            variant="outline"
            size="sm"
            data-testid={`button-view-details-${event.id}`}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
