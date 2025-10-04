import React, { useState, useEffect, useMemo } from 'react';
import { Food, FoodEntry, MacroNutrients } from '../types';
import { getFoods, getEntriesForDate, removeFoodEntry } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import CalorieProgress from '../components/CalorieProgress';
import FoodItem from '../components/FoodItem';
import Spinner from '../components/common/Spinner';
import { PlusIcon } from '../components/icons/PlusIcon';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';


interface FoodLogProps {
    date: string;
    onDateChange: (newDate: string) => void;
    onAddFoodClick: () => void;
}

const FoodLog: React.FC<FoodLogProps> = ({ date, onDateChange, onAddFoodClick }) => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<FoodEntry[]>([]);
    const [foodDb, setFoodDb] = useState<Food[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogData = async () => {
        setIsLoading(true);
        try {
            const [fetchedFoods, fetchedEntries] = await Promise.all([
                getFoods(),
                getEntriesForDate(date)
            ]);
            setFoodDb(fetchedFoods);
            setEntries(fetchedEntries);
        } catch (error) {
            console.error("Failed to fetch log data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    const handleRemoveEntry = async (entryId: string) => {
        await removeFoodEntry(entryId);
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
    };

    const foodMap = useMemo(() => {
        return foodDb.reduce((map, food) => {
            map[food.id] = food;
            return map;
        }, {} as Record<string, Food>);
    }, [foodDb]);

    const { totalCalories, macros } = useMemo(() => {
        let total = 0;
        const macroTotals: MacroNutrients = { protein: 0, carbs: 0, fat: 0 };
        entries.forEach(entry => {
            const food = foodMap[entry.foodId];
            if (food) {
                const ratio = entry.grams / 100;
                total += food.calories * ratio;
                macroTotals.protein += (food.protein || 0) * ratio;
                macroTotals.carbs += (food.carbs || 0) * ratio;
                macroTotals.fat += (food.fat || 0) * ratio;
            }
        });
        return { totalCalories: total, macros: macroTotals };
    }, [entries, foodMap]);

    const changeDate = (offset: number) => {
        const currentDate = new Date(date + 'T00:00:00'); // Avoid timezone issues
        currentDate.setDate(currentDate.getDate() + offset);
        onDateChange(currentDate.toISOString().split('T')[0]);
    };
    
    const macroData = [
        { name: 'Protein', value: Math.round(macros.protein) },
        { name: 'Carbs', value: Math.round(macros.carbs) },
        { name: 'Fat', value: Math.round(macros.fat) },
    ].filter(item => item.value > 0);
    const COLORS = ['#3B82F6', '#22c55e', '#F97316'];
    
    const isToday = new Date().toISOString().split('T')[0] === date;

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
             <div className="flex justify-between items-center bg-base-100 p-2 rounded-full shadow-sm">
                <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-base-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                <div className="text-center">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="bg-transparent border-none text-center font-semibold text-lg focus:ring-0"
                    />
                    <p className="text-xs text-neutral">{isToday ? "Today" : new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}</p>
                </div>
                <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-base-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </button>
            </div>
            
            <CalorieProgress current={totalCalories} goal={user?.dailyCalorieGoal || 2000} />
            
            <div className="bg-base-100 p-6 rounded-2xl shadow-md">
                <h3 className="text-lg font-bold mb-4">Macro Breakdown</h3>
                 {macroData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}g`}/>
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                 ) : (
                    <p className="text-center text-neutral py-10">Log some food to see your macro breakdown.</p>
                 )}
            </div>

            <div className="bg-base-100 p-4 rounded-2xl shadow-md">
                <h3 className="text-lg font-bold mb-4 px-2">Today's Log</h3>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Spinner />
                    </div>
                ) : entries.length > 0 ? (
                    <div className="space-y-2">
                        {entries.map(entry => {
                            const food = foodMap[entry.foodId];
                            return food ? <FoodItem key={entry.id} entry={entry} food={food} onRemove={handleRemoveEntry} /> : null;
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-neutral mb-4">No food logged for today yet.</p>
                        <button onClick={onAddFoodClick} className="bg-primary text-primary-content px-6 py-3 rounded-full font-semibold hover:bg-primary-focus transition-transform hover:scale-105 shadow-lg shadow-primary/20 flex items-center mx-auto">
                            <PlusIcon className="mr-2 h-5 w-5" />
                            Add First Item
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodLog;