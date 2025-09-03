import { useState } from "react";
import { ChevronRight, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingLocation() {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const popularLocations = [
    "San Francisco, CA",
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Miami, FL",
    "Austin, TX",
    "Seattle, WA",
    "Boston, MA"
  ];

  const filteredLocations = popularLocations.filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    if (selectedLocation) {
      localStorage.setItem('onboarding_location', selectedLocation);
      window.location.href = '/onboarding/frequency';
    }
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setSearchQuery(location);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
          <span className="ml-4 text-sm text-gray-600">2 of 5</span>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Where are you located?</h1>
            <p className="text-gray-600">We'll show you events happening in your area</p>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedLocation(e.target.value);
              }}
              placeholder="Search for your city..."
              className="pl-10 w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              data-testid="input-location-search"
              autoComplete="off"
              data-lpignore="true"
            />
          </div>

          {/* Popular Locations */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Popular locations</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => handleLocationSelect(location)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedLocation === location
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                  data-testid={`location-option-${location.replace(/[^a-zA-Z0-9]/g, '-')}`}
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{location}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedLocation.trim()}
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            data-testid="button-continue"
          >
            Continue
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => window.location.href = '/onboarding/age'}
              className="text-sm text-gray-500 hover:text-gray-700"
              data-testid="button-back"
            >
              ← Back
            </button>
            <button
              onClick={() => window.location.href = '/onboarding/frequency'}
              className="text-sm text-gray-500 hover:text-gray-700"
              data-testid="button-skip"
            >
              Skip this step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}