import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Plus, Search, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertGroupSchema, type InsertGroup } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Mock friends data - in real app this would come from an API
const mockFriends = [
  { id: "1", username: "alex_chen", name: "Alex Chen" },
  { id: "2", username: "sarah_j", name: "Sarah Johnson" },
  { id: "3", username: "mike_wilson", name: "Mike Wilson" },
  { id: "4", username: "emma_davis", name: "Emma Davis" },
  { id: "5", username: "david_kim", name: "David Kim" },
  { id: "6", username: "lisa_martin", name: "Lisa Martin" },
];

const createGroupFormSchema = insertGroupSchema.extend({
  selectedFriends: z.array(z.string()).min(1, "Please select at least one friend"),
});

type CreateGroupFormData = z.infer<typeof createGroupFormSchema>;

export default function CreateGroup() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      createdBy: "current-user-id", // In real app, get from auth context
      selectedFriends: [],
    },
  });

  const filteredFriends = mockFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => {
      const updated = prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId];
      
      form.setValue("selectedFriends", updated);
      return updated;
    });
  };

  const onSubmit = async (data: CreateGroupFormData) => {
    try {
      // Create the group
      const groupResponse = await apiRequest("POST", "/api/groups", {
        name: data.name,
        description: data.description || null,
        createdBy: data.createdBy,
      });
      
      const group = await groupResponse.json();

      // Add selected friends as members
      for (const friendId of data.selectedFriends) {
        await apiRequest("POST", `/api/groups/${group.id}/members`, {
          userId: friendId,
          role: "member",
        });
      }

      toast({
        title: "Group created successfully!",
        description: `"${data.name}" has been created with ${data.selectedFriends.length} members.`,
      });

      // Navigate to the groups list
      setLocation("/groups");
    } catch (error) {
      toast({
        title: "Failed to create group",
        description: "There was an error creating your group. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating group:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/plan")}
            className="p-2"
            data-testid="button-back-to-plan"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Group</h1>
            <p className="text-gray-600">Share night plans with friends</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Group Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Group Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Weekend Squad, Happy Hour Crew"
                          data-testid="input-group-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What's this group about?"
                          rows={3}
                          data-testid="textarea-group-description"
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Friend Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Add Friends</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search friends..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-friends"
                  />
                </div>

                {/* Selected Friends Count */}
                {selectedFriends.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''} selected
                    </Badge>
                  </div>
                )}

                {/* Friends List */}
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => toggleFriendSelection(friend.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedFriends.includes(friend.id)
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      data-testid={`friend-item-${friend.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {friend.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{friend.name}</div>
                          <div className="text-sm text-gray-500">@{friend.username}</div>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedFriends.includes(friend.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedFriends.includes(friend.id) && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* No friends message */}
                {filteredFriends.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No friends found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}

                {/* Form validation error for friend selection */}
                {form.formState.errors.selectedFriends && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.selectedFriends.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/plan")}
                className="flex-1"
                data-testid="button-cancel-create-group"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-white hover:bg-indigo-700"
                disabled={form.formState.isSubmitting}
                data-testid="button-submit-create-group"
              >
                {form.formState.isSubmitting ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}