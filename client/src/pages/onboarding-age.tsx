import { useState } from "react";
import { ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingAge() {
  const [selectedAge, setSelectedAge] = useState<string>("");

  const ageRanges = [
    { value: "under-18", label: "Under 18" },
    { value: "18-24", label: "18-24 years old" },
    { value: "25-29", label: "25-29 years old" },
    { value: "30-34", label: "30-34 years old" },
    { value: "35-39", label: "35-39 years old" },
    { value: "40+", label: "40+ years old" }
  ];

  const handleContinue = () => {
    if (selectedAge) {
      // Store age preference in localStorage or context
      localStorage.setItem('onboarding_age', selectedAge);
      window.location.href = '/onboarding/location';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
          <span className="ml-4 text-sm text-gray-600">1 of 5</span>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">What's your age?</h1>
            <p className="text-gray-600">This helps us recommend age-appropriate events and venues</p>
          </div>

          <div className="space-y-3 mb-8">
            {ageRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedAge(range.value)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedAge === range.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
                data-testid={`age-option-${range.value}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{range.label}</span>
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedAge}
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            data-testid="button-continue"
          >
            Continue
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="text-center mt-4">
            <button
              onClick={() => window.location.href = '/onboarding/location'}
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