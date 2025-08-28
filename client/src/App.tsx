import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Tonight from "@/pages/tonight";
import Plan from "@/pages/plan";
import Profile from "@/pages/profile";
import Followers from "@/pages/followers";
import Following from "@/pages/following";
import EventsAttended from "@/pages/events-attended";
import EventsHosted from "@/pages/events-hosted";
import CitiesExplored from "@/pages/cities-explored";
import CityEvents from "@/pages/city-events";
import Navigation from "@/pages/navigation";
import NotFound from "@/pages/not-found";
import MenuPage from "@/pages/menu";
import AddFriends from "@/pages/add-friends";
import FriendProfile from "@/pages/friend-profile";
import FriendFollowers from "@/pages/friend-followers";
import FriendFollowing from "@/pages/friend-following";
import FriendEventsAttended from "@/pages/friend-events-attended";
import FriendEventsHosted from "@/pages/friend-events-hosted";
import FriendCitiesExplored from "@/pages/friend-cities-explored";
import Login from "@/pages/login";
import MobileBottomNav from "@/components/mobile-bottom-nav";

function Router() {
  const [location] = useLocation();
  const [currentSection, setCurrentSection] = useState(() => {
    if (location === '/tonight') return 'tonight';
    if (location === '/plan') return 'plan';
    if (location === '/profile') return 'profile';
    return 'search';
  });

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/tonight" component={Tonight} />
        <Route path="/plan" component={Plan} />
        <Route path="/profile" component={Profile} />
        <Route path="/followers" component={Followers} />
        <Route path="/following" component={Following} />
        <Route path="/events-attended" component={EventsAttended} />
        <Route path="/events-hosted" component={EventsHosted} />
        <Route path="/cities-explored" component={CitiesExplored} />
        <Route path="/city-events" component={CityEvents} />
        <Route path="/navigation" component={Navigation} />
        <Route path="/menu/:venueId" component={MenuPage} />
        <Route path="/add-friends" component={AddFriends} />
        <Route path="/friend-profile/:friendId" component={FriendProfile} />
        <Route path="/friend-followers/:friendId" component={FriendFollowers} />
        <Route path="/friend-following/:friendId" component={FriendFollowing} />
        <Route path="/friend-events-attended/:friendId" component={FriendEventsAttended} />
        <Route path="/friend-events-hosted/:friendId" component={FriendEventsHosted} />
        <Route path="/friend-cities-explored/:friendId" component={FriendCitiesExplored} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
      
      <MobileBottomNav 
        onNavigate={handleNavigate}
        currentSection={currentSection}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
