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
        name: venue.name, // Use actual venue name from Google Places
        description: this.generateVenueDescription(venue.types, venue.name),
        venue: venue.name, // Venue name should match for restaurants
        address: venue.vicinity || venue.formatted_address || '',
        city: city,
        state: 'CA', // Default state
        startTime: timeString,
        endTime: null,
        price: price,
        ageRequirement: venueData.ageRequirement,
        dressCode: null,
        categories: categories,
        eventType: 'venue',
        privacy: 'public',
        hostId: 'system',
        maxCapacity: Math.floor(Math.random() * 200) + 50,
        currentAttendees: Math.floor(Math.random() * 150) + 10,
        imageUrl: imageUrl,
        ticketLinks: this.generateTicketLinks(venue.name, categories)
      } as Event;
    });
  }

  private generateVenueListingDetails(venueTypes: string[], venueName: string) {
    const musicEvents = [
      'Stadium Concert', 'Arena Show', 'Club Concert', 'Bar Live Music', 'Album Release Show',
      'Local Band Showcase', 'Battle of the Bands', 'Tribute Night', 'Jazz Night', 'Blues Jam',
      'Acoustic Set', 'Piano Bar Sing-Along', 'Open Mic Night', 'DJ Set', 'House Music Night',
      'Techno Night', 'EDM Show', 'Hip-Hop Night', 'Music Festival', 'After-Party'
    ];
    
    const fastfoodEvents = [
      'Grand Opening', 'Soft Opening', 'Limited-Time Menu', 'Collaboration Drop',
      'Late-Night Menu', 'BOGO Night', '2-for-1 Special', 'Food Truck Rally',
      'Street Food Market', 'Night Market', 'Pop-up Kitchen', 'Value Menu Special'
    ];
    
    const restaurantEvents = [
      'Chef\'s Tasting Menu', 'Omakase Seating', 'Wine Pairing Dinner', 'Beer Pairing',
      'Guest Chef Takeover', 'Seasonal Menu', 'Holiday Menu', 'Valentine\'s Special',
      'Bottomless Brunch', 'Supper Club', 'Cooking Class', 'Demo Dinner'
    ];
    
    const drinksEvents = [
      'Happy Hour', 'Late-Night Happy Hour', 'Industry Night', 'Mixology Class',
      'Spirits Tasting', 'Wine Flight', 'Tap Takeover', 'Brewery Event',
      'Cocktail Menu Launch', 'Guest Bartender', 'Rooftop Bar Night', 'Speakeasy Experience'
    ];
    
    const dancingEvents = [
      'DJ Night', '\'80s Night', '\'90s Night', 'Disco Night', 'Salsa Social',
      'Swing Social', 'Line Dancing', 'Hip-Hop Night', 'Silent Disco',
      'Day Party', 'Rooftop Party', 'Dance Battle', 'Foam Party'
    ];
    
    const entertainmentEvents = [
      'Stand-up Comedy', 'Improv Show', 'Karaoke Night', 'Trivia Night',
      'Magic Show', 'Movie Screening', 'Arcade Night', 'Escape Room',
      'Murder Mystery Dinner', 'Board Game Tournament', 'Game Show Night'
    ];
    
    const sportsEvents = [
      'Sports Watch Party', 'PPV Fight Night', 'Bowling Night', 'Pool Tournament',
      'Axe Throwing', 'Esports Tournament', 'Poker Night', 'Fantasy Draft Party'
    ];
    
    const artEvents = [
      'Theater Performance', 'Opera Night', 'Symphony Concert', 'Art Exhibition',
      'Gallery Opening', 'Poetry Slam', 'Author Talk', 'Cultural Festival',
      'Art Workshop', 'History Tour', 'Drag Cabaret'
    ];
    
    // For venue listings, use the venue name directly
    if (venueTypes.includes('restaurant') || venueTypes.includes('meal_takeaway') || venueTypes.includes('food')) {
      // Determine if it's fast food or restaurant based on name/type
      const fastFoodKeywords = ['mcdonalds', 'burger king', 'kfc', 'taco bell', 'subway', 'pizza hut', 'dominos', 'wendys', 'chipotle', 'starbucks', 'dunkin', 'dairy queen', 'five guys', 'in-n-out', 'chick-fil-a', 'popeyes', 'arbys', 'sonic', 'jack in the box', 'del taco', 'panda express', 'qdoba', 'jimmy johns', 'panera'];
      const venueLower = venueName.toLowerCase();
      const isFastFood = fastFoodKeywords.some(keyword => venueLower.includes(keyword)) || venueTypes.includes('meal_takeaway');
      
      return {
        name: venueName, // Restaurant name as main title
        categories: isFastFood ? ['fastfood', 'drinks'] : ['restaurant', 'drinks'],
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
        categories: ['art'],
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

  private generateTicketLinks(venueName: string, categories: string[]): Record<string, string> {
    const links: Record<string, string> = {};
    
    // Check if this is a restaurant venue
    const isRestaurant = categories.includes('fastfood') || categories.includes('restaurant');
    
    // For restaurants, add website URL for menu access
    if (isRestaurant) {
      const venueSlug = venueName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
      links.website = `https://www.${venueSlug}.com`;
      return links;
    }
    
    // Major venues and entertainment venues typically have tickets
    const majorVenues = ['Garden', 'Arena', 'Center', 'Bowl', 'Theater', 'Theatre', 'Hall'];
    const musicVenues = ['Blue Note', 'Apollo', 'Beacon', 'Lincoln Center', 'Madison Square'];
    const theaterVenues = ['Broadway', 'Playhouse', 'Opera House', 'Symphony'];
    
    const isMajor = majorVenues.some(type => venueName.includes(type));
    const isMusic = musicVenues.some(type => venueName.includes(type)) || categories.includes('music');
    const isTheater = theaterVenues.some(type => venueName.includes(type)) || categories.includes('entertainment');
    
    // Only add ticket links for venues that typically sell tickets
    if (isMajor || isMusic || isTheater) {
      const venueSlug = venueName.replace(/\s+/g, '-').toLowerCase();
      
      // Major venues get multiple ticket sources
      if (isMajor) {
        links.ticketmaster = `https://ticketmaster.com/venue/${venueSlug}`;
        links.stubhub = `https://stubhub.com/venue/${venueSlug}`;
        if (Math.random() > 0.5) { // 50% chance of SeatGeek
          links.seatgeek = `https://seatgeek.com/venues/${venueSlug}`;
        }
      }
      // Music venues typically use Ticketmaster
      else if (isMusic) {
        links.ticketmaster = `https://ticketmaster.com/venue/${venueSlug}`;
        if (Math.random() > 0.7) { // 30% chance of StubHub
          links.stubhub = `https://stubhub.com/venue/${venueSlug}`;
        }
      }
      // Theater venues often use specialized ticketing
      else if (isTheater) {
        links.ticketmaster = `https://ticketmaster.com/venue/${venueSlug}`;
      }
    }
    
    return links;
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