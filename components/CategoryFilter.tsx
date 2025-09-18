"use client";

import React from 'react';
import { Card } from './ui/card';

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
  // Add "All Posts" to the beginning of the list to be rendered
  const allFilterItems = ['All Posts', ...categories];

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-2 px-2">CATEGORIES</h3>
      <nav className="flex flex-col space-y-1">
        {allFilterItems.map((item) => {
          const isSelected = selectedCategory === item;
          // Look up the count using a lowercase version of the item name
          const count = item === 'All Posts' ? totalPostsCount : categoryCounts[item.toLowerCase()] || 0;

          return (
            <button
              key={item}
              onClick={() => onSelectCategory(item)}
              className={`flex items-center justify-between w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                isSelected
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <span>{item}</span>
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