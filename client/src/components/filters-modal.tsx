import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Filters {
  maxBudget?: number;
  minBudget?: number;
  groupSize?: string;
  categories: string[];
  ageRequirements: string[];
  freeOnly: boolean;
}

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const groupSizes = [
  { id: 'solo', label: 'Solo (1)' },
  { id: 'couple', label: 'Couple (2)' },
  { id: 'small', label: 'Small (3-5)' },
  { id: 'large', label: 'Large (6+)' }
];

const categories = [
  { id: 'fastfood', label: '🍟 Fast Food' },
  { id: 'restaurant', label: '🍽️ Restaurant' },
  { id: 'music', label: '🎵 Live Music' },
  { id: 'drinks', label: '🍸 Bars & Cocktails' },
  { id: 'dancing', label: '💃 Dancing & Clubs' },
  { id: 'entertainment', label: '🎭 Entertainment' },
  { id: 'sports', label: '⚽ Sports & Games' },
  { id: 'art', label: '🎨 Arts & Culture' }
];

const ageRequirements = [
  { id: 'all', label: 'All Ages' },
  { id: '18', label: '18+' },
  { id: '21', label: '21+' }
];

export default function FiltersModal({ isOpen, onClose, filters, onFiltersChange }: FiltersModalProps) {
  const [maxBudgetInput, setMaxBudgetInput] = useState('');
  const [minBudgetInput, setMinBudgetInput] = useState('');

  const handleFreeEventsClick = () => {
    onFiltersChange({
      ...filters,
      freeOnly: !filters.freeOnly,
      maxBudget: !filters.freeOnly ? 0 : undefined
    });
  };

  const handleMaxBudgetChange = (value: string) => {
    setMaxBudgetInput(value);
    const numValue = parseFloat(value);
    onFiltersChange({
      ...filters,
      maxBudget: isNaN(numValue) ? undefined : numValue,
      freeOnly: false
    });
  };

  const handleMinBudgetChange = (value: string) => {
    setMinBudgetInput(value);
    const numValue = parseFloat(value);
    onFiltersChange({
      ...filters,
      minBudget: isNaN(numValue) ? undefined : numValue,
      freeOnly: false
    });
  };

  const handleGroupSizeClick = (size: string) => {
    onFiltersChange({
      ...filters,
      groupSize: filters.groupSize === size ? undefined : size
    });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleAgeRequirementChange = (ageId: string, checked: boolean) => {
    const newAgeRequirements = checked
      ? [...filters.ageRequirements, ageId]
      : filters.ageRequirements.filter(id => id !== ageId);
    
    onFiltersChange({
      ...filters,
      ageRequirements: newAgeRequirements
    });
  };

  const clearAllFilters = () => {
    setMaxBudgetInput('');
    setMinBudgetInput('');
    onFiltersChange({
      categories: [],
      ageRequirements: [],
      freeOnly: false
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.ageRequirements.length > 0) count += filters.ageRequirements.length;
    if (filters.maxBudget !== undefined || filters.minBudget !== undefined) count += 1;
    if (filters.groupSize) count += 1;
    if (filters.freeOnly) count += 1;
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filter Events</span>
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                {getActiveFiltersCount()} active
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Budget Filter */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">Budget</Label>
            <Button
              onClick={handleFreeEventsClick}
              variant={filters.freeOnly ? "default" : "outline"}
              className="w-full mb-3"
              data-testid="button-free-events"
            >
              🎉 Free Events Only
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Min Budget</Label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={minBudgetInput}
                  onChange={(e) => handleMinBudgetChange(e.target.value)}
                  disabled={filters.freeOnly}
                  data-testid="input-min-budget"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Max Budget</Label>
                <Input
                  type="number"
                  placeholder="$100"
                  value={maxBudgetInput}
                  onChange={(e) => handleMaxBudgetChange(e.target.value)}
                  disabled={filters.freeOnly}
                  data-testid="input-max-budget"
                />
              </div>
            </div>
          </div>

          {/* Group Size Filter */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">Group Size</Label>
            <div className="grid grid-cols-2 gap-2">
              {groupSizes.map((size) => (
                <Button
                  key={size.id}
                  onClick={() => handleGroupSizeClick(size.id)}
                  variant={filters.groupSize === size.id ? "default" : "outline"}
                  size="sm"
                  data-testid={`button-group-size-${size.id}`}
                >
                  {size.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">Categories</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    data-testid={`checkbox-category-${category.id}`}
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-sm">
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Age Requirements Filter */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">Age Requirements</Label>
            <div className="grid grid-cols-3 gap-3">
              {ageRequirements.map((age) => (
                <div key={age.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`age-${age.id}`}
                    checked={filters.ageRequirements.includes(age.id)}
                    onCheckedChange={(checked) => handleAgeRequirementChange(age.id, checked as boolean)}
                    data-testid={`checkbox-age-${age.id}`}
                  />
                  <Label htmlFor={`age-${age.id}`} className="text-sm">
                    {age.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={clearAllFilters}
            data-testid="button-clear-filters"
          >
            Clear All
          </Button>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-filters"
            >
              Cancel
            </Button>
            <Button
              onClick={onClose}
              className="bg-primary text-white hover:bg-indigo-700"
              data-testid="button-apply-filters"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}