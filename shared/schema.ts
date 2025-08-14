import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  userType: text("user_type").notNull().default("user"), // "user" or "venue"
  venueName: text("venue_name"),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  venue: text("venue").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  price: integer("price").notNull().default(0), // in cents
  ageRequirement: text("age_requirement").notNull().default("all"), // "all", "18", "21"
  dressCode: text("dress_code"),
  categories: jsonb("categories").notNull().default("[]"), // array of strings
  eventType: text("event_type").notNull().default("venue"), // "venue" or "personal"
  privacy: text("privacy").default("public"), // "public", "friends", "invite"
  hostId: varchar("host_id").notNull(),
  maxCapacity: integer("max_capacity"),
  currentAttendees: integer("current_attendees").default(0),
  imageUrl: text("image_url"),
  ticketLinks: jsonb("ticket_links").default("{}"), // {ticketmaster: "", stubhub: "", seatgeek: ""}
});

export const nightPlans = pgTable("night_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  eventIds: jsonb("event_ids").notNull().default("[]"), // array of event ids
  totalBudget: integer("total_budget").default(0),
  optimizedRoute: jsonb("optimized_route").default("[]"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  currentAttendees: true,
}).extend({
  categories: z.array(z.string()).default([]),
  ticketLinks: z.object({
    ticketmaster: z.string().optional(),
    stubhub: z.string().optional(),
    seatgeek: z.string().optional(),
  }).optional(),
});

export const insertNightPlanSchema = createInsertSchema(nightPlans).omit({
  id: true,
}).extend({
  eventIds: z.array(z.string()).default([]),
  optimizedRoute: z.array(z.string()).default([]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertNightPlan = z.infer<typeof insertNightPlanSchema>;
export type NightPlan = typeof nightPlans.$inferSelect;
