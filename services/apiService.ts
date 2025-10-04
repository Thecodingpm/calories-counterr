
import { User, Food, FoodEntry } from '../types';
import { MOCK_FOOD_DATABASE } from '../constants';

// --- Mock Database via localStorage ---
const getMockUsers = (): User[] => JSON.parse(localStorage.getItem('mockUsers') || '[]');
const setMockUsers = (users: User[]) => localStorage.setItem('mockUsers', JSON.stringify(users));

const getMockFoodEntries = (): FoodEntry[] => JSON.parse(localStorage.getItem('mockFoodEntries') || '[]');
const setMockFoodEntries = (entries: FoodEntry[]) => localStorage.setItem('mockFoodEntries', JSON.stringify(entries));

const getMockCustomFoods = (): Food[] => JSON.parse(localStorage.getItem('mockCustomFoods') || '[]');
const setMockCustomFoods = (foods: Food[]) => localStorage.setItem('mockCustomFoods', JSON.stringify(foods));

// --- Auth Service ---
export const registerUser = async (email: string, password_hash: string): Promise<{ user: User, token: string } | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      let users = getMockUsers();
      if (users.find(u => u.email === email)) {
        resolve(null);
        return;
      }
      const newUser: User = { id: `user_${Date.now()}`, email, dailyCalorieGoal: 2000 };
      users.push(newUser);
      setMockUsers(users);
      const token = `mock_token_${Date.now()}`;
      resolve({ user: newUser, token });
    }, 500);
  });
};

export const loginUser = async (email: string, password_hash: string): Promise<{ user: User, token: string } | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      let users = getMockUsers();
      const user = users.find(u => u.email === email);
      if (user) {
        const token = `mock_token_${Date.now()}`;
        resolve({ user, token });
      } else {
        resolve(null);
      }
    }, 500);
  });
};

// --- Food Service ---
export const getFoods = async (): Promise<Food[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const customFoods = getMockCustomFoods();
      resolve([...MOCK_FOOD_DATABASE, ...customFoods]);
    }, 300);
  });
};

export const addCustomFood = async (food: Omit<Food, 'id'>): Promise<Food> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let customFoods = getMockCustomFoods();
            const newFood: Food = { ...food, id: `custom_${Date.now()}`, isCustom: true };
            customFoods.push(newFood);
            setMockCustomFoods(customFoods);
            resolve(newFood);
        }, 300);
    });
};


// --- Food Entry Service ---
export const getEntriesForDate = async (date: string): Promise<FoodEntry[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const entries = getMockFoodEntries();
            resolve(entries.filter(entry => entry.date === date));
        }, 300);
    });
};

export const addFoodEntry = async (entry: Omit<FoodEntry, 'id'>): Promise<FoodEntry> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let entries = getMockFoodEntries();
            const newEntry: FoodEntry = { ...entry, id: `entry_${Date.now()}` };
            entries.push(newEntry);
            setMockFoodEntries(entries);
            resolve(newEntry);
        }, 300);
    });
};

export const removeFoodEntry = async (entryId: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let entries = getMockFoodEntries();
            const newEntries = entries.filter(entry => entry.id !== entryId);
            setMockFoodEntries(newEntries);
            resolve(true);
        }, 300);
    });
};

// --- Stats Service ---
export const getEntriesForDateRange = async (startDate: string, endDate: string): Promise<FoodEntry[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const entries = getMockFoodEntries();
            const start = new Date(startDate);
            const end = new Date(endDate);
            const filtered = entries.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= start && entryDate <= end;
            });
            resolve(filtered);
        }, 300);
    });
};
