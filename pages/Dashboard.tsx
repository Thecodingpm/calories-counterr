import React, { useState, useCallback } from 'react';
import Header from '../components/Header';
import FoodLog from './FoodLog';
import AddFood from './AddFood';
import Stats from './Stats';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { ChartBarIcon } from '../components/icons/ChartBarIcon';

type Page = 'log' | 'add' | 'stats';

const Dashboard: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('log');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleDateChange = (newDate: string) => {
        setDate(newDate);
    };
    
    const navigateToAddFood = useCallback(() => setCurrentPage('add'), []);
    const navigateToLog = useCallback(() => setCurrentPage('log'), []);

    const renderContent = () => {
        switch (currentPage) {
            case 'log':
                return <FoodLog date={date} onDateChange={handleDateChange} onAddFoodClick={navigateToAddFood} />;
            case 'add':
                return <AddFood onFoodAdded={navigateToLog} />;
            case 'stats':
                return <Stats />;
            default:
                return <FoodLog date={date} onDateChange={handleDateChange} onAddFoodClick={navigateToAddFood} />;
        }
    };
    
    const NavItem: React.FC<{ page: Page, label: string, icon: React.ReactNode }> = ({ page, label, icon }) => {
        const isActive = currentPage === page;
        return (
            <button
                onClick={() => setCurrentPage(page)}
                className={`flex flex-col items-center justify-center w-full pt-3 pb-2 transition-colors duration-200 relative ${isActive ? 'text-primary' : 'text-neutral/60 hover:text-primary'}`}
            >
                {isActive && <div className="absolute top-0 h-1 w-8 bg-primary rounded-full"></div>}
                {icon}
                <span className="text-xs font-medium">{label}</span>
            </button>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-base-200">
            <Header />
            <main className="flex-grow overflow-y-auto p-4 md:p-6 pb-24">
                {renderContent()}
            </main>
            <footer className="fixed bottom-0 left-0 right-0 bg-base-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10 border-t border-base-300">
                <nav className="flex justify-around max-w-xl mx-auto">
                    <NavItem page="log" label="Log" icon={<BookOpenIcon />} />
                    <NavItem page="add" label="Add Food" icon={<div className="bg-primary text-primary-content rounded-full p-2 -mt-6 shadow-lg shadow-primary/30 border-4 border-base-100"><PlusIcon className="h-7 w-7"/></div>} />
                    <NavItem page="stats" label="Stats" icon={<ChartBarIcon />} />
                </nav>
            </footer>
        </div>
    );
};

export default Dashboard;