import { type Event } from "@shared/schema";

// Simple store for managing planned events across the app
class PlanStore {
  private events: Event[] = [];
  private listeners: (() => void)[] = [];
  private groupContext: string | null = null;

  addEvent(event: Event) {
    if (!this.events.find(e => e.id === event.id)) {
      this.events.push(event);
      this.notifyListeners();
    }
  }

  removeEvent(eventId: string) {
    this.events = this.events.filter(e => e.id !== eventId);
    this.notifyListeners();
  }

  getEvents(): Event[] {
    return [...this.events];
  }

  isInPlan(eventId: string): boolean {
    return this.events.some(e => e.id === eventId);
  }

  clearPlan() {
    this.events = [];
    this.groupContext = null;
    this.notifyListeners();
  }

  setGroupContext(groupId: string | null) {
    this.groupContext = groupId;
    this.notifyListeners();
  }

  getGroupContext(): string | null {
    return this.groupContext;
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const planStore = new PlanStore();