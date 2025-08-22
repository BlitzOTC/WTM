import { Search, Calendar, BookOpen, User } from "lucide-react";
import { useLocation } from "wouter";

interface MobileBottomNavProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

export default function MobileBottomNav({ onNavigate, currentSection }: MobileBottomNavProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: '/'
    },
    {
      id: 'tonight',
      label: 'Tonight',
      icon: Calendar,
      path: '/tonight'
    },
    {
      id: 'plan',
      label: 'My Plan',
      icon: BookOpen,
      path: '/plan'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile'
    }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    onNavigate(item.id);
    setLocation(item.path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary bg-indigo-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}