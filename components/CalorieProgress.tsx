import React from 'react';

interface CalorieProgressProps {
    current: number;
    goal: number;
}

const CalorieProgress: React.FC<CalorieProgressProps> = ({ current, goal }) => {
    const radius = 55;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const percentage = goal > 0 ? Math.min((current / goal), 1.2) : 0; // Cap at 120% for visual
    const actualPercentage = goal > 0 ? current / goal : 0;

    const strokeDashoffset = circumference - (percentage > 1 ? 1 : percentage) * circumference;

    let progressColor = 'text-primary';
    if (actualPercentage > 1) {
        progressColor = 'text-error';
    } else if (actualPercentage > 0.85) {
        progressColor = 'text-warning';
    }

    const remaining = Math.max(0, goal - current);

    return (
        <div className="bg-base-100 p-6 rounded-2xl shadow-md flex flex-col items-center space-y-4">
            <div className="relative flex items-center justify-center">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="-rotate-90"
                >
                    <circle
                        className="text-base-300"
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        className={`${progressColor} transition-all duration-500`}
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold text-base-content">{Math.round(current)}</span>
                    <span className="text-sm text-neutral">/ {goal} kcal</span>
                </div>
            </div>
            <div className="text-center">
                <h2 className="text-xl font-bold text-base-content">Today's Progress</h2>
                 <p className={`font-semibold ${current > goal ? 'text-error' : 'text-neutral'}`}>
                    {current > goal ? `${Math.round(current-goal)} kcal over` : `${Math.round(remaining)} kcal remaining`}
                </p>
            </div>
        </div>
    );
};

export default CalorieProgress;