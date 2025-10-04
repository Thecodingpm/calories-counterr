import React from 'react';
import { Food, FoodEntry } from '../types';

interface FoodItemProps {
    entry: FoodEntry;
    food: Food;
    onRemove: (entryId: string) => void;
}

const FoodItem: React.FC<FoodItemProps> = ({ entry, food, onRemove }) => {
    const totalCalories = Math.round((food.calories / 100) * entry.grams);

    return (
        <div className="flex justify-between items-center p-4 bg-base-100 rounded-xl transition-shadow duration-200">
            <div>
                <p className="font-semibold text-base-content">{food.name}</p>
                <p className="text-sm text-neutral">{entry.grams}g &bull; {Math.round(food.protein/100*entry.grams)}P / {Math.round(food.carbs/100*entry.grams)}C / {Math.round(food.fat/100*entry.grams)}F</p>
            </div>
            <div className="flex items-center space-x-4">
                <span className="font-bold text-lg text-primary">{totalCalories} kcal</span>
                <button
                    onClick={() => onRemove(entry.id)}
                    className="text-neutral/40 hover:text-error hover:bg-error/10 rounded-full p-1 transition-colors"
                    aria-label="Remove item"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default FoodItem;