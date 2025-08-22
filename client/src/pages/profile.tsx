import { useState } from "react";
import { User, Settings, Calendar, MapPin, Bell, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    location: "San Francisco, CA",
    notifications: {
      eventReminders: true,
      newEvents: false,
      friendInvites: true
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // TODO: Implement profile save
    setIsEditing(false);
    console.log('Saving profile:', profileData);
  };

  const handleLogout = () => {
    // TODO: Implement logout
    console.log('Logging out...');
  };

  const stats = [
    { label: "Events Attended", value: "12", icon: Calendar },
    { label: "Events Hosted", value: "3", icon: User },
    { label: "Cities Explored", value: "5", icon: MapPin }
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
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-edit-profile"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-white text-lg">
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="font-semibold"
                    data-testid="input-profile-name"
                  />
                  <Input
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="text-sm"
                    data-testid="input-profile-email"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{profileData.name}</h2>
                  <p className="text-gray-600">{profileData.email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {isEditing ? (
              <Input
                value={profileData.location}
                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                className="text-sm"
                data-testid="input-profile-location"
              />
            ) : (
              <span>{profileData.location}</span>
            )}
          </div>

          {isEditing && (
            <div className="mt-4 flex space-x-2">
              <Button onClick={handleSave} size="sm" data-testid="button-save-profile">
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Your Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="h-5 w-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-700">Event Reminders</Label>
              <Switch
                checked={profileData.notifications.eventReminders}
                onCheckedChange={(checked) => 
                  setProfileData({
                    ...profileData,
                    notifications: {...profileData.notifications, eventReminders: checked}
                  })
                }
                data-testid="switch-event-reminders"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-700">New Events Nearby</Label>
              <Switch
                checked={profileData.notifications.newEvents}
                onCheckedChange={(checked) => 
                  setProfileData({
                    ...profileData,
                    notifications: {...profileData.notifications, newEvents: checked}
                  })
                }
                data-testid="switch-new-events"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-700">Friend Invites</Label>
              <Switch
                checked={profileData.notifications.friendInvites}
                onCheckedChange={(checked) => 
                  setProfileData({
                    ...profileData,
                    notifications: {...profileData.notifications, friendInvites: checked}
                  })
                }
                data-testid="switch-friend-invites"
              />
            </div>
          </div>
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}