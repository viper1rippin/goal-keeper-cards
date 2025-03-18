
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Goal } from '@/components/GoalRow';

interface SelectionContextType {
  selectedGoals: Record<string, Goal>;
  toggleSelection: (goal: Goal) => void;
  clearSelection: () => void;
  isSelected: (goalId: string) => boolean;
  selectedCount: number;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedGoals, setSelectedGoals] = useState<Record<string, Goal>>({});

  const toggleSelection = (goal: Goal) => {
    if (!goal.id) return;
    
    setSelectedGoals(prev => {
      const newSelected = { ...prev };
      if (newSelected[goal.id as string]) {
        delete newSelected[goal.id as string];
      } else {
        newSelected[goal.id as string] = goal;
      }
      return newSelected;
    });
  };

  const clearSelection = () => {
    setSelectedGoals({});
  };

  const isSelected = (goalId: string) => {
    return !!selectedGoals[goalId];
  };

  const selectedCount = Object.keys(selectedGoals).length;

  return (
    <SelectionContext.Provider value={{
      selectedGoals,
      toggleSelection,
      clearSelection,
      isSelected,
      selectedCount
    }}>
      {children}
    </SelectionContext.Provider>
  );
};
