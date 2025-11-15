import { type Event } from "../shared/schema";

interface TicketmasterEvent {
  id: string;
  name: string;
  type: string;
  url?: string;
  locale: string;
  images?: Array<{
    ratio: string;
    url: string;
    width: number;
    height: number;
    fallback: boolean;
  }>;
  dates: {
    start: {
      localDate?: string;
      localTime?: string;
      dateTime?: string;
      dateTBD?: boolean;
      dateTBA?: boolean;
      timeTBA?: boolean;
      noSpecificTime?: boolean;
    };
    timezone?: string;
    status: {
      code: string;
    };
    spanMultipleDays?: boolean;
  };
  classifications?: Array<{
    primary: boolean;
    segment: {
      id: string;
      name: string;
    };
    genre: {
      id: string;
      name: string;
    };
    subGenre: {
      id: string;
      name: string;
    };
    type: {
      id: string;
      name: string;
    };
    subType: {
      id: string;
      name: string;
    };
    family?: boolean;
  }>;
  promoter?: {
    id: string;
    name: string;
    description: string;
  };
  promoters?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  info?: string;
  pleaseNote?: string;
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  seatmap?: {
    staticUrl: string;
  };
  _embedded?: {
    venues?: Array<{
      name: string;
      type: string;
      id: string;
      test: boolean;
      url?: string;
      locale: string;
      images?: Array<{
        ratio: string;
        url: string;
        width: number;
        height: number;
        fallback: boolean;
      }>;
      postalCode?: string;
      timezone?: string;
      city: {
        name: string;
      };
      state: {
        name: string;
        stateCode: string;
      };
      country: {
        name: string;
        countryCode: string;
      };
      address: {
        line1?: string;
        line2?: string;
      };
      location: {
        longitude: string;
        latitude: string;
      };
      markets?: Array<{
        name: string;
        id: string;
      }>;
      dmas?: Array<{
        id: number;
      }>;
      boxOfficeInfo?: {
        phoneNumberDetail?: string;
        openHoursDetail?: string;
        acceptedPaymentDetail?: string;
        willCallDetail?: string;
      };
      parkingDetail?: string;
      accessibleSeatingDetail?: string;
      generalInfo?: {
        generalRule?: string;
        childRule?: string;
      };
      upcomingEvents: {
        ticketmaster?: number;
        _total: number;
        _filtered: number;
      };
      ada?: {
        adaPhones?: string;
        adaCustomCopy?: string;
        adaHours?: string;
      };
    }>;
    attractions?: Array<{
      name: string;
      type: string;
      id: string;
      test: boolean;
      url?: string;
      locale: string;
      externalLinks?: {
        youtube?: Array<{
          url: string;
        }>;
        twitter?: Array<{
          url: string;
        }>;
        itunes?: Array<{
          url: string;
        }>;
        lastfm?: Array<{
          url: string;
        }>;
        facebook?: Array<{
          url: string;
        }>;
        spotify?: Array<{
          url: string;
        }>;
        instagram?: Array<{
          url: string;
        }>;
        homepage?: Array<{
          url: string;
        }>;
      };
      images?: Array<{
        ratio: string;
        url: string;
        width: number;
        height: number;
        fallback: boolean;
      }>;
      classifications?: Array<{
        primary: boolean;
        segment: {
          id: string;
          name: string;
        };
        genre: {
          id: string;
          name: string;
        };
        subGenre: {
          id: string;
          name: string;
        };
        type: {
          id: string;
          name: string;
        };
        subType: {
          id: string;
          name: string;
        };
        family?: boolean;
      }>;
      upcomingEvents: {
        ticketmaster?: number;
        _total: number;
        _filtered: number;
      };
    }>;
  };
}

interface TicketmasterResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
  _links: {
    self: {
      href: string;
      templated?: boolean;
    };
    next?: {
      href: string;
      templated?: boolean;
    };
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export class TicketmasterService {
  private apiKey: string;
  private baseUrl = 'https://app.ticketmaster.com/discovery/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchEvents(location: string, options: {
    radius?: number;
    size?: number;
    categories?: string[];
    priceMin?: number;
    priceMax?: number;
    ageRequirement?: string;
  } = {}): Promise<Event[]> {
    try {
      // First, geocode the location to get lat/lng
      const coords = await this.geocodeLocation(location);
      if (!coords) {
        console.log('Could not geocode location for Ticketmaster search');
        return [];
      }

      const {
        radius = 25,
        size = 50,
        categories = [],
        priceMin,
        priceMax
      } = options;

      // Build the API URL
      let url = `${this.baseUrl}/events.json?apikey=${this.apiKey}`;
      url += `&latlong=${coords.lat},${coords.lng}`;
      url += `&radius=${radius}&unit=miles`;
      url += `&size=${size}`;
      url += `&sort=date,asc`;
      
      // Add classification filters (music, sports, arts, theater, etc.)
      const classifications = this.mapCategoriesToClassifications(categories);
      if (classifications.length > 0) {
        url += `&classificationName=${classifications.join(',')}`;
      } else {
        // Default to popular event types
        url += `&classificationName=music,sports,arts,theater,film,miscellaneous`;
      }

      // Add price filters if specified
      if (priceMin !== undefined) {
        url += `&priceMin=${priceMin}`;
      }
      if (priceMax !== undefined) {
        url += `&priceMax=${priceMax}`;
      }

      console.log(`Searching Ticketmaster API: ${url.replace(this.apiKey, 'HIDDEN')}`);

      const response = await fetch(url);
      if (!response.ok) {
        console.error('Ticketmaster API error:', response.status, response.statusText);
        return [];
      }

      const data: TicketmasterResponse = await response.json();
      
      if (!data._embedded?.events) {
        console.log('No events found in Ticketmaster response');
        return [];
      }

      console.log(`Found ${data._embedded.events.length} events from Ticketmaster`);
      
      const events = data._embedded.events
        .map(event => this.convertTicketmasterEvent(event, location))
        .filter(event => event !== null) as Event[];

      return events;
    } catch (error) {
      console.error('Error fetching from Ticketmaster:', error);
      return [];
    }
  }

  private async geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // Use Google Geocoding API if available
      const googleApiKey = process.env.GOOGLE_API_KEY;
      if (googleApiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleApiKey}`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          return { lat, lng };
        }
      }

      // Fallback to hardcoded coordinates for major cities
      const cityCoords: Record<string, { lat: number; lng: number }> = {
        'los angeles': { lat: 34.0522, lng: -118.2437 },
        'new york': { lat: 40.7128, lng: -74.0060 },
        'chicago': { lat: 41.8781, lng: -87.6298 },
        'houston': { lat: 29.7604, lng: -95.3698 },
        'phoenix': { lat: 33.4484, lng: -112.0740 },
        'philadelphia': { lat: 39.9526, lng: -75.1652 },
        'san antonio': { lat: 29.4241, lng: -98.4936 },
        'san diego': { lat: 32.7157, lng: -117.1611 },
        'dallas': { lat: 32.7767, lng: -96.7970 },
        'san jose': { lat: 37.3382, lng: -121.8863 },
        'austin': { lat: 30.2672, lng: -97.7431 },
        'jacksonville': { lat: 30.3322, lng: -81.6557 },
        'fort worth': { lat: 32.7555, lng: -97.3308 },
        'columbus': { lat: 39.9612, lng: -82.9988 },
        'charlotte': { lat: 35.2271, lng: -80.8431 },
        'san francisco': { lat: 37.7749, lng: -122.4194 },
        'indianapolis': { lat: 39.7684, lng: -86.1581 },
        'seattle': { lat: 47.6062, lng: -122.3321 },
        'denver': { lat: 39.7392, lng: -104.9903 },
        'washington': { lat: 38.9072, lng: -77.0369 },
        'boston': { lat: 42.3601, lng: -71.0589 },
        'el paso': { lat: 31.7619, lng: -106.4850 },
        'detroit': { lat: 42.3314, lng: -83.0458 },
        'nashville': { lat: 36.1627, lng: -86.7816 },
        'portland': { lat: 45.5152, lng: -122.6784 },
        'memphis': { lat: 35.1495, lng: -90.0490 },
        'oklahoma city': { lat: 35.4676, lng: -97.5164 },
        'las vegas': { lat: 36.1699, lng: -115.1398 },
        'louisville': { lat: 38.2527, lng: -85.7585 },
        'baltimore': { lat: 39.2904, lng: -76.6122 },
        'milwaukee': { lat: 43.0389, lng: -87.9065 },
        'albuquerque': { lat: 35.0844, lng: -106.6504 },
        'tucson': { lat: 32.2226, lng: -110.9747 },
        'fresno': { lat: 36.7378, lng: -119.7871 },
        'sacramento': { lat: 38.5816, lng: -121.4944 },
        'mesa': { lat: 33.4152, lng: -111.8315 },
        'kansas city': { lat: 39.0997, lng: -94.5786 },
        'atlanta': { lat: 33.7490, lng: -84.3880 },
        'long beach': { lat: 33.7701, lng: -118.1937 },
        'colorado springs': { lat: 38.8339, lng: -104.8214 },
        'raleigh': { lat: 35.7796, lng: -78.6382 },
        'miami': { lat: 25.7617, lng: -80.1918 },
        'virginia beach': { lat: 36.8529, lng: -75.9780 },
        'omaha': { lat: 41.2565, lng: -95.9345 },
        'oakland': { lat: 37.8044, lng: -122.2711 },
        'minneapolis': { lat: 44.9778, lng: -93.2650 },
        'tulsa': { lat: 36.1540, lng: -95.9928 },
        'arlington': { lat: 32.7357, lng: -97.1081 },
        'tampa': { lat: 27.9506, lng: -82.4572 },
        'new orleans': { lat: 29.9511, lng: -90.0715 },
        'wichita': { lat: 37.6872, lng: -97.3301 },
        'cleveland': { lat: 41.4993, lng: -81.6944 },
        'bakersfield': { lat: 35.3733, lng: -119.0187 },
        'aurora': { lat: 39.7294, lng: -104.8319 },
        'anaheim': { lat: 33.8366, lng: -117.9143 },
        'honolulu': { lat: 21.3099, lng: -157.8581 },
        'santa ana': { lat: 33.7455, lng: -117.8677 },
        'corpus christi': { lat: 27.8006, lng: -97.3964 },
        'riverside': { lat: 33.9533, lng: -117.3962 },
        'lexington': { lat: 38.0406, lng: -84.5037 },
        'stockton': { lat: 37.9577, lng: -121.2908 },
        'henderson': { lat: 36.0395, lng: -114.9817 },
        'saint paul': { lat: 44.9537, lng: -93.0900 },
        'st. louis': { lat: 38.6270, lng: -90.1994 },
        'cincinnati': { lat: 39.1031, lng: -84.5120 },
        'pittsburgh': { lat: 40.4406, lng: -79.9959 },
        'greensboro': { lat: 36.0726, lng: -79.7920 },
        'lincoln': { lat: 40.8136, lng: -96.7026 },
        'plano': { lat: 33.0198, lng: -96.6989 },
        'anchorage': { lat: 61.2181, lng: -149.9003 },
        'orlando': { lat: 28.5383, lng: -81.3792 }
      };

      const cityKey = location.toLowerCase().split(',')[0].trim();
      return cityCoords[cityKey] || null;
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  }

  private mapCategoriesToClassifications(categories: string[]): string[] {
    const mapping: Record<string, string[]> = {
      'music': ['Music'],
      'sports': ['Sports'],
      'art': ['Arts & Theatre'],
      'entertainment': ['Film', 'Miscellaneous'],
      'dancing': ['Music'], // Dance events are usually under music
      'drinks': ['Miscellaneous'],
      'restaurant': ['Miscellaneous'],
      'fastfood': ['Miscellaneous']
    };

    const classifications = new Set<string>();
    categories.forEach(category => {
      const mapped = mapping[category.toLowerCase()];
      if (mapped) {
        mapped.forEach(c => classifications.add(c));
      }
    });

    return Array.from(classifications);
  }

  private convertTicketmasterEvent(tmEvent: TicketmasterEvent, location: string): Event | null {
    try {
      // Get venue information
      const venue = tmEvent._embedded?.venues?.[0];
      const venueName = venue?.name || 'Venue TBA';
      const venueAddress = venue?.address?.line1 || '';
      const venueCity = venue?.city?.name || location.split(',')[0].trim();
      const venueState = venue?.state?.stateCode || 'CA';

      // Parse event timing
      const eventDate = new Date(
        tmEvent.dates.start.dateTime || 
        `${tmEvent.dates.start.localDate}T${tmEvent.dates.start.localTime || '19:00:00'}`
      );
      
      if (isNaN(eventDate.getTime())) {
        console.warn(`Invalid date for event ${tmEvent.name}, skipping`);
        return null;
      }

      const timeString = eventDate.toTimeString().slice(0, 5); // HH:MM format

      // Determine event name and structure
      let eventName = tmEvent.name;
      const attraction = tmEvent._embedded?.attractions?.[0];
      
      // For music events, try to get the artist name
      if (attraction && tmEvent.classifications?.[0]?.segment?.name === 'Music') {
        eventName = attraction.name;
      }

      // Parse pricing
      let price = 0;
      if (tmEvent.priceRanges && tmEvent.priceRanges.length > 0) {
        const priceRange = tmEvent.priceRanges[0];
        price = Math.round((priceRange.min || 0) * 100); // Convert to cents
      }

      // Parse categories based on classifications
      const categories = this.parseEventCategories(tmEvent.classifications);

      // Parse age requirements (Ticketmaster doesn't always provide this)
      const ageRequirement = this.parseAgeRequirement(tmEvent);

      // Get event image
      const imageUrl = this.getEventImage(tmEvent);

      // Generate ticket links
      const ticketLinks = this.generateTicketLinks(tmEvent);

      // Create event description
      const description = this.generateEventDescription(tmEvent, venueName);

      return {
        id: `tm-${tmEvent.id}`,
        name: eventName,
        description,
        venue: venueName,
        address: venueAddress,
        city: venueCity,
        state: venueState,
        startTime: timeString,
        endTime: null,
        price,
        ageRequirement,
        dressCode: null,
        categories,
        eventType: 'venue',
        privacy: 'public',
        hostId: 'ticketmaster',
        maxCapacity: null,
        currentAttendees: Math.floor(Math.random() * 200) + 50, // Simulated
        imageUrl,
        ticketLinks
      };
    } catch (error) {
      console.error('Error converting Ticketmaster event:', error);
      return null;
    }
  }

  private parseEventCategories(classifications?: TicketmasterEvent['classifications']): string[] {
    if (!classifications || classifications.length === 0) {
      return ['entertainment'];
    }

    const classification = classifications[0];
    const segment = classification.segment?.name?.toLowerCase();
    const genre = classification.genre?.name?.toLowerCase();

    const categories: string[] = [];

    switch (segment) {
      case 'music':
        categories.push('music');
        if (genre?.includes('electronic') || genre?.includes('dance') || genre?.includes('house')) {
          categories.push('dancing');
        }
        break;
      case 'sports':
        categories.push('sports');
        break;
      case 'arts & theatre':
      case 'theatre':
        categories.push('art', 'entertainment');
        break;
      case 'film':
        categories.push('entertainment');
        break;
      default:
        categories.push('entertainment');
    }

    return categories.length > 0 ? categories : ['entertainment'];
  }

  private parseAgeRequirement(tmEvent: TicketmasterEvent): string {
    // Ticketmaster doesn't consistently provide age requirements
    // We'll use some heuristics based on event type and venue
    const classifications = tmEvent.classifications;
    if (!classifications || classifications.length === 0) {
      return 'all';
    }

    const segment = classifications[0].segment?.name?.toLowerCase();
    const genre = classifications[0].genre?.name?.toLowerCase();

    // Certain genres typically have age restrictions
    if (genre?.includes('electronic') || genre?.includes('dance') || genre?.includes('house')) {
      return '21'; // Most electronic/dance venues are 21+
    }

    if (segment === 'music' && (genre?.includes('rock') || genre?.includes('metal'))) {
      return '18'; // Rock/metal shows often 18+
    }

    // Default to all ages for most events
    return 'all';
  }

  private getEventImage(tmEvent: TicketmasterEvent): string {
    // Try to get the best quality image
    if (tmEvent.images && tmEvent.images.length > 0) {
      // Sort by size and get the largest one
      const sortedImages = tmEvent.images
        .filter(img => img.width && img.height)
        .sort((a, b) => (b.width * b.height) - (a.width * a.height));
      
      if (sortedImages.length > 0) {
        return sortedImages[0].url;
      }
    }

    // Try attraction images
    if (tmEvent._embedded?.attractions?.[0]?.images) {
      const attractionImages = tmEvent._embedded.attractions[0].images;
      const sortedImages = attractionImages
        .filter(img => img.width && img.height)
        .sort((a, b) => (b.width * b.height) - (a.width * a.height));
      
      if (sortedImages.length > 0) {
        return sortedImages[0].url;
      }
    }

    // Try venue images
    if (tmEvent._embedded?.venues?.[0]?.images) {
      const venueImages = tmEvent._embedded.venues[0].images;
      const sortedImages = venueImages
        .filter(img => img.width && img.height)
        .sort((a, b) => (b.width * b.height) - (a.width * a.height));
      
      if (sortedImages.length > 0) {
        return sortedImages[0].url;
      }
    }

    // Default image based on event type
    const classification = tmEvent.classifications?.[0]?.segment?.name?.toLowerCase();
    const defaultImages: Record<string, string> = {
      'music': 'https://images.unsplash.com/photo-1493225457124-a3fdf6b4b5f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240',
      'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240',
      'arts & theatre': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240',
      'film': 'https://images.unsplash.com/photo-1489599136344-9d1b4ac2ebb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240'
    };

    return defaultImages[classification || 'music'] || defaultImages.music;
  }

  private generateTicketLinks(tmEvent: TicketmasterEvent): Record<string, string> {
    const links: Record<string, string> = {};

    // Primary Ticketmaster link
    if (tmEvent.url) {
      links.ticketmaster = tmEvent.url;
    }

    // Generate additional links for popular venues/events
    // In a production app, you might have partnerships with other ticketing services
    if (Math.random() > 0.7) { // 30% chance of StubHub link
      const eventSlug = tmEvent.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      links.stubhub = `https://stubhub.com/event/${eventSlug}-tickets`;
    }

    if (Math.random() > 0.8) { // 20% chance of SeatGeek link
      const eventSlug = tmEvent.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      links.seatgeek = `https://seatgeek.com/event/${eventSlug}-tickets`;
    }

    return links;
  }

  private generateEventDescription(tmEvent: TicketmasterEvent, venueName: string): string {
    const classification = tmEvent.classifications?.[0];
    const segment = classification?.segment?.name || 'Event';
    const genre = classification?.genre?.name;

    let description = `${segment}`;
    if (genre) {
      description += ` - ${genre}`;
    }
    description += ` at ${venueName}`;

    // Add any additional info from the event
    if (tmEvent.info) {
      description += `. ${tmEvent.info.substring(0, 150)}`;
      if (tmEvent.info.length > 150) {
        description += '...';
      }
    } else if (tmEvent.pleaseNote) {
      description += `. ${tmEvent.pleaseNote.substring(0, 150)}`;
      if (tmEvent.pleaseNote.length > 150) {
        description += '...';
      }
    }

    // Add pricing info if available
    if (tmEvent.priceRanges && tmEvent.priceRanges.length > 0) {
      const priceRange = tmEvent.priceRanges[0];
      if (priceRange.min !== undefined && priceRange.max !== undefined) {
        description += ` Tickets from $${priceRange.min} - $${priceRange.max}.`;
      } else if (priceRange.min !== undefined) {
        description += ` Tickets from $${priceRange.min}.`;
      }
    }

    return description;
  }
}