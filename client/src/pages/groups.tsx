import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Group } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Mock user ID - in real app this would come from auth context
const CURRENT_USER_ID = "current-user-id";

export default function Groups() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if we're in share mode
  const urlParams = new URLSearchParams(window.location.search);
  const isShareMode = urlParams.get('shareMode') === 'true';
  const [planToShare, setPlanToShare] = useState<any>(null);

  // Load plan data when in share mode
  useEffect(() => {
    if (isShareMode) {
      const storedPlan = localStorage.getItem('planToShare');
      if (storedPlan) {
        try {
          setPlanToShare(JSON.parse(storedPlan));
        } catch (error) {
          console.error('Failed to parse plan data:', error);
          toast({
            title: "Error",
            description: "Failed to load plan data for sharing.",
            variant: "destructive",
          });
          setLocation('/plan');
        }
      } else {
        toast({
          title: "No plan to share",
          description: "Please go back and select a plan to share.",
          variant: "destructive",
        });
        setLocation('/plan');
      }
    }
  }, [isShareMode, setLocation, toast]);

  // Fetch user's groups
  const { data: groups = [], isLoading, error } = useQuery<Group[]>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/groups`],
  });

  // Fetch member counts for each group
  const { data: groupMemberCounts = {} } = useQuery<Record<string, number>>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/group-member-counts`],
    enabled: groups.length > 0,
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const group of groups) {
        try {
          const response = await fetch(`/api/groups/${group.id}/members`);
          if (response.ok) {
            const members = await response.json();
            counts[group.id] = members.length;
          }
        } catch (error) {
          console.error(`Failed to fetch members for group ${group.id}:`, error);
          counts[group.id] = 0;
        }
      }
      return counts;
    },
  });

  // Fetch shared plan counts for each group
  const { data: groupPlanCounts = {} } = useQuery<Record<string, number>>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/group-plan-counts`],
    enabled: groups.length > 0,
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const group of groups) {
        try {
          const response = await fetch(`/api/groups/${group.id}/shared-plans`);
          if (response.ok) {
            const plans = await response.json();
            counts[group.id] = plans.length;
          }
        } catch (error) {
          console.error(`Failed to fetch plans for group ${group.id}:`, error);
          counts[group.id] = 0;
        }
      }
      return counts;
    },
  });

  const handleViewGroup = async (groupId: string) => {
    if (isShareMode && planToShare) {
      try {
        await apiRequest('POST', `/api/groups/${groupId}/shared-plans`, {
          userId: CURRENT_USER_ID,
          planData: planToShare
        });
        
        // Invalidate the group's shared plans cache
        queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/shared-plans`] });
        
        // Clean up stored plan data
        localStorage.removeItem('planToShare');
        
        toast({
          title: "Plan shared!",
          description: `Your plan has been shared with the group.`,
        });
        
        // Navigate to the group view to see the shared plan
        setLocation(`/group/${groupId}`);
        
      } catch (error) {
        console.error('Failed to share plan:', error);
        toast({
          title: "Failed to share plan",
          description: "There was an error sharing your plan. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setLocation(`/group/${groupId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading your groups...</p>
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
              onClick={() => setLocation("/plan")}
              className="p-2"
              data-testid="button-back-to-plan"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isShareMode ? 'Share Plan to Group' : 'My Groups'}
              </h1>
              <p className="text-gray-600">
                {isShareMode ? 'Select a group to share your plan with' : 'Share night plans with friends'}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setLocation("/create-group")}
            size="sm"
            className="bg-primary text-white hover:bg-indigo-700"
            data-testid="button-create-new-group"
          >
            <Users className="h-4 w-4 mr-2" />
            New Group
          </Button>
        </div>

        {/* Groups List */}
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-600 mb-6">Create a group to start sharing night plans with friends</p>
            <Button
              onClick={() => setLocation("/create-group")}
              className="bg-primary text-white hover:bg-indigo-700"
              data-testid="button-create-first-group"
            >
              <Users className="h-4 w-4 mr-2" />
              Create Your First Group
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group: Group) => (
              <Card 
                key={group.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  isShareMode ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' : ''
                }`}
                onClick={() => handleViewGroup(group.id)}
                data-testid={`card-group-${group.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg" data-testid={`text-group-name-${group.id}`}>
                          {group.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          Created {new Date(group.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {isShareMode ? (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share Here
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Active
                      </Badge>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-600 mt-2" data-testid={`text-group-description-${group.id}`}>
                      {group.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{groupMemberCounts[group.id] || 0} member{(groupMemberCounts[group.id] || 0) !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{groupPlanCounts[group.id] || 0} plan{(groupPlanCounts[group.id] || 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}