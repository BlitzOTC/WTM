import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertNightPlanSchema, type Event } from "@shared/schema";
import { z } from "zod";
import GooglePlacesService from "./google-places";
import { EnhancedVenueEventGenerator } from "./real-events";

// Generate location-specific events based on the search location
function generateLocationBasedEvents(location: string): Event[] {
  const cityName = location.split(',')[0].trim();
  const eventCategories = ['music', 'fastfood', 'restaurant', 'drinks', 'dancing', 'entertainment', 'sports', 'art'];
  const ageRequirements = ['18', '21', 'all'];
  
  const venueTypes = [
    { type: 'bar', categories: ['drinks', 'music'] },
    { type: 'restaurant', categories: ['restaurant', 'drinks'] },
    { type: 'club', categories: ['dancing', 'music'] },
    { type: 'theater', categories: ['entertainment'] },
    { type: 'pub', categories: ['restaurant', 'drinks', 'entertainment'] },
    { type: 'lounge', categories: ['drinks', 'music'] },
    { type: 'cafe', categories: ['fastfood'] },
    { type: 'arena', categories: ['sports', 'entertainment'] },
    { type: 'gallery', categories: ['art'] },
    { type: 'museum', categories: ['art'] }
  ];

  const events: Event[] = [];
  
  for (let i = 0; i < 12; i++) {
    const venueType = venueTypes[i % venueTypes.length];
    const now = new Date();
    const eventStart = new Date(now);
    eventStart.setHours(18 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60));
    
    const timeString = `${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}`;
    const price = Math.random() < 0.2 ? 0 : Math.floor(Math.random() * 5000) + 500; // $5-55 or free
    
    events.push({
      id: `${location.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}-${i}`,
      name: `${getEventName(venueType.type)} in ${cityName}`,
      description: `Join us for an amazing ${venueType.categories.join(' and ')} experience in ${cityName}. This authentic local venue offers the perfect atmosphere for a memorable night out.`,
      venue: `${getVenueName(venueType.type, cityName)}`,
      address: `${Math.floor(Math.random() * 999) + 100} ${getStreetName()} ${getStreetType()}`,
      city: cityName,
      state: 'CA',
      startTime: timeString,
      endTime: `${(eventStart.getHours() + 3) % 24}:${eventStart.getMinutes().toString().padStart(2, '0')}`,
      price: price,
      ageRequirement: ageRequirements[Math.floor(Math.random() * ageRequirements.length)],
      dressCode: null,
      categories: venueType.categories,
      eventType: 'venue',
      privacy: 'public',
      hostId: 'system',
      maxCapacity: Math.floor(Math.random() * 200) + 50,
      currentAttendees: Math.floor(Math.random() * 150) + 10,
      imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240`,
      ticketLinks: {}
    } as Event);
  }
  
  return events;
}

function getEventName(venueType: string): string {
  const eventNames: Record<string, string[]> = {
    bar: ['Happy Hour', 'Craft Beer Tasting', 'Mixology Class', 'Spirits Tasting', 'Wine Flight', 'Industry Night'],
    restaurant: ['Chef\'s Tasting Menu', 'Wine Pairing Dinner', 'Guest Chef Takeover', 'Seasonal Menu', 'Cooking Class', 'Bottomless Brunch'],
    club: ['DJ Night', '\'80s Night', '\'90s Night', 'Silent Disco', 'Foam Party', 'Dance Battle', 'Hip-Hop Night'],
    theater: ['Theater Performance', 'Musical Theater', 'Comedy Show', 'Improv Show', 'Magic Show', 'Variety Show'],
    pub: ['Trivia Night', 'Sports Watch Party', 'Karaoke Night', 'Pool Tournament', 'Darts Tournament', 'Poker Night'],
    lounge: ['Happy Hour', 'Rooftop Bar Night', 'Jazz Night', 'Acoustic Set', 'Wine Tasting', 'Cocktail Menu Launch'],
    cafe: ['Open Mic Night', 'Poetry Reading', 'BOGO Night', 'Late-Night Menu', 'Pop-up Kitchen', 'Limited-Time Menu'],
    arena: ['Stadium Concert', 'Sports Watch Party', 'Music Festival', 'Esports Tournament', 'Boxing Match', 'UFC Night'],
    gallery: ['Art Exhibition', 'Gallery Opening', 'Photography Show', 'Artist Talk', 'Art Workshop', 'Cultural Festival'],
    museum: ['Museum Late Night', 'Curator Tour', 'History Tour', 'Art Workshop', 'Academic Lecture', 'Cultural Festival']
  };
  
  const names = eventNames[venueType] || ['Special Event'];
  return names[Math.floor(Math.random() * names.length)];
}

function getVenueName(venueType: string, cityName: string): string {
  const prefixes = ['The', 'Blue', 'Red', 'Golden', 'Silver', 'Downtown', 'Uptown', 'Central'];
  const suffixes = ['Spot', 'Place', 'House', 'Room', 'Corner', 'Garden', 'Hall', 'Studio'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${cityName} ${suffix}`;
}

function getStreetName(): string {
  const names = ['Main', 'Broadway', 'Park', 'Oak', 'Pine', 'Cedar', 'Maple', 'Elm', 'First', 'Second', 'Third'];
  return names[Math.floor(Math.random() * names.length)];
}

function getStreetType(): string {
  const types = ['Street', 'Avenue', 'Boulevard', 'Drive', 'Lane', 'Way', 'Road'];
  return types[Math.floor(Math.random() * types.length)];
}

async function generateSampleMenu(venueId: string) {
  // First try to get real venue information from Google Places
  const googleApiKey = process.env.GOOGLE_API_KEY;
  let venueName = 'Restaurant';
  let venueAddress = '123 Main Street';
  
  if (googleApiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${venueId}&fields=name,formatted_address,types&key=${googleApiKey}`
      );
      const data = await response.json();
      
      if (data.result) {
        venueName = data.result.name || 'Restaurant';
        venueAddress = data.result.formatted_address || '123 Main Street';
      }
    } catch (error) {
      console.error('Error fetching venue details:', error);
    }
  }
  
  const appetizers = [
    { id: '1', name: 'Loaded Nachos', description: 'Crispy tortilla chips with cheese, jalapeños, and sour cream', price: 1299, category: 'Appetizers' },
    { id: '2', name: 'Buffalo Wings', description: 'Classic buffalo wings with celery and ranch dipping sauce', price: 1499, category: 'Appetizers' },
    { id: '3', name: 'Spinach Artichoke Dip', description: 'Warm creamy dip served with tortilla chips', price: 1199, category: 'Appetizers' }
  ];

  const mains = [
    // Generate restaurant-specific menu items based on venue name
    ...generateRestaurantSpecificMenu(venueName)
  ];

  const drinks = [
    { id: '8', name: 'Craft Beer Selection', description: 'Local craft beers on tap', price: 699, category: 'Beverages' },
    { id: '9', name: 'House Wine', description: 'Red or white wine by the glass', price: 899, category: 'Beverages' },
    { id: '10', name: 'Signature Cocktails', description: 'Bartender\'s special cocktail creations', price: 1299, category: 'Beverages' }
  ];

  const desserts = [
    { id: '11', name: 'Chocolate Cake', description: 'Rich chocolate layer cake with vanilla ice cream', price: 899, category: 'Desserts' },
    { id: '12', name: 'Cheesecake', description: 'New York style cheesecake with berry compote', price: 799, category: 'Desserts' }
  ];

  return {
    venueName: venueName,
    venueType: 'Restaurant',
    address: venueAddress,
    menuItems: [...appetizers, ...mains, ...drinks, ...desserts]
  };
}

function generateRestaurantSpecificMenu(venueName: string) {
  // Generate menu items based on the actual restaurant name using real menu data
  if (venueName.toLowerCase().includes('cheesecake')) {
    return [
      { id: '4', name: 'Factory Nachos', description: 'Crispy tortilla chips with melted cheese, guacamole, salsa and sour cream', price: 1795, category: 'Main Courses' },
      { id: '5', name: 'Chicken Madeira', description: 'Sautéed chicken breast with asparagus and mozzarella in Madeira wine sauce', price: 2595, category: 'Main Courses' },
      { id: '6', name: 'Pasta Carbonara', description: 'Spaghetti with chicken, bacon, roasted peppers in parmesan cream sauce', price: 2295, category: 'Main Courses' },
      { id: '7', name: 'Shepherd\'s Pie', description: 'Ground beef with onions, carrots, peas and corn in gravy topped with mashed potatoes', price: 2195, category: 'Main Courses' }
    ];
  } else if (venueName.toLowerCase().includes('olive garden')) {
    return [
      { id: '4', name: 'Fettuccine Alfredo', description: 'Creamy homemade alfredo sauce over fettuccine pasta', price: 1699, category: 'Main Courses' },
      { id: '5', name: 'Chicken Parmigiana', description: 'Lightly breaded chicken breast with marinara sauce and mozzarella', price: 2099, category: 'Main Courses' },
      { id: '6', name: 'Lasagna Classico', description: 'Layers of pasta, meat sauce and mozzarella, ricotta, parmesan and romano cheese', price: 1899, category: 'Main Courses' },
      { id: '7', name: 'Tour of Italy', description: 'Chicken Parmigiana, Lasagna Classico and Fettuccine Alfredo', price: 2299, category: 'Main Courses' }
    ];
  } else if (venueName.toLowerCase().includes('red lobster')) {
    return [
      { id: '4', name: 'Ultimate Feast', description: 'Maine lobster tail, garlic shrimp scampi, Walt\'s favorite shrimp and langostino lobster-and-crab stuffed mushrooms', price: 3799, category: 'Main Courses' },
      { id: '5', name: 'Lobster Linguini Alfredo', description: 'Roasted Maine and langostino lobster meat in creamy lobster alfredo sauce over linguini', price: 2999, category: 'Main Courses' },
      { id: '6', name: 'Admiral\'s Feast', description: 'Walt\'s favorite shrimp, bay scallops, clam strips and flounder stuffed with crabmeat stuffing', price: 2699, category: 'Main Courses' },
      { id: '7', name: 'Crab Linguini Alfredo', description: 'Sweet crab meat and tender shrimp in creamy alfredo sauce over linguini', price: 2599, category: 'Main Courses' }
    ];
  } else if (venueName.toLowerCase().includes('outback')) {
    return [
      { id: '4', name: 'Outback Special Sirloin', description: '9 oz center-cut sirloin seasoned and seared', price: 2299, category: 'Main Courses' },
      { id: '5', name: 'Baby Back Ribs', description: 'Tender ribs with signature BBQ sauce', price: 2799, category: 'Main Courses' },
      { id: '6', name: 'Alice Springs Chicken', description: 'Grilled chicken breast topped with honey mustard, mushrooms, bacon and cheese', price: 2199, category: 'Main Courses' },
      { id: '7', name: 'Bloomin\' Onion', description: 'Colossal onion, battered and deep-fried golden served with signature sauce', price: 1099, category: 'Appetizers' }
    ];
  } else if (venueName.toLowerCase().includes('applebee')) {
    return [
      { id: '4', name: 'Bourbon Street Chicken & Shrimp', description: 'Cajun-seasoned chicken and blackened shrimp in garlic butter with onions and mushrooms', price: 2199, category: 'Main Courses' },
      { id: '5', name: 'Fiesta Lime Chicken', description: 'Grilled chicken breast with mexi-ranch dressing, cheddar, salsa and tortilla strips', price: 1999, category: 'Main Courses' },
      { id: '6', name: 'Riblets Platter', description: 'Double-glazed baby back ribs with honey BBQ sauce', price: 1999, category: 'Main Courses' },
      { id: '7', name: 'Spinach & Artichoke Dip', description: 'A blend of spinach, artichoke and cream cheeses served warm with tortilla chips', price: 1199, category: 'Appetizers' }
    ];
  } else if (venueName.toLowerCase().includes('miller') || venueName.toLowerCase().includes('ale house')) {
    return [
      { id: '4', name: 'Zingers Buffalo Chicken Sandwich', description: 'Crispy buffalo chicken breast with lettuce, tomato and bleu cheese dressing', price: 1699, category: 'Main Courses' },
      { id: '5', name: 'Jack Daniel\'s Ribs', description: 'Full rack of ribs glazed with Jack Daniel\'s sauce', price: 2599, category: 'Main Courses' },
      { id: '6', name: 'Fish & Chips', description: 'Beer-battered cod with seasoned fries and coleslaw', price: 1899, category: 'Main Courses' },
      { id: '7', name: 'Chicken Wings', description: 'Traditional buffalo wings served with celery and bleu cheese', price: 1399, category: 'Appetizers' }
    ];
  } else if (venueName.toLowerCase().includes('chili') || venueName.toLowerCase().includes("chili's")) {
    return [
      { id: '4', name: 'Awesome Blossom Petals', description: 'Crispy onion strings served with creamy dipping sauce', price: 999, category: 'Appetizers' },
      { id: '5', name: 'Baby Back Ribs', description: 'Full rack with Chili\'s original BBQ sauce', price: 2299, category: 'Main Courses' },
      { id: '6', name: 'Cajun Chicken Pasta', description: 'Penne pasta with grilled cajun chicken in alfredo sauce', price: 1799, category: 'Main Courses' },
      { id: '7', name: 'Triple Dipper', description: 'Choose any 3 appetizers to share', price: 1599, category: 'Appetizers' }
    ];
  } else if (venueName.toLowerCase().includes('buffalo wild wings') || venueName.toLowerCase().includes('bdubs')) {
    return [
      { id: '4', name: 'Traditional Wings', description: 'Bone-in wings tossed in your favorite sauce', price: 1399, category: 'Main Courses' },
      { id: '5', name: 'Boneless Wings', description: 'All white meat chicken tossed in sauce', price: 1299, category: 'Main Courses' },
      { id: '6', name: 'Nashville Hot Tender Wraps', description: 'Crispy chicken tenders with Nashville hot sauce in a flour tortilla', price: 1199, category: 'Main Courses' },
      { id: '7', name: 'Loaded Nachos', description: 'Fresh tortilla chips loaded with cheese, jalapeños and your choice of protein', price: 1099, category: 'Appetizers' }
    ];
  } else {
    return [
      { id: '4', name: 'House Specialty', description: 'Chef\'s signature dish prepared with seasonal ingredients', price: 2299, category: 'Main Courses' },
      { id: '5', name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with lemon herb butter and seasonal vegetables', price: 2599, category: 'Main Courses' },
      { id: '6', name: 'Classic Burger', description: 'Angus beef patty with lettuce, tomato, onion and fries', price: 1699, category: 'Main Courses' },
      { id: '7', name: 'Chicken Caesar Salad', description: 'Grilled chicken over romaine with parmesan, croutons and Caesar dressing', price: 1599, category: 'Main Courses' }
    ];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get menu for a specific venue
  app.get('/api/menu/:venueId', async (req, res) => {
    try {
      const { venueId } = req.params;
      console.log(`Fetching menu for venue: ${venueId}`);

      // Generate sample menu data based on venue
      const menuData = await generateSampleMenu(venueId);
      res.json(menuData);
    } catch (error) {
      console.error('Error fetching menu:', error);
      res.status(500).json({ error: 'Failed to fetch menu' });
    }
  });

  // Featured events endpoint based on user interests with pagination
  app.get('/api/events/featured', async (req, res) => {
    try {
      const interests = req.query.interests as string;
      const location = req.query.location as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      
      // Validate required parameters
      if (!interests) {
        return res.status(400).json({ error: 'interests parameter is required' });
      }
      if (!location) {
        return res.status(400).json({ error: 'location parameter is required' });
      }

      let interestsArray: string[];
      try {
        interestsArray = JSON.parse(interests) as string[];
        if (!Array.isArray(interestsArray) || interestsArray.length === 0) {
          return res.status(400).json({ error: 'interests must be a non-empty array' });
        }
      } catch (parseError) {
        return res.status(400).json({ error: 'Invalid interests format - must be valid JSON array' });
      }
      
      // Map onboarding interests to our event categories
      const categoryMapping: Record<string, string[]> = {
        'music': ['music'],
        'food': ['fastfood', 'restaurant'],
        'drinks': ['drinks'],
        'sports': ['sports'],
        'culture': ['art'],
        'networking': ['entertainment'],
        'gaming': ['sports', 'entertainment'],
        'events': ['entertainment']
      };

      // Get categories based on user interests
      const userCategories = interestsArray.flatMap(interest => categoryMapping[interest] || []);
      
      if (userCategories.length === 0) {
        return res.status(400).json({ error: 'No valid categories found for provided interests' });
      }
      
      // Generate a mix of events from different categories the user likes
      let allEvents: Event[] = [];
      
      // Try Google Places first if we have real location data
      try {
        const googleApiKey = process.env.GOOGLE_API_KEY;
        if (googleApiKey) {
          const googlePlaces = new GooglePlacesService(googleApiKey);
          const googleEvents = await googlePlaces.searchEvents(location);
          allEvents = [...allEvents, ...googleEvents];
        }
      } catch (error) {
        console.log('Google Places not available, using fallback events');
      }
      
      // Always add synthetic events to ensure we have enough for pagination
      // Generate multiple batches to have plenty of events
      for (let batch = 0; batch < 5; batch++) {
        const syntheticEvents = generateLocationBasedEvents(location);
        // Add batch number to make events unique across batches
        const batchEvents = syntheticEvents.map(event => ({
          ...event,
          id: `${event.id}-batch${batch}`,
          name: batch > 0 ? `${event.name} (${batch + 1})` : event.name
        }));
        allEvents = [...allEvents, ...batchEvents];
      }
      
      // Filter events based on user's interested categories
      const matchingEvents = allEvents.filter(event => {
        const eventCategories = Array.isArray(event.categories) ? event.categories : [];
        return eventCategories.some(category => userCategories.includes(category));
      });
      
      // Rank events by how many of user's categories they match
      const rankedEvents = matchingEvents.map(event => {
        const eventCategories = Array.isArray(event.categories) ? event.categories : [];
        const matchCount = eventCategories.filter(category => userCategories.includes(category)).length;
        return { event, matchCount };
      });
      
      // Sort by match count (descending) and then by variety
      rankedEvents.sort((a, b) => {
        if (b.matchCount !== a.matchCount) {
          return b.matchCount - a.matchCount;
        }
        // Secondary sort by name for consistency
        return a.event.name.localeCompare(b.event.name);
      });
      
      // Ensure variety across categories by selecting best from each category, then fill with remaining
      const featuredEvents: Event[] = [];
      const usedCategories = new Set<string>();
      
      // First pass: get events from each user category to ensure variety
      for (const category of userCategories) {
        const eventsForCategory = rankedEvents.filter(({ event }) => {
          const eventCategories = Array.isArray(event.categories) ? event.categories : [];
          return eventCategories.includes(category) && 
                 !featuredEvents.some(fe => fe.id === event.id);
        });
        
        // Add up to 3 events per category to ensure variety
        for (let i = 0; i < Math.min(3, eventsForCategory.length); i++) {
          featuredEvents.push(eventsForCategory[i].event);
        }
        usedCategories.add(category);
      }
      
      // Second pass: fill with all remaining ranked events
      for (const { event } of rankedEvents) {
        if (!featuredEvents.some(fe => fe.id === event.id)) {
          featuredEvents.push(event);
        }
      }
      
      // Remove duplicates by venue and name
      const uniqueEvents = featuredEvents.filter((event, index, self) => 
        index === self.findIndex(e => e.name === event.name && e.venue === event.venue)
      );
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEvents = uniqueEvents.slice(startIndex, endIndex);
      
      // Check if there are more events available
      const hasMore = uniqueEvents.length > endIndex;
      
      console.log(`Returning ${paginatedEvents.length} featured events (page ${page}) for interests: ${interestsArray.join(', ')} in ${location}`);
      res.json({
        events: paginatedEvents,
        hasMore: hasMore,
        page: page,
        totalCount: uniqueEvents.length
      });
    } catch (error) {
      console.error('Error fetching featured events:', error);
      res.status(500).json({ error: 'Failed to fetch featured events' });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const { city, state, categories, ageRequirement, maxPrice, minPrice, eventType, location } = req.query;
      
      // If Google API key is available and location is provided, fetch real events
      const googleApiKey = process.env.GOOGLE_API_KEY;
      if (googleApiKey && location) {
        try {
          console.log(`Fetching real events for location: ${location}`);
          const googlePlaces = new GooglePlacesService(googleApiKey);
          const realEvents = await googlePlaces.searchEvents(location as string);
          
          // Use enhanced venue-based events with real venue names
          const locationBasedEvents = realEvents.length > 0 ? realEvents : 
            EnhancedVenueEventGenerator.generateRealEvents(location as string);
          
          // Apply filters to events
          let filteredEvents = locationBasedEvents;
          
          if (categories) {
            const categoryArray = typeof categories === 'string' ? [categories] : categories as string[];
            filteredEvents = filteredEvents.filter(event => {
              const eventCategories = Array.isArray(event.categories) ? event.categories : [];
              return categoryArray.some(cat => eventCategories.includes(cat));
            });
          }
          
          if (ageRequirement && ageRequirement !== 'all') {
            filteredEvents = filteredEvents.filter(event => 
              event.ageRequirement === ageRequirement || event.ageRequirement === 'all'
            );
          }
          
          if (maxPrice) {
            const maxPriceCents = parseFloat(maxPrice as string) * 100;
            filteredEvents = filteredEvents.filter(event => event.price <= maxPriceCents);
          }
          
          if (minPrice) {
            const minPriceCents = parseFloat(minPrice as string) * 100;
            filteredEvents = filteredEvents.filter(event => event.price >= minPriceCents);
          }
          
          console.log(`Returning ${filteredEvents.length} filtered events for ${location}`);
          return res.json(filteredEvents);
        } catch (error) {
          console.error("Error generating location-based events:", error);
          // Continue to fallback storage events below
        }
      }
      
      // Fallback to storage events (existing functionality)
      const filters: any = {};
      if (city) filters.city = city as string;
      if (state) filters.state = state as string;
      if (categories) {
        filters.categories = typeof categories === 'string' ? [categories] : categories as string[];
      }
      if (ageRequirement) filters.ageRequirement = ageRequirement as string;
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (eventType) filters.eventType = eventType as string;

      const events = await storage.getEvents(filters);
      res.json(events);
    } catch (error) {
      console.error("Events API error:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(req.params.id, validatedData);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Night plan routes
  app.get("/api/night-plans/:userId", async (req, res) => {
    try {
      const nightPlan = await storage.getNightPlan(req.params.userId);
      if (!nightPlan) {
        return res.status(404).json({ message: "Night plan not found" });
      }
      res.json(nightPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch night plan" });
    }
  });

  app.post("/api/night-plans", async (req, res) => {
    try {
      const validatedData = insertNightPlanSchema.parse(req.body);
      const nightPlan = await storage.createNightPlan(validatedData);
      res.status(201).json(nightPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid night plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create night plan" });
    }
  });

  app.put("/api/night-plans/:userId", async (req, res) => {
    try {
      const validatedData = insertNightPlanSchema.partial().parse(req.body);
      const nightPlan = await storage.updateNightPlan(req.params.userId, validatedData);
      if (!nightPlan) {
        return res.status(404).json({ message: "Night plan not found" });
      }
      res.json(nightPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid night plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update night plan" });
    }
  });

  // Google Places Autocomplete proxy endpoint
  app.get("/api/places/autocomplete", async (req, res) => {
    try {
      const { input } = req.query;
      const googleApiKey = process.env.GOOGLE_API_KEY;
      
      console.log("Google API Key exists:", !!googleApiKey);
      console.log("Input received:", input);
      
      if (!googleApiKey) {
        return res.status(500).json({ message: "Google API key not configured" });
      }
      
      if (!input || typeof input !== 'string') {
        return res.status(400).json({ message: "Input parameter is required" });
      }
      
      const response = await fetch(
        `https://places.googleapis.com/v1/places:autocomplete`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey
          },
          body: JSON.stringify({
            input: input,
            includedPrimaryTypes: ['locality', 'administrative_area_level_1'],
            languageCode: 'en'
          })
        }
      );
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Google API request failed" });
      }
      
      const data = await response.json();
      
      // Transform new API response to match old format for frontend compatibility
      const transformedData = {
        status: 'OK',
        predictions: data.suggestions?.map((suggestion: any) => ({
          place_id: suggestion.placePrediction?.placeId || suggestion.queryPrediction?.text,
          description: suggestion.placePrediction?.text?.text || suggestion.queryPrediction?.text,
          structured_formatting: {
            main_text: suggestion.placePrediction?.structuredFormat?.mainText?.text || suggestion.queryPrediction?.text?.split(',')[0] || '',
            secondary_text: suggestion.placePrediction?.structuredFormat?.secondaryText?.text || suggestion.queryPrediction?.text?.split(',').slice(1).join(',') || ''
          }
        })) || []
      };
      
      res.json(transformedData);
    } catch (error) {
      console.error("Places autocomplete error:", error);
      res.status(500).json({ message: "Failed to fetch place suggestions" });
    }
  });

  // Search by location
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      // Simple location parsing (city, state or just city)
      const [city, state] = q.split(',').map(s => s.trim());
      
      const events = await storage.getEvents({
        city: city,
        state: state || undefined
      });

      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
