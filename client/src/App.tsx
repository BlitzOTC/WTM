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
import NotFound from "@/pages/not-found";
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
