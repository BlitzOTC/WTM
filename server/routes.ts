import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertNightPlanSchema } from "@shared/schema";
import { z } from "zod";
import GooglePlacesService from "./google-places";

export async function registerRoutes(app: Express): Promise<Server> {
  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const { city, state, categories, ageRequirement, maxPrice, minPrice, eventType, location } = req.query;
      
      // Generate location-based events using the provided location
      if (location) {
        try {
          console.log(`Generating events for location: ${location}`);
          const locationBasedEvents = generateLocationBasedEvents(location as string);
          
          // Apply filters to location-based events
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
