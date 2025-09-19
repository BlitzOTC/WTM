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
  privacy: text("privacy").default("public"), // "public", "private"
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
  groupId: varchar("group_id"), // nullable, links to groups table
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull(), // user id who created the group
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupMemberships = pgTable("group_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull().default("member"), // "admin", "member"
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const sharedPlans = pgTable("shared_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull(),
  userId: varchar("user_id").notNull(), // who shared the plan
  planData: jsonb("plan_data").notNull(), // the actual plan with events
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  createdAt: true,
  updatedAt: true,
}).extend({
  eventIds: z.array(z.string()).default([]),
  optimizedRoute: z.array(z.string()).default([]),
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupMembershipSchema = createInsertSchema(groupMemberships).omit({
  id: true,
  joinedAt: true,
});

export const insertSharedPlanSchema = createInsertSchema(sharedPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  planData: z.object({
    events: z.array(z.any()),
    totalBudget: z.number().optional(),
    name: z.string().optional(),
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertNightPlan = z.infer<typeof insertNightPlanSchema>;
export type NightPlan = typeof nightPlans.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroupMembership = z.infer<typeof insertGroupMembershipSchema>;
export type GroupMembership = typeof groupMemberships.$inferSelect;
export type InsertSharedPlan = z.infer<typeof insertSharedPlanSchema>;
export type SharedPlan = typeof sharedPlans.$inferSelect;
