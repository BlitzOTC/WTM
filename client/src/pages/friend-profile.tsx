import { useState } from "react";
import { useRoute } from "wouter";
import { User, ArrowLeft, Calendar, MapPin, Users, UserPlus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface FriendData {
  id: string;
  name: string;
  username: string;
  email: string;
  location: string;
  avatar: string;
  followers: { id: string; name: string; avatar: string }[];
  following: { id: string; name: string; avatar: string }[];
  stats: {
    eventsAttended: number;
    eventsHosted: number;
    citiesExplored: number;
  };
  isFollowing: boolean;
}

// Mock friend data - in real app would fetch from API
const getFriendData = (friendId: string): FriendData => {
  const friends: Record<string, FriendData> = {
    '1': {
      id: '1',
      name: 'Sarah Chen',
      username: '@sarahc',
      email: 'sarah.chen@example.com',
      location: 'San Francisco, CA',
      avatar: 'SC',
      followers: [
        { id: 'f1', name: 'Mike Rodriguez', avatar: 'MR' },
        { id: 'f2', name: 'Emma Davis', avatar: 'ED' },
        { id: 'f3', name: 'Alex Johnson', avatar: 'AJ' },
        { id: 'f4', name: 'Lisa Park', avatar: 'LP' },
        { id: 'f5', name: 'David Brown', avatar: 'DB' }
      ],
      following: [
        { id: 'f6', name: 'James Wilson', avatar: 'JW' },
        { id: 'f7', name: 'Rachel Green', avatar: 'RG' }
      ],
      stats: {
        eventsAttended: 18,
        eventsHosted: 5,
        citiesExplored: 8
      },
      isFollowing: false
    },
    '2': {
      id: '2',
      name: 'Mike Rodriguez',
      username: '@miker',
      email: 'mike.rodriguez@example.com',
      location: 'Oakland, CA',
      avatar: 'MR',
      followers: [
        { id: 'f8', name: 'Sarah Chen', avatar: 'SC' },
        { id: 'f9', name: 'Tom Miller', avatar: 'TM' }
      ],
      following: [
        { id: 'f10', name: 'Emma Davis', avatar: 'ED' },
        { id: 'f11', name: 'Lisa Park', avatar: 'LP' },
        { id: 'f12', name: 'Alex Johnson', avatar: 'AJ' }
      ],
      stats: {
        eventsAttended: 24,
        eventsHosted: 2,
        citiesExplored: 6
      },
      isFollowing: false
    },
    '5': {
      id: '5',
      name: 'Lisa Park',
      username: '@lisap',
      email: 'lisa.park@example.com',
      location: 'San Francisco, CA',
      avatar: 'LP',
      followers: [
        { id: 'f13', name: 'David Brown', avatar: 'DB' },
        { id: 'f14', name: 'Sarah Chen', avatar: 'SC' },
        { id: 'f15', name: 'Mike Rodriguez', avatar: 'MR' }
      ],
      following: [
        { id: 'f16', name: 'Emma Davis', avatar: 'ED' }
      ],
      stats: {
        eventsAttended: 15,
        eventsHosted: 8,
        citiesExplored: 4
      },
      isFollowing: false
    },
    '6': {
      id: '6',
      name: 'David Brown',
      username: '@davidb',
      email: 'david.brown@example.com',
      location: 'Palo Alto, CA',
      avatar: 'DB',
      followers: [
        { id: 'f17', name: 'Lisa Park', avatar: 'LP' }
      ],
      following: [
        { id: 'f18', name: 'Sarah Chen', avatar: 'SC' },
        { id: 'f19', name: 'Tom Miller', avatar: 'TM' },
        { id: 'f20', name: 'Rachel Green', avatar: 'RG' }
      ],
      stats: {
        eventsAttended: 32,
        eventsHosted: 1,
        citiesExplored: 12
      },
      isFollowing: false
    }
  };

  return friends[friendId] || friends['1']; // Fallback to Sarah's data
};

export default function FriendProfile() {
  const [match, params] = useRoute("/friend-profile/:friendId");
  const friendId = params?.friendId || '1';
  const [friendData, setFriendData] = useState(() => getFriendData(friendId));

  const handleFollowToggle = () => {
    setFriendData(prev => ({
      ...prev,
      isFollowing: !prev.isFollowing
    }));
  };

  const stats = [
    { 
      label: "Events Attended", 
      value: friendData.stats.eventsAttended.toString(), 
      icon: Calendar, 
      route: `/friend-events-attended/${friendId}` 
    },
    { 
      label: "Events Hosted", 
      value: friendData.stats.eventsHosted.toString(), 
      icon: User, 
      route: `/friend-events-hosted/${friendId}` 
    },
    { 
      label: "Cities Explored", 
      value: friendData.stats.citiesExplored.toString(), 
      icon: MapPin, 
      route: `/friend-cities-explored/${friendId}` 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex items-center space-x-2 p-2 hover:bg-gray-50" data-testid="dropdown-navigation-menu">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Profile</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => window.location.href = '/'} data-testid="nav-dropdown-search">
                  🔍 Search
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/tonight'} data-testid="nav-dropdown-tonight">
                  📅 Tonight
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/plan'} data-testid="nav-dropdown-plan">
                  📋 My Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/profile'} data-testid="nav-dropdown-profile">
                  👤 Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile header */}
            <div className="flex items-center space-x-2 md:hidden">
              <User className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
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

        {/* Profile Card */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-white text-lg">
                {friendData.avatar}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{friendData.name}</h2>
                <p className="text-gray-600">{friendData.username}</p>
                
                {/* Followers/Following Stats */}
                <div className="flex items-center space-x-4 mt-3">
                  <button 
                    onClick={() => window.location.href = `/friend-followers/${friendId}`}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary transition-colors"
                    data-testid="button-followers-nav"
                  >
                    <Users className="h-4 w-4" />
                    <span>{friendData.followers.length} Followers</span>
                  </button>
                  <button 
                    onClick={() => window.location.href = `/friend-following/${friendId}`}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary transition-colors"
                    data-testid="button-following-nav"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{friendData.following.length} Following</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <MapPin className="h-4 w-4" />
            <span>{friendData.location}</span>
          </div>

          {/* Follow Button */}
          <Button
            onClick={handleFollowToggle}
            className={`w-full ${friendData.isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-primary text-white hover:bg-indigo-700'}`}
            data-testid="button-follow-friend"
          >
            {friendData.isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Their Events</h3>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <button 
                  key={index} 
                  className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = stat.route}
                  data-testid={`button-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}