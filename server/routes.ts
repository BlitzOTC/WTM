import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertNightPlanSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const { city, state, categories, ageRequirement, maxPrice, minPrice, eventType } = req.query;
      
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
