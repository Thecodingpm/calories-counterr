import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Modal from './common/Modal';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { CogIcon } from './icons/CogIcon';
import { LogoutIcon } from './icons/LogoutIcon';

const Header: React.FC = () => {
    const { user, logout, updateGoal } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState(user?.dailyCalorieGoal || 2000);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleGoalChange = () => {
        if (newGoal > 0) {
            updateGoal(newGoal);
            setIsModalOpen(false);
        }
    };

    const openGoalModal = () => {
        setNewGoal(user?.dailyCalorieGoal || 2000);
        setIsModalOpen(true);
        setIsMenuOpen(false);
    }
    
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <header className="bg-base-100/80 backdrop-blur-lg sticky top-0 z-20 shadow-sm p-4 flex justify-between items-center border-b border-base-300">
                <div className="flex items-center space-x-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <h1 className="text-2xl font-bold text-base-content">CalorieAI</h1>
                </div>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="rounded-full hover:bg-base-300 p-1 transition-colors"
                        aria-label="User menu"
                    >
                        <UserCircleIcon className="h-8 w-8 text-neutral" />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-base-100 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 py-1 z-30">
                            <div className="px-4 py-2 border-b border-base-300">
                                <p className="text-sm text-base-content font-medium">Signed in as</p>
                                <p className="text-sm text-neutral truncate">{user?.email}</p>
                            </div>
                            <a
                                href="#"
                                onClick={openGoalModal}
                                className="flex items-center px-4 py-2 text-sm text-base-content hover:bg-base-200 w-full text-left"
                            >
                                <CogIcon className="h-5 w-5 mr-3" />
                                Set Daily Goal
                            </a>
                            <a
                                href="#"
                                onClick={logout}
                                className="flex items-center px-4 py-2 text-sm text-error hover:bg-base-200 w-full text-left"
                            >
                                <LogoutIcon className="h-5 w-5 mr-3" />
                                Logout
                            </a>
                        </div>
                    )}
                </div>
            </header>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set Daily Calorie Goal">
                <div className="space-y-4">
                    <p>Enter your new target for daily calorie intake.</p>
                    <input
                        type="number"
                        value={newGoal}
                        onChange={(e) => setNewGoal(Number(e.target.value))}
                        className="w-full p-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        onClick={handleGoalChange}
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-focus transition-colors"
                    >
                        Save Goal
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Header;