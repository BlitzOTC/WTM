import { type Event } from "../shared/schema";
import { RealEventAggregator, TicketmasterAPI, EventbriteAPI } from "./event-apis";

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
      console.log(`Searching for real events in location: ${location}`);
      
      // First, get coordinates for the location
      const coordinates = await this.geocodeLocation(location);
      if (!coordinates) {
        console.error('Could not geocode location:', location);
        return [];
      }

      console.log(`Geocoded to: ${coordinates.lat}, ${coordinates.lng}`);

      // Try to get real events from APIs first
      const realEvents = await this.fetchRealEvents(location, coordinates.lat, coordinates.lng);
      
      if (realEvents.length > 0) {
        console.log(`Found ${realEvents.length} real events`);
        return realEvents;
      }
      
      // If no real events, show venue listings only
      console.log('No real events found, showing venue listings');
      const venues = await this.searchVenues(coordinates.lat, coordinates.lng, radius);
      
      if (venues.length === 0) {
        console.log('No venues found');
        return [];
      }
      
      // Convert venues to simple venue listings
      const venueListings = this.convertVenuesToListings(venues, location);
      
      console.log(`Found ${venueListings.length} venue listings`);
      return venueListings;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  private async fetchRealEvents(location: string, lat: number, lng: number): Promise<Event[]> {
    const eventAggregator = new RealEventAggregator();
    
    // Add event APIs if API keys are available
    const ticketmasterKey = process.env.TICKETMASTER_API_KEY;
    const eventbriteKey = process.env.EVENTBRITE_API_KEY;
    
    if (ticketmasterKey) {
      console.log('Using Ticketmaster API for real events');
      eventAggregator.addAPI(new TicketmasterAPI(ticketmasterKey));
    }
    
    if (eventbriteKey) {
      console.log('Using Eventbrite API for real events');
      eventAggregator.addAPI(new EventbriteAPI(eventbriteKey));
    }
    
    if (!ticketmasterKey && !eventbriteKey) {
      console.log('No event API keys available - cannot fetch real events');
      return [];
    }
    
    return await eventAggregator.searchAllEvents(location, lat, lng);
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

  private convertVenuesToListings(venues: GooglePlace[], city: string): Event[] {
    const eventCategories = ['music', 'food', 'drinks', 'dancing', 'entertainment', 'sports'];
    const ageRequirements = ['18', '21', 'all'];
    
    return venues.map((venue, index) => {
      // Generate realistic event times for tonight
      const now = new Date();
      const eventStart = new Date(now);
      eventStart.setHours(18 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60)); // 6 PM to 12 AM
      
      const timeString = `${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}`;
      
      // Generate venue listing details based on venue type
      const venueData = this.generateVenueListingDetails(venue.types, venue.name);
      const categories = venueData.categories;
      const listingName = venueData.name;

      // Generate realistic pricing based on venue type
      const price = this.generateVenuePrice(venue.types, venue.price_level);

      // Get venue photo URL using Places API (New) format
      let imageUrl = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240`;
      
      if (venue.photos?.length) {
        // Use Places API (New) photo format
        const photoName = venue.photos[0].photo_reference;
        imageUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${this.apiKey}`;
      }

      return {
        id: venue.place_id,
        name: listingName,
        description: this.generateVenueDescription(venue.types, venue.name),
        venue: venue.name,
        address: venue.vicinity || venue.formatted_address || '',
        city: city,
        startTime: timeString,
        price: price,
        categories: categories,
        ageRequirement: venueData.ageRequirement,
        capacity: Math.floor(Math.random() * 200) + 50,
        attendees: Math.floor(Math.random() * 150) + 10,
        imageUrl: imageUrl,
        ticketLinks: {},
        rating: venue.rating || Math.floor(Math.random() * 15) + 35 / 10
      } as Event;
    });
  }

  private generateVenueListingDetails(venueTypes: string[], venueName: string) {
    const musicEvents = [
      'Live Jazz Night', 'Acoustic Session', 'DJ Set', 'Open Mic Night', 'Live Band Performance',
      'Karaoke Night', 'Blues Jam Session', 'Rock Concert', 'Electronic Music Night', 'Indie Music Showcase'
    ];
    
    const restaurantEvents = [
      'Wine Pairing Dinner', 'Chef\'s Tasting Menu', 'Date Night Special', 'Happy Hour',
      'Brunch Experience', 'Cocktail Class', 'Food & Wine Festival', 'Live Cooking Demo',
      'Seasonal Menu Launch', 'Chef\'s Table Experience'
    ];
    
    const comedyEvents = [
      'Stand-Up Comedy Show', 'Comedy Open Mic', 'Improv Night', 'Comedy Showcase',
      'Late Night Comedy', 'Comedy Special Taping', 'Roast Battle', 'Comedy Competition'
    ];
    
    const artEvents = [
      'Art Gallery Opening', 'Artist Meet & Greet', 'Photography Exhibition', 'Sculpture Display',
      'Contemporary Art Show', 'Local Artist Showcase', 'Art Walk', 'Creative Workshop'
    ];
    
    const theaterEvents = [
      'Live Theater Performance', 'Musical Theater', 'Drama Production', 'Comedy Play',
      'One-Man Show', 'Shakespeare Performance', 'Original Production', 'Theater Workshop'
    ];
    
    // For venue listings, use the venue name directly
    if (venueTypes.includes('restaurant') || venueTypes.includes('meal_takeaway') || venueTypes.includes('food')) {
      return {
        name: venueName, // Restaurant name as main title
        categories: ['food', 'drinks'],
        ageRequirement: 'all'
      };
    } else if (venueTypes.includes('night_club') || venueTypes.includes('bar')) {
      return {
        name: venueName, // Bar name as main title
        categories: ['drinks', 'music', 'dancing'],
        ageRequirement: '21'
      };
    } else if (venueTypes.includes('movie_theater')) {
      return {
        name: venueName, // Theater name as main title
        categories: ['entertainment'],
        ageRequirement: 'all'
      };
    } else if (venueTypes.includes('museum') || venueTypes.includes('art_gallery')) {
      return {
        name: venueName, // Museum/Gallery name as main title
        categories: ['entertainment'],
        ageRequirement: 'all'
      };
    } else {
      return {
        name: venueName, // Venue name as main title
        categories: ['entertainment'],
        ageRequirement: '18'
      };
    }
  }

  private generateVenuePrice(venueTypes: string[], priceLevel?: number): number {
    // Restaurants have no cover charge (price = 0), people spend money on food/drinks inside
    if (venueTypes.includes('restaurant') || venueTypes.includes('meal_takeaway') || venueTypes.includes('food')) {
      return 0; // No cover charge for restaurants
    }
    
    // Museums and galleries typically have admission fees
    if (venueTypes.includes('museum') || venueTypes.includes('art_gallery')) {
      return Math.floor(Math.random() * 2000) + 1000; // $10-30 admission
    }
    
    // Movie theaters have ticket prices
    if (venueTypes.includes('movie_theater')) {
      return Math.floor(Math.random() * 1500) + 1200; // $12-27 tickets
    }
    
    // Bowling alleys and entertainment venues
    if (venueTypes.includes('bowling_alley') || venueTypes.includes('amusement_park')) {
      return Math.floor(Math.random() * 2500) + 1500; // $15-40
    }
    
    // Bars and nightclubs - cover charges based on price level
    if (venueTypes.includes('night_club') || venueTypes.includes('bar')) {
      if (priceLevel) {
        switch (priceLevel) {
          case 1: return Math.floor(Math.random() * 1000) + 500; // $5-15
          case 2: return Math.floor(Math.random() * 1500) + 1000; // $10-25
          case 3: return Math.floor(Math.random() * 2000) + 1500; // $15-35
          case 4: return Math.floor(Math.random() * 3000) + 2000; // $20-50
        }
      }
      
      // Random cover charge for bars/clubs without price level
      const isFree = Math.random() < 0.3; // 30% chance of no cover
      return isFree ? 0 : Math.floor(Math.random() * 2000) + 500; // $0 or $5-25
    }
    
    // Default pricing for other venue types
    const isFree = Math.random() < 0.2; // 20% chance of free events
    return isFree ? 0 : Math.floor(Math.random() * 2500) + 1000; // $0 or $10-35
  }

  private generateVenueDescription(venueTypes: string[], venueName: string): string {
    if (venueTypes.includes('restaurant') || venueTypes.includes('meal_takeaway') || venueTypes.includes('food')) {
      return `Popular dining destination offering quality cuisine and atmosphere. Check our menu for current offerings and specialties.`;
    }
    
    if (venueTypes.includes('night_club') || venueTypes.includes('bar')) {
      return `Popular nightlife venue with drinks, music, and entertainment. Check current events and hours.`;
    }
    
    if (venueTypes.includes('movie_theater')) {
      return `Movie theater showing current films. Check showtimes and ticket availability.`;
    }
    
    if (venueTypes.includes('museum') || venueTypes.includes('art_gallery')) {
      return `Cultural venue featuring exhibitions and educational programs. Check current exhibits and visiting hours.`;
    }
    
    return `Popular local venue. Check current events and operating hours.`;
  }
}

export default GooglePlacesService;