import { useState } from "react";
import { useRoute } from "wouter";
import { ArrowLeft, UserPlus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Following {
  id: string;
  name: string;
  username: string;
  avatar: string;
  location: string;
  isFollowing: boolean;
}

const getFriendFollowing = (friendId: string): { friendName: string; following: Following[] } => {
  const friendFollowing: Record<string, { friendName: string; following: Following[] }> = {
    '1': {
      friendName: 'Sarah Chen',
      following: [
        { id: 'f6', name: 'James Wilson', username: '@jamesw', avatar: 'JW', location: 'Berkeley, CA', isFollowing: false },
        { id: 'f7', name: 'Rachel Green', username: '@rachelg', avatar: 'RG', location: 'San Francisco, CA', isFollowing: true }
      ]
    },
    '2': {
      friendName: 'Mike Rodriguez',
      following: [
        { id: 'f10', name: 'Emma Davis', username: '@emmad', avatar: 'ED', location: 'Berkeley, CA', isFollowing: true },
        { id: 'f11', name: 'Lisa Park', username: '@lisap', avatar: 'LP', location: 'Palo Alto, CA', isFollowing: false },
        { id: 'f12', name: 'Alex Johnson', username: '@alexj', avatar: 'AJ', location: 'San Francisco, CA', isFollowing: false }
      ]
    },
    '5': {
      friendName: 'Lisa Park',
      following: [
        { id: 'f16', name: 'Emma Davis', username: '@emmad', avatar: 'ED', location: 'Berkeley, CA', isFollowing: true }
      ]
    },
    '6': {
      friendName: 'David Brown',
      following: [
        { id: 'f18', name: 'Sarah Chen', username: '@sarahc', avatar: 'SC', location: 'San Francisco, CA', isFollowing: true },
        { id: 'f19', name: 'Tom Miller', username: '@tomm', avatar: 'TM', location: 'San Mateo, CA', isFollowing: false },
        { id: 'f20', name: 'Rachel Green', username: '@rachelg', avatar: 'RG', location: 'San Francisco, CA', isFollowing: true }
      ]
    }
  };

  return friendFollowing[friendId] || friendFollowing['1'];
};

export default function FriendFollowing() {
  const [match, params] = useRoute("/friend-following/:friendId");
  const friendId = params?.friendId || '1';
  const { friendName, following: initialFollowing } = getFriendFollowing(friendId);
  const [following, setFollowing] = useState(initialFollowing);

  const handleFollowToggle = (followingId: string) => {
    setFollowing(prev => 
      prev.map(person => 
        person.id === followingId 
          ? { ...person, isFollowing: !person.isFollowing }
          : person
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
                  <span className="text-xl font-bold text-gray-900">Following</span>
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
              <UserPlus className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Following</h1>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{friendName} is Following</h2>
          <p className="text-gray-600">{following.length} following</p>
        </div>

        {/* Following List */}
        <div className="space-y-4">
          {following.map((person) => (
            <div key={person.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-white">
                      {person.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <button
                      className="font-medium text-gray-900 hover:text-primary transition-colors text-left"
                      onClick={() => window.location.href = `/friend-profile/${person.id}`}
                      data-testid={`button-following-name-${person.id}`}
                    >
                      {person.name}
                    </button>
                    <div className="text-sm text-gray-600">{person.username}</div>
                    <div className="text-xs text-gray-500">{person.location}</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={person.isFollowing ? "outline" : "default"}
                  onClick={() => handleFollowToggle(person.id)}
                  data-testid={`button-follow-${person.id}`}
                >
                  {person.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {following.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Not following anyone</h3>
            <p className="text-gray-600">{friendName} isn't following anyone yet</p>
          </div>
        )}
      </div>
    </div>
  );
}