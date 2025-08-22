import { useState } from "react";
import { Users, ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";

export default function Followers() {
  const [, setLocation] = useLocation();
  
  // Mock followers data - in real app would come from API
  const followers = [
    { id: '1', name: 'Sarah Chen', avatar: 'SC', bio: 'Love exploring new restaurants and nightlife' },
    { id: '2', name: 'Mike Rodriguez', avatar: 'MR', bio: 'Event photographer and music enthusiast' },
    { id: '3', name: 'Emma Davis', avatar: 'ED', bio: 'Dancing queen and cocktail connoisseur' },
    { id: '4', name: 'James Wilson', avatar: 'JW', bio: 'Tech meetup organizer' },
    { id: '5', name: 'Lisa Park', avatar: 'LP', bio: 'Foodie and wine lover' },
    { id: '6', name: 'David Kim', avatar: 'DK', bio: 'Live music fan' },
    { id: '7', name: 'Rachel Green', avatar: 'RG', bio: 'Art gallery enthusiast' },
    { id: '8', name: 'Tom Miller', avatar: 'TM', bio: 'Sports bar regular' }
  ];

  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({
    '1': false,
    '2': true,
    '3': false,
    '4': true,
    '5': false,
    '6': false,
    '7': true,
    '8': false
  });

  const handleFollowToggle = (userId: string) => {
    setFollowingStatus(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/profile')}
              data-testid="button-back-to-profile"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Followers</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">{followers.length} people follow you</p>
        </div>
      </div>

      {/* Followers List */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {followers.map((follower) => (
            <div key={follower.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-start space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-white">
                    {follower.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900" data-testid={`text-follower-name-${follower.id}`}>
                        {follower.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1" data-testid={`text-follower-bio-${follower.id}`}>
                        {follower.bio}
                      </p>
                    </div>
                    
                    <Button
                      variant={followingStatus[follower.id] ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFollowToggle(follower.id)}
                      className={`ml-4 ${followingStatus[follower.id] ? 'text-gray-700' : 'bg-primary text-white hover:bg-indigo-700'}`}
                      data-testid={`button-follow-${follower.id}`}
                    >
                      {followingStatus[follower.id] ? (
                        <span className="flex items-center space-x-1">
                          <span>Following</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1">
                          <UserPlus className="h-4 w-4" />
                          <span>Follow Back</span>
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {followers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No followers yet</h3>
              <p className="text-gray-600">When people follow you, they'll appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}