import { type Event } from "@shared/schema";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onAddToPlan: (event: Event) => void;
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

export default function EventDetailModal({ 
  isOpen, 
  onClose, 
  event, 
  onAddToPlan, 
  isInPlan 
}: EventDetailModalProps) {
  if (!event) return null;

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
  const ticketLinks = typeof event.ticketLinks === 'object' && event.ticketLinks !== null 
    ? event.ticketLinks as Record<string, string>
    : {} as Record<string, string>;

  const handleTicketClick = (platform: string, url?: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      // Mock redirect
      alert(`Redirecting to ${platform} (Mock implementation)`);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${event.name} at ${event.venue}!`;
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'instagram') {
      // Instagram doesn't have direct URL sharing, so copy to clipboard
      navigator.clipboard.writeText(`${text} ${url}`);
      alert('Event details copied to clipboard! Paste in Instagram.');
    } else if (platform === 'x' || platform === 'twitter') {
      window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0" data-testid="modal-event-detail">
        <DialogTitle className="sr-only">{event.name} Details</DialogTitle>
        <DialogDescription className="sr-only">
          Detailed information about {event.name} at {event.venue}
        </DialogDescription>
        <img 
          src={event.imageUrl || "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300"} 
          alt={event.name}
          className="w-full h-64 object-cover rounded-t-xl"
          data-testid="img-event-detail"
        />
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-event-detail-name">
                {event.name}
              </h2>
              <p className="text-lg text-gray-600" data-testid="text-event-detail-venue">
                {event.venue}
              </p>
              <p className="text-sm text-gray-500" data-testid="text-event-detail-address">
                {event.address}, {event.city}, {event.state}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-detail-modal">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {event.name === event.venue && categories.includes('food') ? 'About This Restaurant' : 'About This Event'}
                  </h3>
                  <p className="text-gray-600" data-testid="text-event-detail-description">
                    {event.description || "Join us for an amazing event experience!"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Event Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge key={category} variant="secondary" data-testid={`badge-detail-category-${category}`}>
                        {categoryEmojis[category]} {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Age Requirements & Pricing</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Age Requirement:</span>
                        <span className="font-medium" data-testid="text-detail-age-requirement">
                          {event.ageRequirement === 'all' ? 'All Ages' : `${event.ageRequirement}+`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cover Charge:</span>
                        <span className="font-medium" data-testid="text-detail-price">
                          {formatPrice(event.price)}
                        </span>
                      </div>
                      {event.dressCode && (
                        <div className="flex justify-between">
                          <span>Dress Code:</span>
                          <span className="font-medium" data-testid="text-detail-dress-code">
                            {event.dressCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hours of Operation for restaurants */}
                {event.name === event.venue && categories.includes('food') && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Hours of Operation</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        {[
                          { day: 'Monday', hours: '11:00 AM - 10:00 PM' },
                          { day: 'Tuesday', hours: '11:00 AM - 10:00 PM' },
                          { day: 'Wednesday', hours: '11:00 AM - 10:00 PM' },
                          { day: 'Thursday', hours: '11:00 AM - 11:00 PM' },
                          { day: 'Friday', hours: '11:00 AM - 12:00 AM' },
                          { day: 'Saturday', hours: '10:00 AM - 12:00 AM' },
                          { day: 'Sunday', hours: '10:00 AM - 9:00 PM' }
                        ].map((schedule) => {
                          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                          const isToday = schedule.day === today;
                          return (
                            <div 
                              key={schedule.day} 
                              className={`flex justify-between ${isToday ? 'font-semibold text-primary' : ''}`}
                              data-testid={`hours-${schedule.day.toLowerCase()}`}
                            >
                              <span>{schedule.day}</span>
                              <span>{schedule.hours}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Only show event details for non-restaurants */}
              {!(event.name === event.venue && categories.includes('food')) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span data-testid="text-detail-time">
                        Tonight, {formatTime(event.startTime)}
                        {event.endTime && ` - ${formatTime(event.endTime)}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span data-testid="text-detail-location">{event.city}, {event.state}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span data-testid="text-detail-capacity">
                        {event.currentAttendees || 0}
                        {event.maxCapacity && ` / ${event.maxCapacity}`} attending
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => onAddToPlan(event)}
                  disabled={isInPlan}
                  className="w-full bg-primary text-white hover:bg-indigo-700 disabled:bg-gray-300"
                  data-testid="button-detail-add-to-plan"
                >
                  {isInPlan ? 'In My Plan' : 'Add to My Plan'}
                </Button>
                
                {/* Menu button for restaurants */}
                {(event.name === event.venue && categories.includes('food')) && ticketLinks.website && (
                  <Button
                    onClick={() => {
                      if (ticketLinks.website) {
                        window.open(ticketLinks.website, '_blank');
                      } else {
                        const searchQuery = `${event.venue} menu`;
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                      }
                    }}
                    className="w-full bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transition-all duration-200 font-medium transform hover:scale-105"
                    size="sm"
                    data-testid="button-restaurant-menu"
                  >
                    View Menu
                  </Button>
                )}

                {(ticketLinks.ticketmaster || ticketLinks.stubhub || ticketLinks.seatgeek) && (
                  <>
                    <div className="text-center text-sm text-gray-500 mb-2">Get tickets from:</div>
                    
                    <div className="space-y-2">
                      {ticketLinks.ticketmaster && (
                        <Button
                          onClick={() => handleTicketClick('Ticketmaster', ticketLinks.ticketmaster)}
                          className="w-full bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transition-all duration-200 font-medium transform hover:scale-105"
                          size="sm"
                          data-testid="button-ticket-ticketmaster"
                        >
                          Ticketmaster
                        </Button>
                      )}
                      {ticketLinks.stubhub && (
                        <Button
                          onClick={() => handleTicketClick('StubHub', ticketLinks.stubhub)}
                          className="w-full bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg transition-all duration-200 font-medium transform hover:scale-105"
                          size="sm"
                          data-testid="button-ticket-stubhub"
                        >
                          StubHub
                        </Button>
                      )}
                      {ticketLinks.seatgeek && (
                        <Button
                          onClick={() => handleTicketClick('SeatGeek', ticketLinks.seatgeek)}
                          className="w-full bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg transition-all duration-200 font-medium transform hover:scale-105"
                          size="sm"
                          data-testid="button-ticket-seatgeek"
                        >
                          SeatGeek
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Share Event</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleShare('facebook')}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    size="sm"
                    data-testid="button-share-facebook"
                  >
                    Facebook
                  </Button>
                  <Button
                    onClick={() => handleShare('instagram')}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    size="sm"
                    data-testid="button-share-instagram"
                  >
                    Instagram
                  </Button>
                  <Button
                    onClick={() => handleShare('x')}
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                    size="sm"
                    data-testid="button-share-x"
                  >
                    X
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
