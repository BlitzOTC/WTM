import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, Eye, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Group } from "@shared/schema";

// Mock user ID - in real app this would come from auth context
const CURRENT_USER_ID = "current-user-id";

export default function Groups() {
  const [, setLocation] = useLocation();

  // Fetch user's groups
  const { data: groups = [], isLoading, error } = useQuery<Group[]>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/groups`],
  });

  const handleViewGroup = (groupId: string) => {
    setLocation(`/group/${groupId}`);
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
              <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
              <p className="text-gray-600">Share night plans with friends</p>
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
              <Card key={group.id} className="hover:shadow-md transition-shadow">
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
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Active
                    </Badge>
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-600 mt-2" data-testid={`text-group-description-${group.id}`}>
                      {group.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>5 members</span> {/* TODO: Get actual member count */}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>3 plans</span> {/* TODO: Get actual plan count */}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewGroup(group.id)}
                        data-testid={`button-view-group-${group.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
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