import { useState } from "react";
import { ArrowLeft, Search, UserPlus, Users, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
  location: string;
  isFollowing: boolean;
}

export default function AddFriends() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock search function - in real app would call API
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults: Friend[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          username: '@sarahc',
          avatar: 'SC',
          mutualFriends: 3,
          location: 'San Francisco, CA',
          isFollowing: false
        },
        {
          id: '2',
          name: 'Mike Rodriguez',
          username: '@miker',
          avatar: 'MR',
          mutualFriends: 1,
          location: 'Oakland, CA',
          isFollowing: false
        },
        {
          id: '3',
          name: 'Emma Davis',
          username: '@emmad',
          avatar: 'ED',
          mutualFriends: 5,
          location: 'San Francisco, CA',
          isFollowing: true
        },
        {
          id: '4',
          name: 'James Wilson',
          username: '@jamesr',
          avatar: 'JW',
          mutualFriends: 0,
          location: 'Berkeley, CA',
          isFollowing: false
        }
      ].filter(friend => 
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  const handleFollowToggle = (friendId: string) => {
    setSearchResults(prev => 
      prev.map(friend => 
        friend.id === friendId 
          ? { ...friend, isFollowing: !friend.isFollowing }
          : friend
      )
    );
  };

  const handleSuggestedFollowToggle = (friendId: string) => {
    setSuggestedFriends(prev => 
      prev.map(friend => 
        friend.id === friendId 
          ? { ...friend, isFollowing: !friend.isFollowing }
          : friend
      )
    );
  };

  const [suggestedFriends, setSuggestedFriends] = useState<Friend[]>([
    {
      id: '5',
      name: 'Lisa Park',
      username: '@lisap',
      avatar: 'LP',
      mutualFriends: 2,
      location: 'San Francisco, CA',
      isFollowing: false
    },
    {
      id: '6',
      name: 'David Brown',
      username: '@davidb',
      avatar: 'DB',
      mutualFriends: 4,
      location: 'Palo Alto, CA',
      isFollowing: false
    }
  ]);

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
                  <span className="text-xl font-bold text-gray-900">Add Friends</span>
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
              <UserPlus className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Add Friends</h1>
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

        {/* Search */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex space-x-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or username..."
                className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                data-testid="input-friend-search"
                autoComplete="off"
                data-lpignore="true"
                type="text"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              data-testid="button-search-friends"
            >
              {isSearching ? '...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Search Results</h3>
            <div className="space-y-3">
              {searchResults.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-white">
                        {friend.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <button
                        className="font-medium text-gray-900 hover:text-primary transition-colors text-left"
                        onClick={() => window.location.href = `/friend-profile/${friend.id}`}
                        data-testid={`button-friend-name-${friend.id}`}
                      >
                        {friend.name}
                      </button>
                      <div className="text-sm text-gray-600">{friend.username}</div>
                      <div className="text-xs text-gray-500">
                        <span>{friend.location}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={friend.isFollowing ? "outline" : "default"}
                    onClick={() => handleFollowToggle(friend.id)}
                    data-testid={`button-follow-${friend.id}`}
                  >
                    {friend.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Friends */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Suggested Friends</h3>
          <div className="space-y-3">
            {suggestedFriends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-white">
                      {friend.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <button
                      className="font-medium text-gray-900 hover:text-primary transition-colors text-left"
                      onClick={() => window.location.href = `/friend-profile/${friend.id}`}
                      data-testid={`button-friend-name-${friend.id}`}
                    >
                      {friend.name}
                    </button>
                    <div className="text-sm text-gray-600">{friend.username}</div>
                    <div className="text-xs text-gray-500">
                      <span>{friend.location}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={friend.isFollowing ? "outline" : "default"}
                  onClick={() => handleSuggestedFollowToggle(friend.id)}
                  data-testid={`button-follow-${friend.id}`}
                >
                  {friend.isFollowing ? (
                    'Following'
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}