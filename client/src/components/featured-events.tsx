import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type Event } from '@shared/schema';
import EventCard from '@/components/event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

interface FeaturedEventsProps {
  onAddToPlan: (event: Event) => void;
  onViewDetails: (event: Event) => void;
  isInPlan: (eventId: string) => boolean;
  currentLocation?: string;
}

export default function FeaturedEvents({ onAddToPlan, onViewDetails, isInPlan, currentLocation }: FeaturedEventsProps) {
  const [page, setPage] = useState(1);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

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

  // Memoize user interests to prevent infinite re-renders
  const userInterests = useMemo(() => getUserInterests(), []);
  const hasOnboarding = userInterests.length > 0;

  // Memoize user location to prevent infinite re-renders
  const userLocation = useMemo(() => {
    // Use current location from search query first
    if (currentLocation) {
      return currentLocation;
    }
    
    // Try to get from onboarding data
    try {
      const onboardingData = localStorage.getItem('onboarding_data');
      if (onboardingData) {
        const preferences = JSON.parse(onboardingData);
        if (preferences.location) {
          return preferences.location;
        }
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
    
    // Default to New York as fallback
    return 'New York, NY';
  }, [currentLocation]);

  // Fetch featured events with pagination
  const { data: pageData, isLoading, isFetching } = useQuery<{events: Event[], hasMore: boolean}>({
    queryKey: ['/api/events/featured', userInterests, userLocation, page, hasOnboarding],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Always include location
      params.append('location', userLocation);
      params.append('page', page.toString());
      params.append('limit', '12');
      
      // Only include interests if user has completed onboarding
      if (hasOnboarding) {
        params.append('interests', JSON.stringify(userInterests));
      }
      
      const response = await fetch(`/api/events/featured?${params}`);
      if (!response.ok) throw new Error('Failed to fetch featured events');
      const data = await response.json();
      return {
        events: data.events || data, // Handle both old and new response format
        hasMore: data.hasMore ?? (data.events || data).length >= 12
      };
    },
    enabled: true // Always enable, show popular events if no onboarding
  });
  
  // Update allEvents when new data arrives
  useEffect(() => {
    if (pageData) {
      if (page === 1) {
        setAllEvents(pageData.events);
      } else {
        // Dedupe by event ID to avoid duplicates
        setAllEvents(prev => {
          const existingIds = new Set(prev.map(e => e.id));
          const newEvents = pageData.events.filter(e => !existingIds.has(e.id));
          return [...prev, ...newEvents];
        });
      }
      setHasMore(pageData.hasMore);
      setIsLoadingMore(false);
    }
  }, [pageData, page]);
  
  // Load more events when intersection observer triggers
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [isFetching, hasMore, isLoadingMore]);
  
  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [loadMore, hasMore, isFetching]);
  
  // Reset pagination when interests or location change
  useEffect(() => {
    setPage(1);
    setAllEvents([]);
    setHasMore(true);
  }, [userInterests, userLocation]);

  // Always show Featured Events section


  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-500" />
          <div>
            <h2 className="text-xl font-semibold">{hasOnboarding ? 'Featured For You' : 'Popular Events'}</h2>
            <p className="text-sm text-gray-600">{hasOnboarding ? 'Based on your interests' : 'Most popular events in your area'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-5">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (allEvents.length === 0 && !isLoading) {
    return (
      <div className="mb-8" data-testid="section-featured-events">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-500" />
          <div>
            <h2 className="text-xl font-semibold" data-testid="text-featured-title">
              {hasOnboarding ? 'Featured For You' : 'Popular Events'}
            </h2>
            <p className="text-sm text-gray-600">{hasOnboarding ? 'Based on your interests' : 'Most popular events in your area'}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-2">No events found in your area</p>
          <p className="text-sm text-gray-500">Try searching for events in a different location</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8" data-testid="section-featured-events">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-5 w-5 text-yellow-500" />
        <div>
          <h2 className="text-xl font-semibold" data-testid="text-featured-title">
            {hasOnboarding ? 'Featured For You' : 'Popular Events'}
          </h2>
          <p className="text-sm text-gray-600">{hasOnboarding ? 'Based on your interests' : 'Most popular events in your area'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onAddToPlan={onAddToPlan}
            onViewDetails={onViewDetails}
            isInPlan={isInPlan(event.id)}
            data-testid={`card-featured-${event.id}`}
          />
        ))}
        
        {/* Loading more events */}
        {isFetching && page > 1 && (
          [...Array(3)].map((_, i) => (
            <div key={`loading-${i}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <Skeleton className="h-48 w-full" />
              <div className="p-5">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Intersection observer target */}
      <div ref={observerTarget} className="h-4 w-full" />
    </div>
  );
}