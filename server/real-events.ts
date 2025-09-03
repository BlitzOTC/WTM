import { type Event } from "../shared/schema";

export interface RealEventSource {
  getEvents(location: string, lat: number, lng: number): Promise<Event[]>;
}

// Alternative approach: Use web scraping or other event APIs for real event data
export class EventbriteEventSource implements RealEventSource {
  async getEvents(location: string, lat: number, lng: number): Promise<Event[]> {
    // This would integrate with Eventbrite API for real events
    // For now, return empty array to indicate no real events available
    return [];
  }
}

export class TicketmasterEventSource implements RealEventSource {
  async getEvents(location: string, lat: number, lng: number): Promise<Event[]> {
    // This would integrate with Ticketmaster Discovery API for real events
    // For now, return empty array to indicate no real events available
    return [];
  }
}

// Enhanced venue-based event generator that creates more realistic events
export class EnhancedVenueEventGenerator {
  private static realVenueNames: Record<string, string[]> = {
    'orlando': [
      'Amway Center', 'House of Blues Orlando', 'The Social', 'Venue 578', 'Will\'s Pub',
      'Howl at the Moon', 'CityWalk\'s Rising Star', 'Hard Rock Live', 'Dr. Phillips Center',
      'Orlando Museum of Art', 'The Abbey', 'Tin Roof', 'Cowboys Orlando', 'Icebar Orlando'
    ],
    'new york': [
      'Madison Square Garden', 'Lincoln Center', 'Brooklyn Bowl', 'Webster Hall', 'Terminal 5',
      'Irving Plaza', 'Music Hall of Williamsburg', 'Le Poisson Rouge', 'The Bowery Ballroom',
      'Blue Note', 'Jazz Standard', 'Smalls Jazz Club', 'The Apollo Theater', 'Barclays Center'
    ],
    'los angeles': [
      'Hollywood Bowl', 'The Greek Theatre', 'The Troubadour', 'Whisky a Go Go', 'The Viper Room',
      'El Rey Theatre', 'The Fonda Theatre', 'The Wiltern', 'Microsoft Theater', 'Staples Center',
      'The Echo', 'Echoplex', 'The Mint', 'Largo at the Coronet', 'The Comedy Store'
    ],
    'miami': [
      'American Airlines Arena', 'Adrienne Arsht Center', 'Fillmore Miami Beach', 'The Fontainebleau',
      'LIV Miami', 'Story Nightclub', 'E11EVEN MIAMI', 'Club Space', 'Gramps', 'Ball & Chain',
      'The Anderson', 'Wynwood Walls', 'Revolution Live', 'Hard Rock Live Hollywood'
    ],
    'chicago': [
      'United Center', 'Chicago Theatre', 'Metro', 'Empty Bottle', 'Green Mill Cocktail Lounge',
      'House of Blues Chicago', 'Riviera Theatre', 'Aragon Ballroom', 'Lincoln Hall',
      'Schubas Tavern', 'Kingston Mines', 'Second City', 'Steppenwolf Theatre', 'Goodman Theatre'
    ]
  };

  private static realEventTypes: Record<string, string[]> = {
    'concert': ['Live Music Performance', 'Album Release Party', 'Acoustic Set', 'DJ Set', 'Music Festival'],
    'comedy': ['Stand-up Comedy Show', 'Comedy Open Mic', 'Improv Night', 'Comedy Special Taping'],
    'theater': ['Broadway Show', 'Play Performance', 'Musical Theater', 'Dance Performance'],
    'nightlife': ['Night Club Event', 'Rooftop Party', 'Happy Hour', 'Cocktail Class', 'Wine Tasting'],
    'food': ['Restaurant Week', 'Chef\'s Table', 'Food Festival', 'Cooking Class', 'Pop-up Dining'],
    'art': ['Art Gallery Opening', 'Museum Exhibition', 'Art Workshop', 'Artist Talk', 'Gallery Walk']
  };

  static generateRealEvents(location: string): Event[] {
    const cityKey = location.toLowerCase().split(',')[0].trim();
    const venues = this.realVenueNames[cityKey] || this.generateGenericVenues(location);
    const events: Event[] = [];

    for (let i = 0; i < Math.min(venues.length, 15); i++) {
      const venue = venues[i];
      const eventType = this.getRandomEventType();
      const eventName = this.generateEventName(eventType, venue);
      
      const now = new Date();
      const eventStart = new Date(now);
      eventStart.setHours(18 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60));
      
      const timeString = `${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}`;
      
      // More realistic pricing based on event type and venue
      const price = this.generateRealisticPrice(eventType, venue);
      
      events.push({
        id: `${cityKey.replace(/\s+/g, '')}-real-${i}`,
        name: eventName,
        description: this.generateEventDescription(eventType, venue, location),
        venue: venue,
        address: this.generateRealisticAddress(cityKey),
        city: location.split(',')[0].trim(),
        startTime: timeString,
        price: price,
        categories: this.getEventCategories(eventType),
        ageRequirement: this.getAgeRequirement(eventType),
        capacity: this.getVenueCapacity(venue),
        attendees: Math.floor(Math.random() * 200) + 20,
        imageUrl: this.getVenueImageUrl(venue, cityKey),
        ticketLinks: this.generateTicketLinks(venue, eventType),
        rating: Math.floor(Math.random() * 15) + 35 / 10 // 3.5-5.0 scale
      } as Event);
    }

    return events;
  }

  private static generateGenericVenues(location: string): string[] {
    const city = location.split(',')[0].trim();
    return [
      `${city} Arena`, `${city} Theater`, `${city} Music Hall`, `${city} Comedy Club`,
      `The ${city} Venue`, `${city} Cultural Center`, `${city} Auditorium`, `${city} Playhouse`
    ];
  }

  private static getRandomEventType(): string {
    const types = Object.keys(this.realEventTypes);
    return types[Math.floor(Math.random() * types.length)];
  }

  private static generateEventName(eventType: string, venue: string): string {
    const eventNames = this.realEventTypes[eventType] || ['Special Event'];
    const baseName = eventNames[Math.floor(Math.random() * eventNames.length)];
    
    // Add artist/performer names for more realism
    const performers = [
      'The Midnight', 'Local Artist Showcase', 'Rising Stars', 'Featured Artist',
      'Special Guest', 'Headline Act', 'Live Performance', 'Evening Show'
    ];
    
    if (eventType === 'concert') {
      const performer = performers[Math.floor(Math.random() * performers.length)];
      return `${performer} - ${baseName}`;
    }
    
    return baseName;
  }

  private static generateEventDescription(eventType: string, venue: string, location: string): string {
    const descriptions = {
      'concert': `Experience an unforgettable live music performance at ${venue}. Join us for an evening of incredible sounds and energy in the heart of ${location}.`,
      'comedy': `Get ready to laugh until your sides hurt at ${venue}'s comedy night. Featuring talented comedians and special guests.`,
      'theater': `Immerse yourself in a captivating theatrical experience at ${venue}. A must-see performance that will leave you spellbound.`,
      'nightlife': `Dance the night away at ${venue}. Premium drinks, great music, and an atmosphere you won't forget.`,
      'food': `Indulge in a culinary journey at ${venue}. Experience exceptional flavors and innovative cuisine.`,
      'art': `Discover stunning artistic expressions at ${venue}. An inspiring collection that celebrates creativity and culture.`
    };
    
    return descriptions[eventType] || `Join us for an amazing experience at ${venue} in ${location}.`;
  }

  private static generateRealisticPrice(eventType: string, venue: string): number {
    const priceRanges = {
      'concert': { min: 2500, max: 12000 }, // $25-120
      'comedy': { min: 1500, max: 5000 },   // $15-50
      'theater': { min: 3000, max: 15000 }, // $30-150
      'nightlife': { min: 0, max: 3000 },   // Free-$30
      'food': { min: 2000, max: 8000 },     // $20-80
      'art': { min: 0, max: 2500 }          // Free-$25
    };
    
    const range = priceRanges[eventType] || { min: 1000, max: 5000 };
    
    // Premium venues cost more
    const premiumVenues = ['Madison Square Garden', 'Hollywood Bowl', 'Lincoln Center'];
    const multiplier = premiumVenues.some(v => venue.includes(v)) ? 1.5 : 1;
    
    return Math.floor((Math.random() * (range.max - range.min) + range.min) * multiplier);
  }

  private static getEventCategories(eventType: string): string[] {
    const categoryMap = {
      'concert': ['music'],
      'comedy': ['entertainment'],
      'theater': ['entertainment'],
      'nightlife': ['drinks', 'dancing', 'music'],
      'food': ['food', 'drinks'],
      'art': ['entertainment']
    };
    
    return categoryMap[eventType] || ['entertainment'];
  }

  private static getAgeRequirement(eventType: string): string {
    if (eventType === 'nightlife') return '21';
    if (eventType === 'comedy') return '18';
    return 'all';
  }

  private static getVenueCapacity(venue: string): number {
    const largeVenues = ['Arena', 'Stadium', 'Center', 'Garden'];
    const isLarge = largeVenues.some(type => venue.includes(type));
    
    if (isLarge) return Math.floor(Math.random() * 15000) + 5000;
    return Math.floor(Math.random() * 500) + 100;
  }

  private static generateRealisticAddress(cityKey: string): string {
    const streetNumbers = Math.floor(Math.random() * 9999) + 1;
    const streetNames = ['Main St', 'Broadway', 'Park Ave', 'Center St', 'First Ave', 'Second St'];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    
    return `${streetNumbers} ${streetName}`;
  }

  private static getVenueImageUrl(venue: string, cityKey: string): string {
    // Return a more targeted image URL based on venue type
    const venueTypes = {
      'center': '1493225457124',    // Arena/Center venues
      'arena': '1493225457124',     // Sports/concert arenas  
      'theater': '1540575467',      // Theater venues
      'theatre': '1540575467',      // Alternative spelling
      'club': '1571019613454',      // Night clubs
      'pub': '1571019613454',       // Pubs and bars
      'bar': '1571019613454',       // Bars  
      'restaurant': '1517248135467', // Restaurants
      'museum': '1541888946425',    // Museums
      'gallery': '1541888946425',   // Art galleries
      'hall': '1566417713940',      // Music/event halls
      'house': '1566417713940',     // Music houses (House of Blues)
      'blues': '1566417713940',     // Blues venues
      'rock': '1566417713940',      // Rock venues
      'social': '1571019613454',    // Social venues/clubs
      'abbey': '1517248135467',     // Restaurant/bar venues
      'roof': '1571019613454',      // Rooftop venues
      'ice': '1571019613454'        // Ice bars/clubs
    };
    
    let imageId = '1500000000000';
    const venueLower = venue.toLowerCase();
    
    for (const [type, id] of Object.entries(venueTypes)) {
      if (venueLower.includes(type)) {
        imageId = id;
        break;
      }
    }
    
    return `https://images.unsplash.com/photo-${imageId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240`;
  }

  private static generateTicketLinks(venue: string, eventType?: string): Record<string, string> {
    const links: Record<string, string> = {};
    
    // Major venues typically have multiple ticket sources
    const majorVenues = ['Garden', 'Arena', 'Center', 'Bowl', 'Theater', 'Theatre'];
    const concertVenues = ['House of Blues', 'Blue Note', 'Whisky', 'Troubadour', 'Webster Hall'];
    const theaterVenues = ['Lincoln Center', 'Broadway', 'Playhouse', 'Dr. Phillips'];
    
    const isMajor = majorVenues.some(type => venue.includes(type));
    const isConcert = concertVenues.some(type => venue.includes(type)) || eventType === 'concert';
    const isTheater = theaterVenues.some(type => venue.includes(type)) || eventType === 'theater';
    
    // Add ticket links based on venue type and event type
    if (isMajor || isConcert || isTheater) {
      const venueSlug = venue.replace(/\s+/g, '-').toLowerCase();
      
      // Major venues get multiple ticket sources
      if (isMajor) {
        links.ticketmaster = `https://ticketmaster.com/venue/${venueSlug}`;
        links.stubhub = `https://stubhub.com/venue/${venueSlug}`;
        if (Math.random() > 0.5) { // 50% chance of SeatGeek
          links.seatgeek = `https://seatgeek.com/venues/${venueSlug}`;
        }
      }
      // Concert venues typically use Ticketmaster
      else if (isConcert) {
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
}