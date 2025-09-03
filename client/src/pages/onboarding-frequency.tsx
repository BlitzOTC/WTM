import { useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingFrequency() {
  const [selectedFrequency, setSelectedFrequency] = useState<string>("");

  const frequencies = [
    { value: "1", label: "Once a week", description: "I like to go out occasionally" },
    { value: "2-3", label: "2-3 times a week", description: "I'm pretty social and active" },
    { value: "4-5", label: "4-5 times a week", description: "I love exploring nightlife regularly" },
    { value: "6+", label: "Almost every night", description: "I'm always looking for something to do" },
    { value: "rare", label: "Rarely", description: "I prefer special occasions only" },
    { value: "varies", label: "It varies", description: "Depends on my mood and schedule" }
  ];

  const handleContinue = () => {
    if (selectedFrequency) {
      localStorage.setItem('onboarding_frequency', selectedFrequency);
      window.location.href = '/onboarding/interests';
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
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
          <span className="ml-4 text-sm text-gray-600">3 of 5</span>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">How often do you go out?</h1>
            <p className="text-gray-600">This helps us understand your social activity level</p>
          </div>

          <div className="space-y-3 mb-8">
            {frequencies.map((frequency) => (
              <button
                key={frequency.value}
                onClick={() => setSelectedFrequency(frequency.value)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedFrequency === frequency.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
                data-testid={`frequency-option-${frequency.value}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{frequency.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{frequency.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedFrequency}
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            data-testid="button-continue"
          >
            Continue
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => window.location.href = '/onboarding/location'}
              className="text-sm text-gray-500 hover:text-gray-700"
              data-testid="button-back"
            >
              ← Back
            </button>
            <button
              onClick={() => window.location.href = '/onboarding/interests'}
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