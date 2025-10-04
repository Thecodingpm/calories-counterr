import React, { useState, useEffect, useMemo } from 'react';
import { getEntriesForDateRange, getFoods } from '../services/apiService';
import { FoodEntry, Food } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Spinner from '../components/common/Spinner';

type StatPeriod = 'weekly' | 'monthly';

const Stats: React.FC = () => {
    const [entries, setEntries] = useState<FoodEntry[]>([]);
    const [foodDb, setFoodDb] = useState<Food[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<StatPeriod>('weekly');

    useEffect(() => {
        const fetchStatsData = async () => {
            setIsLoading(true);
            const today = new Date();
            const oneMonthAgo = new Date();
            oneMonthAgo.setDate(today.getDate() - 30);
            
            const startDate = oneMonthAgo.toISOString().split('T')[0];
            const endDate = today.toISOString().split('T')[0];

            try {
                const [fetchedFoods, fetchedEntries] = await Promise.all([
                    getFoods(),
                    getEntriesForDateRange(startDate, endDate)
                ]);
                setFoodDb(fetchedFoods);
                setEntries(fetchedEntries);
                // FIX: Removed invalid "=>" from catch block, which was causing a major syntax error.
            } catch (error) {
                console.error("Failed to fetch stats data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatsData();
    }, []);

    const foodMap = useMemo(() => {
        return foodDb.reduce((map, food) => {
            map[food.id] = food;
            return map;
        }, {} as Record<string, Food>);
    }, [foodDb]);

    const dailyCalories = useMemo(() => {
        const caloriesByDate: { [date: string]: number } = {};
        entries.forEach(entry => {
            const food = foodMap[entry.foodId];
            if (food) {
                if (!caloriesByDate[entry.date]) {
                    caloriesByDate[entry.date] = 0;
                }
                caloriesByDate[entry.date] += (food.calories / 100) * entry.grams;
            }
        });
        return caloriesByDate;
    }, [entries, foodMap]);

    const getChartData = (days: number) => {
        const data = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            data.push({
                name: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                calories: Math.round(dailyCalories[dateString] || 0),
            });
        }
        return data.reverse();
    };

    const chartData = period === 'weekly' ? getChartData(7) : getChartData(30);

    const TabButton: React.FC<{ label: string; value: StatPeriod; }> = ({ label, value }) => (
        <button
            onClick={() => setPeriod(value)}
            className={`flex-1 py-2 text-center font-semibold transition-colors duration-300 rounded-full text-sm ${period === value ? 'bg-primary text-primary-content shadow' : 'text-neutral hover:bg-base-300'}`}
        >
            {label}
        </button>
    );

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-base-content">Your Statistics</h2>
            
            <div className="bg-base-100 p-1.5 rounded-full shadow-sm flex items-center space-x-2">
                <TabButton label="Last 7 Days" value="weekly" />
                <TabButton label="Last 30 Days" value="monthly" />
            </div>

            <div className="bg-base-100 p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold mb-4">{period === 'weekly' ? 'Weekly Calorie Intake' : 'Monthly Calorie Intake'}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.75rem',
                            }}
                        />
                        <Legend />
                        <Bar dataKey="calories" fill="#22c55e" name="Calories" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Stats;