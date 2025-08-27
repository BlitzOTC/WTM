import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface MenuData {
  venueName: string;
  venueType: string;
  address: string;
  menuItems: MenuItem[];
}

export default function MenuPage() {
  const [match, params] = useRoute("/menu/:venueId");
  const [, navigate] = useLocation();
  const venueId = params?.venueId;

  const handleBackClick = () => {
    // Use browser history to go back to the previous page
    window.history.back();
  };

  const { data: menuData, isLoading } = useQuery<MenuData>({
    queryKey: ["/api/menu", venueId],
    enabled: !!venueId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Menu not found</h1>
          <Button variant="outline" onClick={handleBackClick}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const menuByCategory = menuData.menuItems.reduce((acc: Record<string, MenuItem[]>, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" data-testid="button-back" onClick={handleBackClick}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-venue-name">{menuData.venueName}</h1>
            <p className="text-muted-foreground" data-testid="text-venue-address">{menuData.address}</p>
          </div>
        </div>

        {/* Menu Categories */}
        <div className="space-y-8">
          {Object.entries(menuByCategory).map(([category, items]) => (
            <Card key={category} className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl capitalize" data-testid={`text-category-${category.toLowerCase().replace(' ', '-')}`}>
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-start p-4 rounded-lg bg-muted/50"
                    data-testid={`card-menu-item-${item.id}`}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1" data-testid={`text-item-name-${item.id}`}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground" data-testid={`text-item-description-${item.id}`}>
                        {item.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-4 flex items-center gap-1" data-testid={`text-item-price-${item.id}`}>
                      <DollarSign className="w-3 h-3" />
                      {(item.price / 100).toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Prices and availability subject to change. Please confirm with restaurant.</p>
        </div>
      </div>
    </div>
  );
}