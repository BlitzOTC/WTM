import { useState } from "react";
import { CheckCircle, Star, DollarSign, Users, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingPreferences() {
  const [selectedPreferences, setSelectedPreferences] = useState<{
    priceRange: string;
    groupSize: string;
    timePreference: string;
    distance: string;
  }>({
    priceRange: "",
    groupSize: "",
    timePreference: "",
    distance: ""
  });

  const priceRanges = [
    { value: "free", label: "Free events", description: "$0" },
    { value: "budget", label: "Budget-friendly", description: "$1 - $25" },
    { value: "moderate", label: "Moderate", description: "$25 - $75" },
    { value: "premium", label: "Premium", description: "$75+" }
  ];

  const groupSizes = [
    { value: "solo", label: "Solo adventures", description: "Just me" },
    { value: "small", label: "Small groups", description: "2-4 people" },
    { value: "medium", label: "Medium groups", description: "5-10 people" },
    { value: "large", label: "Large groups", description: "10+ people" }
  ];

  const timePreferences = [
    { value: "early", label: "Early evening", description: "5-8 PM" },
    { value: "peak", label: "Peak hours", description: "8-11 PM" },
    { value: "late", label: "Late night", description: "11 PM - 2 AM" },
    { value: "flexible", label: "Flexible", description: "Any time" }
  ];

  const distances = [
    { value: "walking", label: "Walking distance", description: "Under 1 mile" },
    { value: "nearby", label: "Nearby", description: "1-5 miles" },
    { value: "city", label: "Around the city", description: "5-15 miles" },
    { value: "anywhere", label: "Anywhere", description: "No limit" }
  ];

  const handlePreferenceChange = (category: string, value: string) => {
    setSelectedPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleFinish = () => {
    // Save all onboarding data
    const onboardingData = {
      age: localStorage.getItem('onboarding_age'),
      location: localStorage.getItem('onboarding_location'),
      frequency: localStorage.getItem('onboarding_frequency'),
      interests: JSON.parse(localStorage.getItem('onboarding_interests') || '[]'),
      preferences: selectedPreferences
    };
    
    localStorage.setItem('onboarding_complete', 'true');
    localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
    
    // Redirect to main app
    window.location.href = '/';
  };

  const allSelected = Object.values(selectedPreferences).every(value => value !== "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
          </div>
          <span className="ml-4 text-sm text-gray-600">5 of 5</span>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Final preferences</h1>
            <p className="text-gray-600">Let's personalize your event recommendations</p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Price Range */}
            <div>
              <div className="flex items-center mb-3">
                <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium text-gray-900">Budget preference</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {priceRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handlePreferenceChange('priceRange', range.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedPreferences.priceRange === range.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                    data-testid={`price-option-${range.value}`}
                  >
                    <div className="text-sm font-medium">{range.label}</div>
                    <div className="text-xs text-gray-500">{range.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Group Size */}
            <div>
              <div className="flex items-center mb-3">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium text-gray-900">Group size</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {groupSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => handlePreferenceChange('groupSize', size.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedPreferences.groupSize === size.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                    data-testid={`group-option-${size.value}`}
                  >
                    <div className="text-sm font-medium">{size.label}</div>
                    <div className="text-xs text-gray-500">{size.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Preference */}
            <div>
              <div className="flex items-center mb-3">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium text-gray-900">Time preference</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {timePreferences.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => handlePreferenceChange('timePreference', time.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedPreferences.timePreference === time.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                    data-testid={`time-option-${time.value}`}
                  >
                    <div className="text-sm font-medium">{time.label}</div>
                    <div className="text-xs text-gray-500">{time.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div>
              <div className="flex items-center mb-3">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium text-gray-900">Distance</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {distances.map((distance) => (
                  <button
                    key={distance.value}
                    onClick={() => handlePreferenceChange('distance', distance.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedPreferences.distance === distance.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                    data-testid={`distance-option-${distance.value}`}
                  >
                    <div className="text-sm font-medium">{distance.label}</div>
                    <div className="text-xs text-gray-500">{distance.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleFinish}
            disabled={!allSelected}
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            data-testid="button-finish"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Complete Setup
          </Button>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => window.location.href = '/onboarding/interests'}
              className="text-sm text-gray-500 hover:text-gray-700"
              data-testid="button-back"
            >
              ← Back
            </button>
            <button
              onClick={handleFinish}
              className="text-sm text-gray-500 hover:text-gray-700"
              data-testid="button-skip"
            >
              Skip remaining
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}