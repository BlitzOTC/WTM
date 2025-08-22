import { useState, useEffect } from "react";
import { type Event } from "@shared/schema";
import { planStore } from "@/lib/plan-store";

export function usePlan() {
  const [events, setEvents] = useState<Event[]>(planStore.getEvents());

  useEffect(() => {
    const unsubscribe = planStore.subscribe(() => {
      setEvents(planStore.getEvents());
    });

    return unsubscribe;
  }, []);

  const addEvent = (event: Event) => {
    planStore.addEvent(event);
  };

  const removeEvent = (eventId: string) => {
    planStore.removeEvent(eventId);
  };

  const isInPlan = (eventId: string) => {
    return planStore.isInPlan(eventId);
  };

  const clearPlan = () => {
    planStore.clearPlan();
  };

  return {
    events,
    addEvent,
    removeEvent,
    isInPlan,
    clearPlan
  };
}