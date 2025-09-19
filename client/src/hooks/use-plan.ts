import { useState, useEffect } from "react";
import { type Event } from "@shared/schema";
import { planStore } from "@/lib/plan-store";

export function usePlan() {
  const [events, setEvents] = useState<Event[]>(planStore.getEvents());
  const [groupContext, setGroupContextState] = useState<string | null>(planStore.getGroupContext());

  useEffect(() => {
    const unsubscribe = planStore.subscribe(() => {
      setEvents(planStore.getEvents());
      setGroupContextState(planStore.getGroupContext());
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

  const setGroupContext = (groupId: string | null) => {
    planStore.setGroupContext(groupId);
  };

  const getGroupContext = () => {
    return planStore.getGroupContext();
  };

  return {
    events,
    addEvent,
    removeEvent,
    isInPlan,
    clearPlan,
    setGroupContext,
    getGroupContext,
    groupContext
  };
}