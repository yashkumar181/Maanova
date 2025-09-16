"use client";


import React from 'react';
import { Card } from './ui/card'; // Using a Card for the container

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: { [key: string]: number };
  totalPostsCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalPostsCount,
}) => {
  // Combine "All Posts" with the other categories for easier mapping
  const allCategoryItems = [{ name: 'All Posts', key: 'all' }, ...categories.map(c => ({ name: c, key: c }))];

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-2 px-2">CATEGORIES</h3>
      <nav className="flex flex-col space-y-1">
        {allCategoryItems.map((item) => {
          const isSelected = selectedCategory === item.key;
          const count = item.key === 'all' ? totalPostsCount : categoryCounts[item.key] || 0;

          return (
            <button
              key={item.key}
              onClick={() => onSelectCategory(item.key)}
              className={`flex items-center justify-between w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                isSelected
                  ? 'bg-primary/10 text-primary font-semibold' // Style for active category
                  : 'hover:bg-accent hover:text-accent-foreground' // Style for inactive category
              }`}
            >
              <span>{item.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </Card>
  );
};
