import { useState } from "react";
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

interface FilterSidebarProps {
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
  { id: 'food', label: '🍽️ Food & Dining' },
  { id: 'music', label: '🎵 Live Music' },
  { id: 'drinks', label: '🍸 Bars & Cocktails' },
  { id: 'dancing', label: '💃 Dancing & Clubs' },
  { id: 'entertainment', label: '🎭 Entertainment' },
  { id: 'sports', label: '⚽ Sports & Games' }
];

const ageRequirements = [
  { id: 'all', label: 'All Ages' },
  { id: '18', label: '18+' },
  { id: '21', label: '21+' }
];

export default function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-filters-title">
        Filters
      </h3>
      
      {/* Budget Filter */}
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-3">Budget</Label>
        <Button
          onClick={handleFreeEventsClick}
          variant={filters.freeOnly ? "default" : "outline"}
          className={`w-full mb-3 ${filters.freeOnly ? 'bg-green-600 hover:bg-green-700' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}
          data-testid="button-free-events-only"
        >
          🎉 Free Events Only
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="block text-xs text-gray-500 mb-1">Less than</Label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
              <Input
                type="number"
                placeholder="50"
                value={maxBudgetInput}
                onChange={(e) => handleMaxBudgetChange(e.target.value)}
                className="pl-7"
                data-testid="input-max-budget"
              />
            </div>
          </div>
          <div>
            <Label className="block text-xs text-gray-500 mb-1">More than</Label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
              <Input
                type="number"
                placeholder="100"
                value={minBudgetInput}
                onChange={(e) => handleMinBudgetChange(e.target.value)}
                className="pl-7"
                data-testid="input-min-budget"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Group Size */}
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-3">Group Size</Label>
        <div className="grid grid-cols-2 gap-2">
          {groupSizes.map((size) => (
            <Button
              key={size.id}
              onClick={() => handleGroupSizeClick(size.id)}
              variant={filters.groupSize === size.id ? "default" : "outline"}
              size="sm"
              className="justify-center"
              data-testid={`button-group-size-${size.id}`}
            >
              {size.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Age Requirements */}
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-3">Age Requirements</Label>
        <div className="space-y-2">
          {ageRequirements.map((age) => (
            <div key={age.id} className="flex items-center space-x-2">
              <Checkbox
                id={`age-${age.id}`}
                checked={filters.ageRequirements.includes(age.id)}
                onCheckedChange={(checked) => handleAgeRequirementChange(age.id, checked as boolean)}
                data-testid={`checkbox-age-${age.id}`}
              />
              <Label htmlFor={`age-${age.id}`} className="text-sm text-gray-700">
                {age.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-3">Categories</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                data-testid={`checkbox-category-${category.id}`}
              />
              <Label htmlFor={`category-${category.id}`} className="text-sm text-gray-700">
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={clearAllFilters}
        variant="outline"
        className="w-full"
        data-testid="button-clear-filters"
      >
        Clear All Filters
      </Button>
    </div>
  );
}
