import { useState } from "react";
import { UserPlus, ArrowLeft, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";

export default function Following() {
  const [, setLocation] = useLocation();
  
  // Mock following data - in real app would come from API
  const [followingList, setFollowingList] = useState([
    { id: '6', name: 'David Brown', avatar: 'DB', bio: 'DJ and music producer' },
    { id: '7', name: 'Rachel Green', avatar: 'RG', bio: 'Art curator and gallery owner' },
    { id: '8', name: 'Tom Miller', avatar: 'TM', bio: 'Craft beer enthusiast' },
    { id: '9', name: 'Sophie Anderson', avatar: 'SA', bio: 'Food blogger and chef' },
    { id: '10', name: 'Alex Turner', avatar: 'AT', bio: 'Concert photographer' }
  ]);

  const handleUnfollow = (userId: string) => {
    setFollowingList(prev => prev.filter(person => person.id !== userId));
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
              <UserPlus className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Following</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">You follow {followingList.length} people</p>
        </div>
      </div>

      {/* Following List */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {followingList.map((person) => (
            <div key={person.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-start space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-white">
                    {person.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900" data-testid={`text-following-name-${person.id}`}>
                        {person.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1" data-testid={`text-following-bio-${person.id}`}>
                        {person.bio}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(person.id)}
                      className="ml-4 text-red-600 border-red-200 hover:bg-red-50"
                      data-testid={`button-unfollow-${person.id}`}
                    >
                      <UserMinus className="h-4 w-4 mr-1" />
                      Unfollow
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {followingList.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Not following anyone yet</h3>
              <p className="text-gray-600">Discover and follow people to see their events and activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}