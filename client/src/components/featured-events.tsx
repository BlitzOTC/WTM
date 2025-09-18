import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type Event } from '@shared/schema';
import EventCard from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface FeaturedEventsProps {
  onAddToPlan: (event: Event) => void;
  onViewDetails: (event: Event) => void;
  isInPlan: (eventId: string) => boolean;
}

export default function FeaturedEvents({ onAddToPlan, onViewDetails, isInPlan }: FeaturedEventsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get user's onboarding interests
  const getUserInterests = () => {
    try {
      const onboardingData = localStorage.getItem('onboarding_data');
      if (onboardingData) {
        const preferences = JSON.parse(onboardingData);
        return preferences.interests || [];
      }
      
      // Fallback to old storage key
      const interests = localStorage.getItem('onboarding_interests');
      if (interests) {
        return JSON.parse(interests);
      }
    } catch (error) {
      console.error('Error getting user interests:', error);
    }
    return [];
  };

  const userInterests = getUserInterests();

  // Get user's location preference
  const getUserLocation = () => {
    try {
      const onboardingData = localStorage.getItem('onboarding_data');
      if (onboardingData) {
        const preferences = JSON.parse(onboardingData);
        return preferences.location || 'San Francisco, CA';
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
    return 'San Francisco, CA';
  };

  const userLocation = getUserLocation();

  // Fetch featured events based on user interests
  const { data: featuredEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events/featured', userInterests, userLocation],
    queryFn: async () => {
      if (userInterests.length === 0) {
        return [];
      }
      
      const params = new URLSearchParams();
      params.append('interests', JSON.stringify(userInterests));
      params.append('location', userLocation);
      
      const response = await fetch(`/api/events/featured?${params}`);
      if (!response.ok) throw new Error('Failed to fetch featured events');
      return response.json();
    },
    enabled: userInterests.length > 0
  });

  // Don't show anything if user hasn't completed onboarding
  if (userInterests.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, featuredEvents.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, featuredEvents.length - 2)) % Math.max(1, featuredEvents.length - 2));
  };

  const getInterestLabel = (interest: string) => {
    const labels: Record<string, string> = {
      'music': '🎵 Live Music',
      'food': '🍽️ Food',
      'drinks': '🍸 Cocktails',
      'sports': '⚽ Sports',
      'culture': '🎨 Arts & Culture',
      'networking': '🤝 Networking',
      'gaming': '🎮 Gaming',
      'events': '🎭 Entertainment'
    };
    return labels[interest] || interest;
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">Featured For You</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <Skeleton className="h-32 w-full mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <div className="mb-8" data-testid="section-featured-events">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold" data-testid="text-featured-title">
            Featured For You
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Based on your interests:</span>
          <div className="flex gap-1">
            {userInterests.slice(0, 3).map((interest: string) => (
              <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {getInterestLabel(interest)}
              </span>
            ))}
            {userInterests.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{userInterests.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-hidden">
          {featuredEvents.slice(currentIndex, currentIndex + 3).map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onAddToPlan={onAddToPlan}
              onViewDetails={onViewDetails}
              isInPlan={isInPlan(event.id)}
              data-testid={`card-featured-${event.id}`}
            />
          ))}
        </div>

        {featuredEvents.length > 3 && (
          <div className="flex justify-center mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={featuredEvents.length <= 3}
              data-testid="button-featured-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={featuredEvents.length <= 3}
              data-testid="button-featured-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}