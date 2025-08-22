import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema, type InsertEvent } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LocationSearch from "@/components/location-search";

interface HostEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { id: 'music', label: '🎵 Live Music' },
  { id: 'food', label: '🍽️ Food & Dining' },
  { id: 'drinks', label: '🍸 Drinks' },
  { id: 'dancing', label: '💃 Dancing' },
  { id: 'entertainment', label: '🎭 Entertainment' },
  { id: 'sports', label: '⚽ Sports & Games' }
];

export default function HostEventModal({ isOpen, onClose }: HostEventModalProps) {
  const [eventType, setEventType] = useState<'venue' | 'personal'>('venue');
  const [locationInput, setLocationInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertEvent>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      name: "",
      description: "",
      venue: "",
      address: "",
      city: "",
      state: "",
      startTime: "",
      endTime: "",
      price: 0,
      ageRequirement: "all",
      dressCode: "",
      categories: [],
      eventType: "venue",
      privacy: "public",
      hostId: "current-user", // In real app, would come from auth
      maxCapacity: undefined,
      imageUrl: "",
      ticketLinks: {}
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event Created",
        description: "Your event has been posted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: InsertEvent) => {
    createEventMutation.mutate({
      ...data,
      eventType,
      price: Math.round(data.price * 100) // Convert to cents
    });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = form.getValues('categories') || [];
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter(id => id !== categoryId);
    
    form.setValue('categories', newCategories);
  };

  const handleLocationChange = (location: string) => {
    setLocationInput(location);
    // Parse location to extract city and state
    const [city, state] = location.split(',').map(s => s.trim());
    if (city) form.setValue('city', city);
    if (state) form.setValue('state', state);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-host-event">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title" className="text-center">Host an Event</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Type Selection */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3 text-center">Event Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={eventType === 'venue' ? 'default' : 'outline'}
                  onClick={() => setEventType('venue')}
                  className={`p-4 h-auto text-left transition-all ${
                    eventType === 'venue' 
                      ? 'bg-[#00d41173] hover:bg-[#00d41180]' 
                      : 'hover:bg-gray-100'
                  }`}
                  data-testid="button-event-type-venue"
                >
                  <div>
                    <div className="font-medium text-gray-900 text-center">🏢 Venue Event</div>
                    <div className="text-sm text-gray-700 font-medium">Bar, Club, Etc...</div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={eventType === 'personal' ? 'default' : 'outline'}
                  onClick={() => setEventType('personal')}
                  className={`p-4 h-auto text-left transition-all ${
                    eventType === 'personal' 
                      ? 'bg-[#00d41173] hover:bg-[#00d41180]' 
                      : 'hover:bg-gray-100'
                  }`}
                  data-testid="button-event-type-personal"
                >
                  <div>
                    <div className="font-medium text-gray-900 text-center">🎉 Personal Event</div>
                    <div className="text-sm text-gray-700 font-medium text-center">Party, Gathering, Etc...</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Rooftop Jazz Night" {...field} data-testid="input-event-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">Venue/Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Skyline Lounge" {...field} data-testid="input-event-venue" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Search */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2 text-center">Location Search</Label>
              <LocationSearch
                value={locationInput}
                onChange={handleLocationChange}
                placeholder="Search for city, state..."
              />
              <p className="text-xs text-gray-500 mt-1">This will auto-fill the city and state fields below</p>
            </div>

            {/* Address */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} data-testid="input-event-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">City</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco" {...field} data-testid="input-event-city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">State</FormLabel>
                    <FormControl>
                      <Input placeholder="CA" {...field} data-testid="input-event-state" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Time and Price */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-event-start-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-event-end-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">Cover Charge ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-event-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Categories and Age Requirements */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2 text-center">Categories</Label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={form.watch('categories')?.includes(category.id) || false}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                        data-testid={`checkbox-host-category-${category.id}`}
                      />
                      <Label htmlFor={`category-${category.id}`} className="text-sm">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <FormField
                control={form.control}
                name="ageRequirement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">Age Requirements</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-age-requirement">
                          <SelectValue placeholder="Select age requirement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Ages</SelectItem>
                        <SelectItem value="18">18+</SelectItem>
                        <SelectItem value="21">21+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Privacy (for personal events) */}
            {eventType === 'personal' && (
              <FormField
                control={form.control}
                name="privacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block">Event Privacy</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="public" id="privacy-public" data-testid="radio-privacy-public" />
                          <Label htmlFor="privacy-public">🌎 Public - Anyone can see and join</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="friends" id="privacy-friends" data-testid="radio-privacy-friends" />
                          <Label htmlFor="privacy-friends">👥 Friends Only - Only your friends can see</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="invite" id="privacy-invite" data-testid="radio-privacy-invite" />
                          <Label htmlFor="privacy-invite">📨 Invite Only - Send specific invitations</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-center block">Event Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4}
                      placeholder="Tell people what makes this event special..."
                      {...field}
                      data-testid="textarea-event-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={createEventMutation.isPending}
                className="flex-1 bg-primary text-white hover:bg-indigo-700"
                data-testid="button-submit-event"
              >
                {createEventMutation.isPending ? "Creating..." : "Post Event"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel-event"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
