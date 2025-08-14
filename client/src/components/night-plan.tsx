import { type Event } from "@shared/schema";
import { X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NightPlanProps {
  selectedEvents: Event[];
  totalBudget: number;
  onRemoveEvent: (eventId: string) => void;
}

export default function NightPlan({ selectedEvents, totalBudget, onRemoveEvent }: NightPlanProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${minutes === '00' ? '' : ':' + minutes}${ampm}`;
  };

  const sortedEvents = [...selectedEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const optimizePlan = () => {
    // Mock optimization - in real app would call API
    alert("Route optimized! Events reordered by time and proximity.");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900" data-testid="text-night-plan-title">
          My Night Plan
        </h3>
        <Badge variant="default" className="bg-primary" data-testid="text-plan-count">
          {selectedEvents.length}
        </Badge>
      </div>
      
      {selectedEvents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p data-testid="text-empty-plan">No events selected yet.</p>
          <p className="text-sm mt-1" data-testid="text-empty-plan-hint">
            Add events to start planning your night!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {sortedEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center text-sm font-medium">
                  {formatTime(event.startTime)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm" data-testid={`text-plan-event-name-${event.id}`}>
                    {event.name}
                  </p>
                  <p className="text-xs text-gray-500" data-testid={`text-plan-event-venue-${event.id}`}>
                    {event.venue}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveEvent(event.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                  data-testid={`button-remove-from-plan-${event.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Total Budget:</span>
              <span className="font-medium text-gray-900" data-testid="text-total-budget">
                ${totalBudget.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={optimizePlan}
              className="w-full bg-accent text-white hover:bg-yellow-600"
              data-testid="button-optimize-route"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Optimize My Route
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
