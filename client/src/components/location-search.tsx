import { useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
  isLoading?: boolean;
}

export default function LocationSearch({ onLocationSelect, isLoading = false }: LocationSearchProps) {
  const [location, setLocation] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleSearch = () => {
    if (location.trim()) {
      onLocationSelect(location.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use reverse geocoding to get address
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                const address = data.results[0].formatted_address;
                setLocation(address);
                onLocationSelect(address);
              } else {
                // Fallback to coordinates if reverse geocoding fails
                const coordsLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                setLocation(coordsLocation);
                onLocationSelect(coordsLocation);
              }
            } else {
              // If reverse geocoding fails, use coordinates
              const coordsLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setLocation(coordsLocation);
              onLocationSelect(coordsLocation);
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            // Use coordinates as fallback
            const { latitude, longitude } = position.coords;
            const coordsLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setLocation(coordsLocation);
            onLocationSelect(coordsLocation);
          } finally {
            setIsGettingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsGettingLocation(false);
          alert('Unable to get your location. Please enter a city or address manually.');
        }
      );
    } else {
      setIsGettingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Enter city, address, or neighborhood..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-4 py-3 text-lg"
          disabled={isLoading || isGettingLocation}
          data-testid="input-location-search"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>
      
      <div className="flex space-x-3">
        <Button
          onClick={handleSearch}
          disabled={!location.trim() || isLoading || isGettingLocation}
          className="flex-1 bg-primary text-white hover:bg-indigo-700"
          data-testid="button-search-events"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search Events
            </>
          )}
        </Button>
        
        <Button
          onClick={getCurrentLocation}
          disabled={isLoading || isGettingLocation}
          variant="outline"
          className="px-4"
          data-testid="button-current-location"
        >
          {isGettingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Search for real events in any city or use your current location
        </p>
      </div>
    </div>
  );
}