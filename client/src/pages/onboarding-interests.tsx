import { useState } from "react";
import { ChevronRight, Music, Utensils, Gamepad2, Palette, Users, Wine, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingInterests() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interests = [
    { value: "music", label: "Music & Concerts", icon: Music, color: "bg-purple-100 text-purple-600 border-purple-200" },
    { value: "food", label: "Food & Dining", icon: Utensils, color: "bg-red-100 text-red-600 border-red-200" },
    { value: "drinks", label: "Bars & Nightlife", icon: Wine, color: "bg-orange-100 text-orange-600 border-orange-200" },
    { value: "sports", label: "Sports & Games", icon: Trophy, color: "bg-green-100 text-green-600 border-green-200" },
    { value: "culture", label: "Arts & Culture", icon: Palette, color: "bg-pink-100 text-pink-600 border-pink-200" },
    { value: "networking", label: "Networking", icon: Users, color: "bg-blue-100 text-blue-600 border-blue-200" },
    { value: "gaming", label: "Gaming", icon: Gamepad2, color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
    { value: "events", label: "Special Events", icon: Calendar, color: "bg-yellow-100 text-yellow-600 border-yellow-200" }
  ];

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = () => {
    if (selectedInterests.length > 0) {
      localStorage.setItem('onboarding_interests', JSON.stringify(selectedInterests));
      window.location.href = '/onboarding/preferences';
    }
  };

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
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
          <span className="ml-4 text-sm text-gray-600">4 of 5</span>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Music className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">What interests you?</h1>
            <p className="text-gray-600">Select all the types of events you'd like to discover</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {interests.map((interest) => {
              const Icon = interest.icon;
              const isSelected = selectedInterests.includes(interest.value);
              
              return (
                <button
                  key={interest.value}
                  onClick={() => handleInterestToggle(interest.value)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                  data-testid={`interest-option-${interest.value}`}
                >
                  <div className={`w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center ${interest.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-medium">{interest.label}</div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center mx-auto mt-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 text-center">
              {selectedInterests.length === 0 
                ? "Select at least one interest to continue"
                : selectedInterests.length === 1
                ? "1 interest selected"
                : `${selectedInterests.length} interests selected`
              }
            </p>
          </div>

          <Button
            onClick={handleContinue}
            disabled={selectedInterests.length === 0}
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            data-testid="button-continue"
          >
            Continue
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => window.location.href = '/onboarding/frequency'}
              className="text-sm text-gray-500 hover:text-gray-700"
              data-testid="button-back"
            >
              ← Back
            </button>
            <button
              onClick={() => window.location.href = '/onboarding/preferences'}
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