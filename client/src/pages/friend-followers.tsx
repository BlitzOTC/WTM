import { useState } from "react";
import { useRoute } from "wouter";
import { ArrowLeft, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Follower {
  id: string;
  name: string;
  username: string;
  avatar: string;
  location: string;
  isFollowing: boolean;
}

const getFriendFollowers = (friendId: string): { friendName: string; followers: Follower[] } => {
  const friendFollowers: Record<string, { friendName: string; followers: Follower[] }> = {
    '1': {
      friendName: 'Sarah Chen',
      followers: [
        { id: 'f1', name: 'Mike Rodriguez', username: '@miker', avatar: 'MR', location: 'Oakland, CA', isFollowing: false },
        { id: 'f2', name: 'Emma Davis', username: '@emmad', avatar: 'ED', location: 'Berkeley, CA', isFollowing: true },
        { id: 'f3', name: 'Alex Johnson', username: '@alexj', avatar: 'AJ', location: 'San Francisco, CA', isFollowing: false },
        { id: 'f4', name: 'Lisa Park', username: '@lisap', avatar: 'LP', location: 'Palo Alto, CA', isFollowing: true },
        { id: 'f5', name: 'David Brown', username: '@davidb', avatar: 'DB', location: 'San Jose, CA', isFollowing: false }
      ]
    },
    '2': {
      friendName: 'Mike Rodriguez',
      followers: [
        { id: 'f8', name: 'Sarah Chen', username: '@sarahc', avatar: 'SC', location: 'San Francisco, CA', isFollowing: true },
        { id: 'f9', name: 'Tom Miller', username: '@tomm', avatar: 'TM', location: 'San Mateo, CA', isFollowing: false }
      ]
    },
    '5': {
      friendName: 'Lisa Park',
      followers: [
        { id: 'f13', name: 'David Brown', username: '@davidb', avatar: 'DB', location: 'Palo Alto, CA', isFollowing: true },
        { id: 'f14', name: 'Sarah Chen', username: '@sarahc', avatar: 'SC', location: 'San Francisco, CA', isFollowing: true },
        { id: 'f15', name: 'Mike Rodriguez', username: '@miker', avatar: 'MR', location: 'Oakland, CA', isFollowing: false }
      ]
    },
    '6': {
      friendName: 'David Brown',
      followers: [
        { id: 'f17', name: 'Lisa Park', username: '@lisap', avatar: 'LP', location: 'San Francisco, CA', isFollowing: true }
      ]
    }
  };

  return friendFollowers[friendId] || friendFollowers['1'];
};

export default function FriendFollowers() {
  const [match, params] = useRoute("/friend-followers/:friendId");
  const friendId = params?.friendId || '1';
  const { friendName, followers: initialFollowers } = getFriendFollowers(friendId);
  const [followers, setFollowers] = useState(initialFollowers);

  const handleFollowToggle = (followerId: string) => {
    setFollowers(prev => 
      prev.map(follower => 
        follower.id === followerId 
          ? { ...follower, isFollowing: !follower.isFollowing }
          : follower
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex items-center space-x-2 p-2 hover:bg-gray-50">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Followers</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => window.location.href = '/'}>
                  🔍 Search
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/tonight'}>
                  📅 Tonight
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/plan'}>
                  📋 My Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                  👤 Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center space-x-2 md:hidden">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Followers</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{friendName}'s Followers</h2>
          <p className="text-gray-600">{followers.length} followers</p>
        </div>

        {/* Followers List */}
        <div className="space-y-4">
          {followers.map((follower) => (
            <div key={follower.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-white">
                      {follower.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <button
                      className="font-medium text-gray-900 hover:text-primary transition-colors text-left"
                      onClick={() => window.location.href = `/friend-profile/${follower.id}`}
                      data-testid={`button-follower-name-${follower.id}`}
                    >
                      {follower.name}
                    </button>
                    <div className="text-sm text-gray-600">{follower.username}</div>
                    <div className="text-xs text-gray-500">{follower.location}</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={follower.isFollowing ? "outline" : "default"}
                  onClick={() => handleFollowToggle(follower.id)}
                  data-testid={`button-follow-${follower.id}`}
                >
                  {follower.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {followers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No followers yet</h3>
            <p className="text-gray-600">{friendName} doesn't have any followers yet</p>
          </div>
        )}
      </div>
    </div>
  );
}