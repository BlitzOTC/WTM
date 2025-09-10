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
    bar: ['Live Jazz Night', 'Craft Beer Tasting', 'Happy Hour Special', 'Local Band Showcase'],
    restaurant: ['Wine Pairing Dinner', 'Chef\'s Special Menu', 'Culinary Experience', 'Farm-to-Table Night'],
    club: ['DJ Night', 'Dance Party', 'Electronic Music Night', 'Theme Party'],
    theater: ['Live Performance', 'Comedy Show', 'Musical Evening', 'Drama Night'],
    pub: ['Trivia Night', 'Sports Viewing Party', 'Karaoke Night', 'Live Music'],
    lounge: ['Cocktail Hour', 'Smooth Jazz Evening', 'Wine & Cheese Night', 'Acoustic Session'],
    cafe: ['Open Mic Night', 'Poetry Reading', 'Art Exhibition', 'Coffee Cupping'],
    arena: ['Concert', 'Sports Event', 'Festival', 'Live Show'],
    gallery: ['Art Gallery Opening', 'Contemporary Art Show', 'Photography Exhibition', 'Artist Showcase'],
    museum: ['Cultural Exhibition', 'History Display', 'Interactive Experience', 'Educational Tour']
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
            filteredEvents = filteredEvents.filter(event => 
              categoryArray.some(cat => event.categories.includes(cat))
            );
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
