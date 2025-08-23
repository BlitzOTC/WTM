import { type Event } from "../shared/schema";

export interface RealEventAPI {
  searchEvents(location: string, lat: number, lng: number): Promise<Event[]>;
}

// Ticketmaster Discovery API integration for real events
export class TicketmasterAPI implements RealEventAPI {
  private apiKey: string;
  private baseUrl = 'https://app.ticketmaster.com/discovery/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchEvents(location: string, lat: number, lng: number): Promise<Event[]> {
    try {
      console.log(`Searching Ticketmaster for real events near ${lat}, ${lng}`);
      
      const response = await fetch(
        `${this.baseUrl}/events.json?apikey=${this.apiKey}&latlong=${lat},${lng}&radius=25&unit=miles&size=20&sort=date,asc&classificationName=music,sports,arts,film,miscellaneous`
      );
      
      if (!response.ok) {
        console.error('Ticketmaster API error:', response.status, response.statusText);
        return [];
      }
      
      const data = await response.json();
      
      if (!data._embedded?.events) {
        console.log('No events found in Ticketmaster response');
        return [];
      }
      
      return data._embedded.events.map((event: any) => this.convertTicketmasterEvent(event, location));
    } catch (error) {
      console.error('Error fetching from Ticketmaster:', error);
      return [];
    }
  }

  private convertTicketmasterEvent(tmEvent: any, location: string): Event {
    // Parse venue information
    const venue = tmEvent._embedded?.venues?.[0];
    const venueName = venue?.name || 'Venue TBA';
    
    // Parse event details
    const eventName = tmEvent.name;
    const eventDate = new Date(tmEvent.dates.start.dateTime || tmEvent.dates.start.localDate);
    const timeString = eventDate.toTimeString().slice(0, 5); // HH:MM format
    
    // Determine event structure based on type
    let mainTitle: string;
    let subTitle: string;
    
    if (tmEvent.classifications?.[0]?.segment?.name === 'Sports') {
      // Sports event: Team/Game name as main title, venue as subtitle
      mainTitle = eventName;
      subTitle = venueName;
    } else if (tmEvent.classifications?.[0]?.segment?.name === 'Music') {
      // Concert: Artist name as main title, venue as subtitle
      const artist = tmEvent._embedded?.attractions?.[0]?.name || eventName;
      mainTitle = artist;
      subTitle = venueName;
    } else {
      // Other events: Event name as main title, venue as subtitle
      mainTitle = eventName;
      subTitle = venueName;
    }
    
    // Parse pricing
    let price = 0;
    if (tmEvent.priceRanges?.[0]?.min) {
      price = Math.round(tmEvent.priceRanges[0].min * 100); // Convert to cents
    }
    
    // Parse categories
    const categories = this.parseCategories(tmEvent.classifications);
    
    // Parse age requirements
    const ageRequirement = this.parseAgeRequirement(tmEvent);
    
    return {
      id: tmEvent.id,
      name: mainTitle,
      description: this.generateEventDescription(tmEvent, venueName),
      venue: subTitle,
      address: venue?.address?.line1 || '',
      city: venue?.city?.name || location.split(',')[0],
      startTime: timeString,
      price: price,
      categories: categories,
      ageRequirement: ageRequirement,
      capacity: venue?.boxOfficeInfo?.phoneNumberDetail || 'N/A',
      attendees: Math.floor(Math.random() * 100) + 50, // Real attendee data not available
      imageUrl: tmEvent.images?.[0]?.url || `https://images.unsplash.com/photo-1493225457124?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240`,
      ticketLinks: {
        ticketmaster: tmEvent.url
      },
      rating: 4.5 // Default rating since Ticketmaster doesn't provide ratings
    } as Event;
  }

  private parseCategories(classifications: any[]): string[] {
    if (!classifications?.length) return ['entertainment'];
    
    const segment = classifications[0]?.segment?.name?.toLowerCase();
    const genre = classifications[0]?.genre?.name?.toLowerCase();
    
    const categories: string[] = [];
    
    if (segment === 'music') {
      categories.push('music');
      if (genre?.includes('electronic') || genre?.includes('dance')) {
        categories.push('dancing');
      }
    } else if (segment === 'sports') {
      categories.push('sports');
    } else if (segment === 'arts' || segment === 'theatre') {
      categories.push('entertainment');
    } else {
      categories.push('entertainment');
    }
    
    return categories;
  }

  private parseAgeRequirement(event: any): string {
    const ageRestrictions = event.ageRestrictions;
    if (!ageRestrictions) return 'all';
    
    if (ageRestrictions.legalAgeEnforced) return '18';
    if (ageRestrictions.alcoholAgeEnforced) return '21';
    
    return 'all';
  }

  private generateEventDescription(event: any, venueName: string): string {
    const eventType = event.classifications?.[0]?.segment?.name || 'Event';
    const genre = event.classifications?.[0]?.genre?.name || '';
    
    let description = `${eventType}`;
    if (genre) description += ` - ${genre}`;
    description += ` at ${venueName}`;
    
    if (event.info) {
      description += `. ${event.info.substring(0, 200)}`;
    }
    
    return description;
  }
}

// Eventbrite API integration for real events
export class EventbriteAPI implements RealEventAPI {
  private apiKey: string;
  private baseUrl = 'https://www.eventbriteapi.com/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchEvents(location: string, lat: number, lng: number): Promise<Event[]> {
    try {
      console.log(`Searching Eventbrite for real events near ${lat}, ${lng}`);
      
      const response = await fetch(
        `${this.baseUrl}/events/search/?location.latitude=${lat}&location.longitude=${lng}&location.within=25mi&expand=venue,organizer&token=${this.apiKey}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          }
        }
      );
      
      if (!response.ok) {
        console.error('Eventbrite API error:', response.status, response.statusText);
        return [];
      }
      
      const data = await response.json();
      
      if (!data.events?.length) {
        console.log('No events found in Eventbrite response');
        return [];
      }
      
      return data.events.map((event: any) => this.convertEventbriteEvent(event, location));
    } catch (error) {
      console.error('Error fetching from Eventbrite:', error);
      return [];
    }
  }

  private convertEventbriteEvent(ebEvent: any, location: string): Event {
    // Parse venue information
    const venue = ebEvent.venue;
    const venueName = venue?.name || 'Venue TBA';
    
    // Parse event details
    const eventName = ebEvent.name.text;
    const eventDate = new Date(ebEvent.start.local);
    const timeString = eventDate.toTimeString().slice(0, 5);
    
    // For most Eventbrite events, use event name as main title, venue as subtitle
    const mainTitle = eventName;
    const subTitle = venueName;
    
    // Parse pricing
    let price = 0;
    if (ebEvent.ticket_availability?.minimum_ticket_price) {
      price = Math.round(ebEvent.ticket_availability.minimum_ticket_price.value);
    }
    
    return {
      id: ebEvent.id,
      name: mainTitle,
      description: ebEvent.description?.text?.substring(0, 200) || `Event at ${venueName}`,
      venue: subTitle,
      address: venue?.address?.localized_address_display || '',
      city: venue?.address?.city || location.split(',')[0],
      startTime: timeString,
      price: price,
      categories: ['entertainment'], // Eventbrite doesn't provide detailed categories
      ageRequirement: 'all',
      capacity: ebEvent.capacity || 'N/A',
      attendees: Math.floor(Math.random() * 100) + 20,
      imageUrl: ebEvent.logo?.url || `https://images.unsplash.com/photo-1540575467?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240`,
      ticketLinks: {
        eventbrite: ebEvent.url
      },
      rating: 4.2
    } as Event;
  }
}

export class RealEventAggregator {
  private apis: RealEventAPI[] = [];

  addAPI(api: RealEventAPI) {
    this.apis.push(api);
  }

  async searchAllEvents(location: string, lat: number, lng: number): Promise<Event[]> {
    const allEvents: Event[] = [];
    
    for (const api of this.apis) {
      try {
        const events = await api.searchEvents(location, lat, lng);
        allEvents.push(...events);
      } catch (error) {
        console.error('Error from event API:', error);
        // Continue with other APIs
      }
    }
    
    // Sort by start time
    return allEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
}