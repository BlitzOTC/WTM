import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Plus, Calendar, Clock, DollarSign, Share2, Trash2, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Group, type SharedPlan, type User, type Event } from "@shared/schema";
import { usePlan } from "@/hooks/use-plan";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Mock user ID - in real app this would come from auth context
const CURRENT_USER_ID = "current-user-id";

interface SharedPlanWithUser extends SharedPlan {
  user: User;
}

export default function GroupView() {
  const { groupId } = useParams<{ groupId: string }>();
  const [, setLocation] = useLocation();
  const { events: currentPlanEvents } = usePlan();
  const { toast } = useToast();

  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery<Group>({
    queryKey: [`/api/groups/${groupId}`],
  });

  // Fetch group shared plans
  const { data: sharedPlans = [], isLoading: plansLoading, refetch } = useQuery<SharedPlanWithUser[]>({
    queryKey: [`/api/groups/${groupId}/shared-plans`],
  });

  // Fetch group members
  const { data: members = [], isLoading: membersLoading } = useQuery<Array<{ id: string; userId: string; role: string; user: User }>>({
    queryKey: [`/api/groups/${groupId}/members`],
  });

  const handleShareCurrentPlan = async () => {
    if (currentPlanEvents.length === 0) {
      toast({
        title: "No plan to share",
        description: "Add some events to your plan first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", `/api/groups/${groupId}/shared-plans`, {
        userId: CURRENT_USER_ID,
        planData: {
          events: currentPlanEvents,
          totalBudget: currentPlanEvents.reduce((sum, event) => sum + event.price, 0),
          name: `Night Plan - ${new Date().toLocaleDateString()}`,
        },
      });

      toast({
        title: "Plan shared successfully!",
        description: "Your night plan has been shared with the group.",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Failed to share plan",
        description: "There was an error sharing your plan. Please try again.",
        variant: "destructive",
      });
      console.error("Error sharing plan:", error);
    }
  };

  const handleDeleteSharedPlan = async (sharedPlanId: string) => {
    try {
      await apiRequest("DELETE", `/api/shared-plans/${sharedPlanId}`);
      
      toast({
        title: "Plan deleted",
        description: "The shared plan has been removed.",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Failed to delete plan",
        description: "There was an error deleting the plan. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting shared plan:", error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await apiRequest("DELETE", `/api/groups/${groupId}/members/${CURRENT_USER_ID}`);
      
      toast({
        title: "Left group",
        description: "You have left the group.",
      });

      // Navigate back to groups page
      setLocation("/groups");
    } catch (error) {
      toast({
        title: "Failed to leave group",
        description: "There was an error leaving the group. Please try again.",
        variant: "destructive",
      });
      console.error("Error leaving group:", error);
    }
  };

  const formatTotalCost = (cost: number) => {
    if (cost === 0) return "FREE";
    return `$${(cost / 100).toFixed(0)}`;
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (groupLoading || plansLoading || membersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading group...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Group not found</h3>
            <Button onClick={() => setLocation("/groups")}>Back to Groups</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/groups")}
              className="p-2"
              data-testid="button-back-to-groups"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900" data-testid="text-group-name">
                {group.name}
              </h1>
              <p className="text-gray-600 text-center">
                {members.length} member{members.length !== 1 ? 's' : ''} • {sharedPlans.length} plan{sharedPlans.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {currentPlanEvents.length > 0 && (
            <Button
              onClick={handleShareCurrentPlan}
              size="sm"
              className="bg-primary text-white hover:bg-indigo-700"
              data-testid="button-share-plan"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Plan
            </Button>
          )}
        </div>

        {/* Group Description */}
        {group.description && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <p className="text-gray-700" data-testid="text-group-description">
                {group.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Members Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Members ({members.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50"
                  data-testid={`member-${member.userId}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {member.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {member.user.username}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {member.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shared Plans Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shared Plans</h2>

          {sharedPlans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shared plans yet</h3>
                <p className="text-gray-600 mb-4">
                  Share your night plans with the group so everyone can see what's planned!
                </p>
                {currentPlanEvents.length > 0 ? (
                  <Button
                    onClick={handleShareCurrentPlan}
                    className="bg-primary text-white hover:bg-indigo-700"
                    data-testid="button-share-first-plan"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Your Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => setLocation("/tonight")}
                    variant="outline"
                    data-testid="button-create-plan-first"
                  >
                    Create a Plan to Share
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sharedPlans.map((sharedPlan: SharedPlanWithUser) => (
                <Card key={sharedPlan.id} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {sharedPlan.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {sharedPlan.user.username}'s Plan
                          </div>
                          <div className="text-sm text-gray-500">
                            Shared {new Date(sharedPlan.createdAt!).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {sharedPlan.userId === CURRENT_USER_ID && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSharedPlan(sharedPlan.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-plan-${sharedPlan.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Plan Summary */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{(sharedPlan.planData as any)?.events?.length || 0} events</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatTotalCost((sharedPlan.planData as any)?.totalBudget || 0)}</span>
                      </div>
                    </div>

                    {/* Events List */}
                    {(sharedPlan.planData as any)?.events && (sharedPlan.planData as any).events.length > 0 && (
                      <div className="space-y-2">
                        {(sharedPlan.planData as any).events.slice(0, 3).map((event: Event, index: number) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            data-testid={`shared-event-${event.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {event.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTime(event.startTime)} • {event.venue}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                              {formatTotalCost(event.price)}
                            </div>
                          </div>
                        ))}
                        {(sharedPlan.planData as any).events.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{(sharedPlan.planData as any).events.length - 3} more events
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Leave Group Button */}
          <div className="mt-6 text-center">
            <Button
              onClick={handleLeaveGroup}
              variant="outline"
              className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300"
              data-testid="button-leave-group"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave Group
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}