import { type Event } from "../shared/schema";

interface GooglePlace {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  rating?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  next_page_token?: string;
}

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchEvents(location: string, radius: number = 10000): Promise<Event[]> {
    try {
      console.log(`Searching events for location: ${location}`);
      
      // First, get coordinates for the location
      const coordinates = await this.geocodeLocation(location);
      if (!coordinates) {
        console.error('Could not geocode location:', location);
        // Return mock events as fallback instead of throwing error
        return [];
      }

      console.log(`Geocoded to: ${coordinates.lat}, ${coordinates.lng}`);

      // Search for event venues and entertainment places
      const venues = await this.searchVenues(coordinates.lat, coordinates.lng, radius);
      
      if (venues.length === 0) {
        console.log('No venues found, returning empty array');
        return [];
      }
      
      // Convert venues to events with realistic data
      const events = this.convertVenuesToEvents(venues, location);
      
      console.log(`Generated ${events.length} events from venues`);
      return events;
    } catch (error) {
      console.error('Error fetching events from Google Places:', error);
      throw error;
    }
  }

  private async geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // Use the new Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const place = data.results[0];
        return {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        };
      }
      
      console.error('Geocoding failed:', data.status, data.error_message);
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  private async searchVenues(lat: number, lng: number, radius: number): Promise<GooglePlace[]> {
    const allVenues: GooglePlace[] = [];

    try {
      // Use Places API (New) for venue searches
      const response = await fetch(
        'https://places.googleapis.com/v1/places:searchNearby',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.photos,places.types,places.id,places.currentOpeningHours,places.businessStatus'
          },
          body: JSON.stringify({
            includedTypes: [
              'night_club',
              'bar', 
              'restaurant',
              'movie_theater',
              'bowling_alley',
              'amusement_park',
              'museum',
              'art_gallery',
              'performing_arts_theater',
              'stadium'
            ],
            maxResultCount: 20,
            locationRestriction: {
              circle: {
                center: {
                  latitude: lat,
                  longitude: lng
                },
                radius: radius
              }
            }
          })
        }
      );

      const data = await response.json();
      
      if (response.ok && data.places) {
        // Convert new API format to old format for compatibility
        const convertedVenues = data.places.map((place: any) => ({
          place_id: place.id,
          name: place.displayName?.text || 'Unknown Venue',
          vicinity: place.formattedAddress,
          formatted_address: place.formattedAddress,
          rating: place.rating,
          price_level: place.priceLevel,
          opening_hours: place.currentOpeningHours ? {
            open_now: place.businessStatus === 'OPERATIONAL'
          } : undefined,
          photos: place.photos?.map((photo: any) => ({
            photo_reference: photo.name,
            height: photo.heightPx || 400,
            width: photo.widthPx || 400
          })) || [],
          types: place.types || [],
          geometry: {
            location: {
              lat: place.location?.latitude || lat,
              lng: place.location?.longitude || lng
            }
          }
        }));
        
        allVenues.push(...convertedVenues);
        console.log(`Found ${convertedVenues.length} venues using Places API (New)`);
      } else {
        console.error('Places API (New) error:', data.error?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error with Places API (New):', error);
    }

    console.log(`Total unique venues found: ${allVenues.length}`);
    return allVenues.slice(0, 15);
  }

  private convertVenuesToEvents(venues: GooglePlace[], city: string): Event[] {
    const eventCategories = ['music', 'food', 'drinks', 'dancing', 'entertainment', 'sports'];
    const ageRequirements = ['18', '21', 'all'];
    
    return venues.map((venue, index) => {
      // Generate realistic event times for tonight
      const now = new Date();
      const eventStart = new Date(now);
      eventStart.setHours(18 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60)); // 6 PM to 12 AM
      
      const timeString = `${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}`;
      
      // Determine event type based on venue type
      let categories: string[] = [];
      let eventName = venue.name;
      
      if (venue.types.includes('night_club') || venue.types.includes('bar')) {
        categories = ['drinks', 'music', 'dancing'];
        eventName = `Live Music at ${venue.name}`;
      } else if (venue.types.includes('restaurant')) {
        categories = ['food', 'drinks'];
        eventName = `Dinner Experience at ${venue.name}`;
      } else if (venue.types.includes('movie_theater')) {
        categories = ['entertainment'];
        eventName = `Movie Night at ${venue.name}`;
      } else if (venue.types.includes('museum') || venue.types.includes('art_gallery')) {
        categories = ['entertainment'];
        eventName = `Evening Exhibition at ${venue.name}`;
      } else {
        categories = [eventCategories[Math.floor(Math.random() * eventCategories.length)]];
        eventName = `Event at ${venue.name}`;
      }

      // Generate realistic pricing based on venue type and rating
      let price = 0;
      if (venue.price_level) {
        switch (venue.price_level) {
          case 1: price = Math.floor(Math.random() * 2000) + 500; break; // $5-25
          case 2: price = Math.floor(Math.random() * 3000) + 1500; break; // $15-45
          case 3: price = Math.floor(Math.random() * 4000) + 2500; break; // $25-65
          case 4: price = Math.floor(Math.random() * 6000) + 4000; break; // $40-100
          default: price = Math.floor(Math.random() * 2000); // $0-20
        }
      } else {
        price = Math.floor(Math.random() * 3000); // Random price if no price level
      }

      // Some events should be free
      if (Math.random() < 0.2) price = 0;

      // Get venue photo URL using Places API (New) format
      let imageUrl = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240`;
      
      if (venue.photos?.length) {
        // Use Places API (New) photo format
        const photoName = venue.photos[0].photo_reference;
        imageUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${this.apiKey}`;
      }

      return {
        id: venue.place_id,
        name: eventName,
        description: `Join us for an amazing ${categories.join(', ')} experience at ${venue.name}. ${venue.vicinity || venue.formatted_address || ''}`,
        venue: venue.name,
        address: venue.vicinity || venue.formatted_address || '',
        city: city,
        startTime: timeString,
        price: price,
        categories: categories,
        ageRequirement: ageRequirements[Math.floor(Math.random() * ageRequirements.length)],
        capacity: Math.floor(Math.random() * 200) + 50,
        attendees: Math.floor(Math.random() * 150) + 10,
        imageUrl: imageUrl,
        ticketLinks: {},
        rating: venue.rating || Math.floor(Math.random() * 20) + 35 / 10 // Convert to 3.5-5.0 scale
      } as Event;
    });
  }
}

export default GooglePlacesService;