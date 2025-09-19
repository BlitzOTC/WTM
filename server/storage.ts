import { type User, type InsertUser, type Event, type InsertEvent, type NightPlan, type InsertNightPlan, type Group, type InsertGroup, type GroupMembership, type InsertGroupMembership, type SharedPlan, type InsertSharedPlan } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Event methods
  getEvent(id: string): Promise<Event | undefined>;
  getEvents(filters?: {
    city?: string;
    state?: string;
    categories?: string[];
    ageRequirement?: string;
    maxPrice?: number;
    minPrice?: number;
    eventType?: string;
  }): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;

  // Night plan methods
  getNightPlan(userId: string): Promise<NightPlan | undefined>;
  createNightPlan(nightPlan: InsertNightPlan): Promise<NightPlan>;
  updateNightPlan(userId: string, nightPlan: Partial<InsertNightPlan>): Promise<NightPlan | undefined>;

  // Group methods
  getGroup(id: string): Promise<Group | undefined>;
  getUserGroups(userId: string): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  deleteGroup(id: string): Promise<boolean>;

  // Group membership methods
  getGroupMembers(groupId: string): Promise<(GroupMembership & { user: User })[]>;
  addGroupMember(membership: InsertGroupMembership): Promise<GroupMembership>;
  removeGroupMember(groupId: string, userId: string): Promise<boolean>;
  isGroupMember(groupId: string, userId: string): Promise<boolean>;

  // Shared plan methods
  getGroupSharedPlans(groupId: string): Promise<(SharedPlan & { user: User })[]>;
  createSharedPlan(sharedPlan: InsertSharedPlan): Promise<SharedPlan>;
  deleteSharedPlan(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, Event>;
  private nightPlans: Map<string, NightPlan>;
  private groups: Map<string, Group>;
  private groupMemberships: Map<string, GroupMembership>;
  private sharedPlans: Map<string, SharedPlan>;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.nightPlans = new Map();
    this.groups = new Map();
    this.groupMemberships = new Map();
    this.sharedPlans = new Map();
    this.seedData();
  }

  private seedData() {
    // Create sample users for friends
    const sampleUsers = [
      { id: "current-user-id", username: "you", password: "password", email: "you@example.com", userType: "user" },
      { id: "1", username: "alex_chen", password: "password", email: "alex@example.com", userType: "user" },
      { id: "2", username: "sarah_j", password: "password", email: "sarah@example.com", userType: "user" },
      { id: "3", username: "mike_wilson", password: "password", email: "mike@example.com", userType: "user" },
      { id: "4", username: "emma_davis", password: "password", email: "emma@example.com", userType: "user" },
      { id: "5", username: "david_kim", password: "password", email: "david@example.com", userType: "user" },
      { id: "6", username: "lisa_martin", password: "password", email: "lisa@example.com", userType: "user" },
    ];
    
    sampleUsers.forEach(user => {
      this.users.set(user.id, user as User);
    });
    
    // Create sample events for San Francisco
    const sampleEvents: Event[] = [
      {
        id: "1",
        name: "Rooftop Jazz Night",
        description: "Join us for an enchanting evening of smooth jazz under the stars with breathtaking city views.",
        venue: "The Skyline Lounge",
        address: "123 Downtown Street",
        city: "San Francisco",
        state: "CA",
        startTime: "19:00",
        endTime: "23:00",
        price: 2500, // $25.00
        ageRequirement: "21",
        dressCode: "Smart casual",
        categories: ["music", "drinks"],
        eventType: "venue",
        privacy: "public",
        hostId: "venue1",
        maxCapacity: 150,
        currentAttendees: 45,
        imageUrl: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240",
        ticketLinks: {
          ticketmaster: "https://ticketmaster.com/event/1",
          stubhub: "https://stubhub.com/event/1",
          seatgeek: "https://seatgeek.com/event/1"
        }
      },
      {
        id: "2",
        name: "80s Dance Night",
        description: "Dance the night away to the best hits from the 1980s with free entry!",
        venue: "Electric Avenue",
        address: "456 Club Row",
        city: "San Francisco",
        state: "CA",
        startTime: "21:00",
        endTime: "02:00",
        price: 0, // Free
        ageRequirement: "18",
        dressCode: null,
        categories: ["dancing", "music"],
        eventType: "venue",
        privacy: "public",
        hostId: "venue2",
        maxCapacity: 300,
        currentAttendees: 120,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240",
        ticketLinks: {}
      },
      {
        id: "3",
        name: "Comedy Open Mic",
        description: "Laugh until your sides hurt at our weekly comedy open mic night.",
        venue: "Laugh Track Lounge",
        address: "789 Comedy Lane",
        city: "San Francisco",
        state: "CA",
        startTime: "20:00",
        endTime: "23:30",
        price: 1500, // $15.00
        ageRequirement: "all",
        dressCode: null,
        categories: ["entertainment", "restaurant"],
        eventType: "venue",
        privacy: "public",
        hostId: "venue3",
        maxCapacity: 100,
        currentAttendees: 35,
        imageUrl: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240",
        ticketLinks: {}
      },
      {
        id: "4",
        name: "Indie Rock Showcase",
        description: "Discover the next big indie rock acts at our intimate venue.",
        venue: "The Underground",
        address: "321 Music Street",
        city: "San Francisco",
        state: "CA",
        startTime: "22:00",
        endTime: "01:00",
        price: 3500, // $35.00
        ageRequirement: "21",
        dressCode: null,
        categories: ["music"],
        eventType: "venue",
        privacy: "public",
        hostId: "venue4",
        maxCapacity: 200,
        currentAttendees: 180,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240",
        ticketLinks: {
          ticketmaster: "https://ticketmaster.com/event/4",
          stubhub: "https://stubhub.com/event/4"
        }
      },
      {
        id: "5",
        name: "Wine Tasting Night",
        description: "Sample exquisite wines paired with artisanal cheeses and charcuterie.",
        venue: "Vintage Cellar",
        address: "555 Wine Way",
        city: "San Francisco",
        state: "CA",
        startTime: "18:30",
        endTime: "21:30",
        price: 4500, // $45.00
        ageRequirement: "21",
        dressCode: null,
        categories: ["restaurant", "drinks"],
        eventType: "venue",
        privacy: "public",
        hostId: "venue5",
        maxCapacity: 50,
        currentAttendees: 42,
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240",
        ticketLinks: {}
      },
      {
        id: "6",
        name: "Weekly Trivia Night",
        description: "Test your knowledge and win prizes at our fun trivia competition.",
        venue: "The Scholar's Pub",
        address: "888 Brain Street",
        city: "San Francisco",
        state: "CA",
        startTime: "19:30",
        endTime: "22:00",
        price: 0, // Free
        ageRequirement: "all",
        dressCode: null,
        categories: ["entertainment", "sports"],
        eventType: "venue",
        privacy: "public",
        hostId: "venue6",
        maxCapacity: 80,
        currentAttendees: 25,
        imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=240",
        ticketLinks: {}
      }
    ];

    sampleEvents.forEach(event => {
      this.events.set(event.id, event);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEvents(filters?: {
    city?: string;
    state?: string;
    categories?: string[];
    ageRequirement?: string;
    maxPrice?: number;
    minPrice?: number;
    eventType?: string;
  }): Promise<Event[]> {
    let events = Array.from(this.events.values());

    if (filters) {
      if (filters.city) {
        events = events.filter(event => 
          event.city.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }
      if (filters.state) {
        events = events.filter(event => 
          event.state.toLowerCase() === filters.state!.toLowerCase()
        );
      }
      if (filters.categories && filters.categories.length > 0) {
        events = events.filter(event => {
          const eventCategories = Array.isArray(event.categories) ? event.categories : [];
          return filters.categories!.some(cat => eventCategories.includes(cat));
        });
      }
      if (filters.ageRequirement) {
        events = events.filter(event => event.ageRequirement === filters.ageRequirement);
      }
      if (filters.maxPrice !== undefined) {
        events = events.filter(event => event.price <= filters.maxPrice! * 100);
      }
      if (filters.minPrice !== undefined) {
        events = events.filter(event => event.price >= filters.minPrice! * 100);
      }
      if (filters.eventType) {
        events = events.filter(event => event.eventType === filters.eventType);
      }
    }

    return events.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      ...insertEvent, 
      id,
      currentAttendees: 0,
      categories: insertEvent.categories || [],
      ticketLinks: insertEvent.ticketLinks || {}
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;

    const updatedEvent = { ...event, ...updateData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  async getNightPlan(userId: string): Promise<NightPlan | undefined> {
    return Array.from(this.nightPlans.values()).find(plan => plan.userId === userId);
  }

  async createNightPlan(insertNightPlan: InsertNightPlan): Promise<NightPlan> {
    const id = randomUUID();
    const nightPlan: NightPlan = { 
      ...insertNightPlan, 
      id,
      eventIds: insertNightPlan.eventIds || [],
      optimizedRoute: insertNightPlan.optimizedRoute || []
    };
    this.nightPlans.set(id, nightPlan);
    return nightPlan;
  }

  async updateNightPlan(userId: string, updateData: Partial<InsertNightPlan>): Promise<NightPlan | undefined> {
    const existingPlan = await this.getNightPlan(userId);
    if (!existingPlan) return undefined;

    const updatedPlan = { ...existingPlan, ...updateData };
    this.nightPlans.set(existingPlan.id, updatedPlan);
    return updatedPlan;
  }

  // Group methods
  async getGroup(id: string): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    const userMemberships = Array.from(this.groupMemberships.values())
      .filter(membership => membership.userId === userId);
    
    const groups: Group[] = [];
    for (const membership of userMemberships) {
      const group = this.groups.get(membership.groupId);
      if (group) {
        groups.push(group);
      }
    }
    return groups;
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = randomUUID();
    const now = new Date();
    const group: Group = { 
      ...insertGroup, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.groups.set(id, group);
    
    // Add creator as admin member
    const membership: GroupMembership = {
      id: randomUUID(),
      groupId: id,
      userId: insertGroup.createdBy,
      role: 'admin',
      joinedAt: now
    };
    this.groupMemberships.set(membership.id, membership);
    
    return group;
  }

  async deleteGroup(id: string): Promise<boolean> {
    // Remove all memberships
    const memberships = Array.from(this.groupMemberships.values())
      .filter(membership => membership.groupId === id);
    memberships.forEach(membership => this.groupMemberships.delete(membership.id));
    
    // Remove all shared plans
    const sharedPlans = Array.from(this.sharedPlans.values())
      .filter(plan => plan.groupId === id);
    sharedPlans.forEach(plan => this.sharedPlans.delete(plan.id));
    
    return this.groups.delete(id);
  }

  // Group membership methods
  async getGroupMembers(groupId: string): Promise<(GroupMembership & { user: User })[]> {
    const memberships = Array.from(this.groupMemberships.values())
      .filter(membership => membership.groupId === groupId);
    
    const members: (GroupMembership & { user: User })[] = [];
    for (const membership of memberships) {
      const user = this.users.get(membership.userId);
      if (user) {
        members.push({ ...membership, user });
      }
    }
    return members;
  }

  async addGroupMember(insertMembership: InsertGroupMembership): Promise<GroupMembership> {
    const id = randomUUID();
    const membership: GroupMembership = {
      ...insertMembership,
      id,
      joinedAt: new Date()
    };
    this.groupMemberships.set(id, membership);
    return membership;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<boolean> {
    const membership = Array.from(this.groupMemberships.values())
      .find(m => m.groupId === groupId && m.userId === userId);
    
    if (membership) {
      return this.groupMemberships.delete(membership.id);
    }
    return false;
  }

  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    return Array.from(this.groupMemberships.values())
      .some(m => m.groupId === groupId && m.userId === userId);
  }

  // Shared plan methods
  async getGroupSharedPlans(groupId: string): Promise<(SharedPlan & { user: User })[]> {
    const plans = Array.from(this.sharedPlans.values())
      .filter(plan => plan.groupId === groupId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()); // newest first
    
    const plansWithUsers: (SharedPlan & { user: User })[] = [];
    for (const plan of plans) {
      const user = this.users.get(plan.userId);
      if (user) {
        plansWithUsers.push({ ...plan, user });
      }
    }
    return plansWithUsers;
  }

  async createSharedPlan(insertSharedPlan: InsertSharedPlan): Promise<SharedPlan> {
    const id = randomUUID();
    const now = new Date();
    const sharedPlan: SharedPlan = {
      ...insertSharedPlan,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.sharedPlans.set(id, sharedPlan);
    return sharedPlan;
  }

  async deleteSharedPlan(id: string): Promise<boolean> {
    return this.sharedPlans.delete(id);
  }
}

export const storage = new MemStorage();
