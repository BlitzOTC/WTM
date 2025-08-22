import { useState } from "react";
import { type Event } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, DollarSign, Navigation, Timer, Calendar, Play, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlanSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
}

interface RouteVariation {
  id: string;
  name: string;
  description: string;
  events: Event[];
  totalTime: string;
  totalCost: number;
  travelTime: number;
  startTime: string;
  endTime: string;
}

export default function PlanSummaryModal({ isOpen, onClose, events }: PlanSummaryModalProps) {
  const [selectedVariation, setSelectedVariation] = useState<string>("optimized");
  const [nightStarted, setNightStarted] = useState(false);
  const { toast } = useToast();

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatCost = (cost: number) => {
    if (cost === 0) return "FREE";
    return `$${(cost / 100).toFixed(0)}`;
  };

  const formatTotalCost = (cost: number) => {
    if (cost === 0) return "FREE";
    return `${(cost / 100).toFixed(0)}`;
  };

  // Generate route variations
  const generateRouteVariations = (): RouteVariation[] => {
    const sortedByTime = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const reverseOrder = [...sortedByTime].reverse();

    const calculateTimes = (eventList: Event[]) => {
      if (eventList.length === 0) return { startTime: "", endTime: "", totalTime: "", travelTime: 15 };
      
      const firstEvent = eventList[0];
      const lastEvent = eventList[eventList.length - 1];
      
      // Calculate recommended stay times (1.5-2 hours per event)
      const stayTime = eventList.length * 90; // 90 minutes average per event
      const travelTime = (eventList.length - 1) * 15; // 15 minutes between venues
      const totalMinutes = stayTime + travelTime;
      
      const formatTimeInternal = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      const calculateEndTime = (startTime: string, durationMinutes: number) => {
        const [hours, minutes] = startTime.split(':');
        const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
        const endMinutes = startMinutes + durationMinutes;
        const endHour = Math.floor(endMinutes / 60) % 24;
        const endMin = endMinutes % 60;
        const ampm = endHour >= 12 ? 'PM' : 'AM';
        const displayHour = endHour % 12 || 12;
        return `${displayHour}:${endMin.toString().padStart(2, '0')} ${ampm}`;
      };

      return {
        startTime: formatTimeInternal(firstEvent.startTime),
        endTime: calculateEndTime(firstEvent.startTime, totalMinutes),
        totalTime: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        travelTime: travelTime
      };
    };

    const optimizedTimes = calculateTimes(sortedByTime);
    const reverseTimes = calculateTimes(reverseOrder);

    return [
      {
        id: "optimized",
        name: "Time Optimized",
        description: "Events ordered by start time for smooth flow",
        events: sortedByTime,
        ...optimizedTimes,
        totalCost: events.reduce((sum, event) => sum + event.price, 0)
      },
      {
        id: "reverse",
        name: "Late Start",
        description: "Start with later events for a relaxed evening",
        events: reverseOrder,
        ...reverseTimes,
        totalCost: events.reduce((sum, event) => sum + event.price, 0)
      }
    ];
  };

  const routeVariations = generateRouteVariations();
  const selectedRoute = routeVariations.find(r => r.id === selectedVariation) || routeVariations[0];

  const getRecommendedStayTime = (event: Event, index: number, total: number) => {
    // Recommend longer stays for dinner/main events, shorter for drinks
    const eventCategories = Array.isArray(event.categories) ? event.categories : [];
    if (eventCategories.includes('food')) return "2 hours";
    if (eventCategories.includes('drinks') && index === total - 1) return "2+ hours"; // Last stop
    if (eventCategories.includes('music')) return "1.5-2 hours";
    return "1-1.5 hours";
  };

  const getLeaveTime = (event: Event, index: number, events: Event[]) => {
    if (index === events.length - 1) return "When ready";
    
    const [hours, minutes] = event.startTime.split(':');
    const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
    const leaveMinutes = startMinutes + 90; // 1.5 hours default
    const leaveHour = Math.floor(leaveMinutes / 60) % 24;
    const leaveMin = leaveMinutes % 60;
    const ampm = leaveHour >= 12 ? 'PM' : 'AM';
    const displayHour = leaveHour % 12 || 12;
    return `${displayHour}:${leaveMin.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-primary" />
            <span>Your Night Plan - Route Options</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedVariation} onValueChange={setSelectedVariation} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {routeVariations.map((variation) => (
              <TabsTrigger key={variation.id} value={variation.id} className="text-sm">
                {variation.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {routeVariations.map((variation) => (
            <TabsContent key={variation.id} value={variation.id} className="space-y-6">
              {/* Route Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{variation.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{variation.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{variation.startTime} - {variation.endTime}</div>
                      <div className="text-gray-500">{variation.totalTime} total</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{formatTotalCost(variation.totalCost)}</div>
                      <div className="text-gray-500">Total cost</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Navigation className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{variation.events.length} stops</div>
                      <div className="text-gray-500">{variation.travelTime}min travel</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Tonight</div>
                      <div className="text-gray-500">Ready to go</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Itinerary */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Detailed Itinerary</h4>
                
                {variation.events.map((event, index) => (
                  <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{event.name}</h5>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{event.venue}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCost(event.price)}</div>
                        {event.ageRequirement && (
                          <Badge variant="secondary" className="text-xs">
                            {event.ageRequirement}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">Arrival Time</span>
                        </div>
                        <div className="ml-5">{formatTime(event.startTime)}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Timer className="h-3 w-3" />
                          <span className="font-medium">Recommended Stay</span>
                        </div>
                        <div className="ml-5">{getRecommendedStayTime(event, index, variation.events.length)}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Navigation className="h-3 w-3" />
                          <span className="font-medium">Leave by</span>
                        </div>
                        <div className="ml-5">{getLeaveTime(event, index, variation.events)}</div>
                      </div>
                    </div>

                    {index < variation.events.length - 1 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Navigation className="h-3 w-3" />
                          <span>15 min travel to next location</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex space-x-3 pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Back to Plan
          </Button>
          <Button 
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
            onClick={() => {
              console.log('Starting night with route:', selectedRoute.name);
              setNightStarted(true);
              
              // Show success notification
              toast({
                title: "Night Started! 🎉",
                description: `Your ${selectedRoute.name} route is now active. Have an amazing night!`,
              });
              
              // Store the active night plan in localStorage for persistence
              const nightPlan = {
                route: selectedRoute,
                startedAt: new Date().toISOString(),
                events: selectedRoute.events,
                currentEventIndex: 0,
                status: 'active'
              };
              localStorage.setItem('activeNightPlan', JSON.stringify(nightPlan));
              
              // Close modal after brief delay to show success state
              setTimeout(() => {
                onClose();
                setNightStarted(false);
              }, 2000);
            }}
            data-testid="button-confirm-start-night"
            disabled={nightStarted}
          >
            {nightStarted ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Night Started!
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start with {selectedRoute.name}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}