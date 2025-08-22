import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Navigation as NavigationIcon, Car, Smartphone, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { type Event } from "@shared/schema";

export default function Navigation() {
  const [, setLocation] = useLocation();
  const [activeNightPlan, setActiveNightPlan] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  useEffect(() => {
    // Load active night plan
    const storedPlan = localStorage.getItem('activeNightPlan');
    if (storedPlan) {
      try {
        const plan = JSON.parse(storedPlan);
        setActiveNightPlan(plan);
        
        // Get current event
        const currentIndex = plan.currentEventIndex || 0;
        if (plan.events && plan.events[currentIndex]) {
          setCurrentEvent(plan.events[currentIndex]);
        }
      } catch (error) {
        console.error('Error parsing active night plan:', error);
      }
    }

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError('Unable to get your location. Please enable location services.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Mock venue coordinates (in real app would come from venue data)
  const getVenueCoordinates = (venueName: string) => {
    const venues: Record<string, { lat: number; lng: number; address: string }> = {
      'Blue Note Cafe': { lat: 37.7849, lng: -122.4094, address: '131 3rd St, San Francisco, CA 94103' },
      'Sky Lounge': { lat: 37.7879, lng: -122.4075, address: '420 Mason St, San Francisco, CA 94102' },
      'Innovation Hub': { lat: 37.7749, lng: -122.4194, address: '548 Market St, San Francisco, CA 94104' },
      'Modern Arts Center': { lat: 37.7614, lng: -122.4194, address: '151 3rd St, San Francisco, CA 94103' },
      'Golden Gate Park': { lat: 37.7694, lng: -122.4862, address: 'Golden Gate Park, San Francisco, CA 94117' }
    };
    
    return venues[venueName] || { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' };
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!activeNightPlan || !currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/plan')}
            data-testid="button-back-to-plan"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plan
          </Button>
          <div className="text-center py-12">
            <NavigationIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active night plan</h3>
            <p className="text-gray-600">Start a night plan to access navigation</p>
          </div>
        </div>
      </div>
    );
  }

  const venueCoords = getVenueCoordinates(currentEvent.venue);
  const distance = userLocation ? calculateDistance(
    userLocation.lat, 
    userLocation.lng, 
    venueCoords.lat, 
    venueCoords.lng
  ) : null;

  const openInAppleMaps = () => {
    const url = `https://maps.apple.com/?daddr=${venueCoords.lat},${venueCoords.lng}&dirflg=d`;
    window.open(url, '_blank');
  };

  const openInGoogleMaps = () => {
    const url = `https://maps.google.com/maps?daddr=${venueCoords.lat},${venueCoords.lng}&dirflg=d`;
    window.open(url, '_blank');
  };

  const openUberApp = () => {
    const url = `uber://action=setPickup&pickup=my_location&dropoff[latitude]=${venueCoords.lat}&dropoff[longitude]=${venueCoords.lng}&dropoff[nickname]=${encodeURIComponent(currentEvent.venue)}`;
    // Fallback to web if app not installed
    const fallbackUrl = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${venueCoords.lat}&dropoff[longitude]=${venueCoords.lng}`;
    
    try {
      window.location.href = url;
      // Fallback after delay if app doesn't open
      setTimeout(() => {
        window.open(fallbackUrl, '_blank');
      }, 1000);
    } catch (error) {
      window.open(fallbackUrl, '_blank');
    }
  };

  const openLyftApp = () => {
    const url = `lyft://ridetype?id=lyft&destination[latitude]=${venueCoords.lat}&destination[longitude]=${venueCoords.lng}`;
    const fallbackUrl = `https://lyft.com/ride?destination[latitude]=${venueCoords.lat}&destination[longitude]=${venueCoords.lng}`;
    
    try {
      window.location.href = url;
      setTimeout(() => {
        window.open(fallbackUrl, '_blank');
      }, 1000);
    } catch (error) {
      window.open(fallbackUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/plan')}
              data-testid="button-back-to-plan"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <NavigationIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Event Info */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Next Destination</h3>
            <Badge className="bg-blue-100 text-blue-800">
              {activeNightPlan.route.name}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900" data-testid="text-current-event-name">
                {currentEvent.name}
              </h4>
              <p className="text-sm text-gray-600" data-testid="text-current-venue">
                {currentEvent.venue}
              </p>
              <p className="text-xs text-gray-500 mt-1" data-testid="text-venue-address">
                {venueCoords.address}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{formatTime(currentEvent.startTime)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {currentEvent.price === 0 ? 'Free' : `$${(currentEvent.price / 100).toFixed(0)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Distance */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Distance & Location</h3>
          
          {locationError ? (
            <div className="text-center py-4">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">{locationError}</p>
            </div>
          ) : userLocation && distance !== null ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Distance from your location:</span>
                <span className="font-medium text-gray-900" data-testid="text-distance">
                  {distance < 0.1 ? '< 0.1 mi' : `${distance.toFixed(1)} mi`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estimated travel time:</span>
                <span className="font-medium text-gray-900">
                  {Math.max(Math.ceil(distance * 3), 5)} min
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Getting your location...</p>
            </div>
          )}
        </div>

        {/* Map Options */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Open in Maps</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={openInAppleMaps}
              className="flex items-center justify-center space-x-2"
              data-testid="button-apple-maps"
            >
              <Smartphone className="h-4 w-4" />
              <span>Apple Maps</span>
            </Button>
            <Button
              variant="outline"
              onClick={openInGoogleMaps}
              className="flex items-center justify-center space-x-2"
              data-testid="button-google-maps"
            >
              <MapPin className="h-4 w-4" />
              <span>Google Maps</span>
            </Button>
          </div>
        </div>

        {/* Ride Options */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Book a Ride</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={openUberApp}
              className="flex items-center justify-center space-x-2 bg-black text-white hover:bg-gray-800"
              data-testid="button-uber"
            >
              <Car className="h-4 w-4" />
              <span>Uber</span>
            </Button>
            <Button
              onClick={openLyftApp}
              className="flex items-center justify-center space-x-2 bg-pink-600 text-white hover:bg-pink-700"
              data-testid="button-lyft"
            >
              <Car className="h-4 w-4" />
              <span>Lyft</span>
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Tap to open the app and book a ride to your destination
          </p>
        </div>

        {/* Emergency Options */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Need Help?</h3>
          <div className="text-sm text-gray-600">
            <p>• Share your location with friends</p>
            <p>• Call venue: <span className="font-medium">(555) 123-4567</span></p>
            <p>• Emergency: <span className="font-medium">911</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}