import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Food } from '../types';
import { getFoods, addFoodEntry, addCustomFood } from '../services/apiService';
import { analyzeFoodImage, AnalyzedFoodInfo } from '../services/geminiService';
import Spinner from '../components/common/Spinner';
import { CameraIcon } from '../components/icons/CameraIcon';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';

interface AddFoodProps {
    onFoodAdded: () => void;
}

type ActiveTab = 'search' | 'custom' | 'ai';

const AddFood: React.FC<AddFoodProps> = ({ onFoodAdded }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('search');
    
    return (
        <div className="container mx-auto max-w-2xl space-y-4">
             <div className="bg-base-100 p-1.5 rounded-full shadow-sm flex items-center space-x-2">
                <TabButton label="Search" activeTab={activeTab} onClick={() => setActiveTab('search')} />
                <TabButton label="Custom" activeTab={activeTab} onClick={() => setActiveTab('custom')} />
                <TabButton label="AI Scan" activeTab={activeTab} onClick={() => setActiveTab('ai')} />
            </div>

            <div>
                {activeTab === 'search' && <SearchFood onFoodAdded={onFoodAdded} />}
                {activeTab === 'custom' && <CustomFood onFoodAdded={onFoodAdded} />}
                {activeTab === 'ai' && <AiFoodScanner onFoodAdded={onFoodAdded} />}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ label: string; activeTab: string; onClick: () => void; }> = ({ label, activeTab, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2 text-center font-semibold transition-colors duration-300 rounded-full text-sm ${activeTab.toLowerCase() === label.toLowerCase() ? 'bg-primary text-primary-content shadow' : 'text-neutral hover:bg-base-300'}`}
    >
        {label}
    </button>
);

const SearchFood: React.FC<AddFoodProps> = ({ onFoodAdded }) => {
    const [foodDb, setFoodDb] = useState<Food[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [grams, setGrams] = useState(100);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getFoods().then(setFoodDb);
    }, []);

    const filteredFoods = useMemo(() => {
        if (!searchTerm) return [];
        return foodDb.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 50);
    }, [searchTerm, foodDb]);

    const handleAdd = async () => {
        if (selectedFood && grams > 0) {
            setIsLoading(true);
            await addFoodEntry({ foodId: selectedFood.id, date: new Date().toISOString().split('T')[0], grams });
            setIsLoading(false);
            onFoodAdded();
        }
    };

    if (selectedFood) {
        return (
            <div className="bg-base-100 p-6 rounded-2xl shadow-md">
                 <button onClick={() => setSelectedFood(null)} className="flex items-center text-sm text-neutral hover:text-primary mb-4 font-semibold">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to search
                 </button>
                 <h3 className="text-2xl font-bold mb-1">{selectedFood.name}</h3>
                 <p className="text-neutral mb-4">{selectedFood.calories} kcal / 100g</p>
                 <label className="font-semibold block mb-2">Amount</label>
                 <div className="flex items-center space-x-2">
                     <input type="number" value={grams} onChange={e => setGrams(Number(e.target.value))} className="w-28 p-3 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                     <span className="font-medium text-neutral">grams</span>
                 </div>
                 <button onClick={handleAdd} disabled={isLoading} className="mt-6 w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-focus font-semibold transition-colors flex items-center justify-center disabled:opacity-50">
                    {isLoading ? <Spinner size="sm"/> : 'Add to Log'}
                 </button>
            </div>
        )
    }

    return (
        <div className="bg-base-100 p-6 rounded-2xl shadow-md">
            <input
                type="text"
                placeholder="Search for a food..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-base-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <ul className="space-y-2 max-h-80 overflow-y-auto">
                {filteredFoods.map(food => (
                    <li key={food.id} onClick={() => setSelectedFood(food)} className="p-3 bg-base-200 rounded-lg cursor-pointer hover:bg-primary hover:text-white transition-colors">
                        <span className="font-semibold">{food.name}</span> <span className="text-sm opacity-70">({food.calories} kcal/100g)</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const CustomFood: React.FC<AddFoodProps> = ({ onFoodAdded }) => {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState<number | ''>('');
    const [protein, setProtein] = useState<number | ''>('');
    const [carbs, setCarbs] = useState<number | ''>('');
    const [fat, setFat] = useState<number | ''>('');
    const [grams, setGrams] = useState<number | ''>(100);
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        // FIX: Cast calories and grams to Number before comparison to fix type error.
        if (name && Number(calories) > 0 && Number(grams) > 0) {
            setIsLoading(true);
            const newFood = await addCustomFood({ name, calories: Number(calories), protein: Number(protein), carbs: Number(carbs), fat: Number(fat), isCustom: true });
            await addFoodEntry({ foodId: newFood.id, date: new Date().toISOString().split('T')[0], grams: Number(grams) });
            setIsLoading(false);
            onFoodAdded();
        }
    };
    
    const FormRow: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
        <div>
            <label className="text-sm font-medium text-neutral block mb-1">{label}</label>
            {children}
        </div>
    );

    return (
        <div className="bg-base-100 p-6 rounded-2xl shadow-md space-y-4">
            <h3 className="text-xl font-bold">Add Custom Food</h3>
            <FormRow label="Food Name"><input type="text" placeholder="e.g., Homemade Lasagna" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></FormRow>
            <FormRow label="Calories (per 100g)"><input type="number" placeholder="0" value={calories} onChange={e => setCalories(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></FormRow>
            <p className="text-sm font-medium text-neutral -mb-2">Macros (per 100g, optional)</p>
            <div className="grid grid-cols-3 gap-2">
              <FormRow label="Protein (g)"><input type="number" placeholder="0" value={protein} onChange={e => setProtein(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></FormRow>
              <FormRow label="Carbs (g)"><input type="number" placeholder="0" value={carbs} onChange={e => setCarbs(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></FormRow>
              <FormRow label="Fat (g)"><input type="number" placeholder="0" value={fat} onChange={e => setFat(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></FormRow>
            </div>
            <FormRow label="Amount to Log (grams)"><input type="number" placeholder="100" value={grams} onChange={e => setGrams(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></FormRow>
            <button onClick={handleAdd} disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-focus font-semibold transition-colors flex items-center justify-center disabled:opacity-50">
                {isLoading ? <Spinner size="sm"/> : 'Add to Log'}
            </button>
        </div>
    );
};

const AiFoodScanner: React.FC<AddFoodProps> = ({ onFoodAdded }) => {
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzedFoodInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                handleAnalyze(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAnalyze = async (dataUrl: string) => {
        const base64Image = dataUrl.split(',')[1];
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        
        try {
            const result = await analyzeFoodImage(base64Image);
            if (result) {
                setAnalysisResult(result);
            } else {
                setError("Could not analyze image. Please try another one.");
            }
        } catch (err) {
            setError("An error occurred during analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAnalyzedFood = async () => {
        if (!analysisResult) return;
        const { foodName, estimatedCalories, estimatedWeight, protein, carbs, fat } = analysisResult;
        
        setIsLoading(true);
        const newFood = await addCustomFood({ 
            name: `(AI) ${foodName}`, 
            calories: Math.round((estimatedCalories / estimatedWeight) * 100),
            protein: Math.round((protein / estimatedWeight) * 100),
            carbs: Math.round((carbs / estimatedWeight) * 100),
            fat: Math.round((fat / estimatedWeight) * 100),
            isCustom: true 
        });
        
        await addFoodEntry({ 
            foodId: newFood.id, 
            date: new Date().toISOString().split('T')[0], 
            grams: estimatedWeight
        });
        
        setIsLoading(false);
        onFoodAdded();
    };
    
    const reset = () => {
        setImage(null);
        setAnalysisResult(null);
        setError(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="bg-base-100 p-6 rounded-2xl shadow-md text-center">
            {!image && (
                <>
                    <h3 className="text-xl font-bold mb-2">Analyze Food with AI</h3>
                    <p className="text-neutral mb-6">Take a picture of your meal, and our AI will estimate its nutritional content.</p>
                    <input type="file" id="ai-upload" accept="image/*" ref={fileInputRef} onChange={(e) => handleImageUpload(e.target.files ? e.target.files[0] : null)} className="hidden" />
                    <label htmlFor="ai-upload" className="cursor-pointer bg-accent text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-transform hover:scale-105 shadow-lg shadow-accent/20 flex items-center justify-center w-full md:w-auto md:mx-auto">
                        <CameraIcon className="mr-2"/>
                        Select Image
                    </label>
                </>
            )}
            
            {image && (
                <div className="relative">
                    <img src={image} alt="Uploaded food" className="rounded-lg max-h-64 mx-auto shadow-md" />
                </div>
            )}
            
            {isLoading && !analysisResult && <div className="mt-6 flex flex-col items-center space-y-2"><Spinner /><p className="text-neutral">Analyzing meal...</p></div>}
            {error && <p className="mt-6 text-error">{error}</p>}
            
            {analysisResult && (
                <div className="mt-6 text-left border-t border-base-300 pt-6 animate-fadeIn">
                    <h4 className="text-lg font-bold mb-4">Analysis Result</h4>
                    <div className="space-y-2 bg-base-200 p-4 rounded-lg">
                        <p><strong>Food:</strong> {analysisResult.foodName}</p>
                        <p><strong>Est. Calories:</strong> {analysisResult.estimatedCalories} kcal</p>
                        <p><strong>Est. Weight:</strong> {analysisResult.estimatedWeight}g</p>
                        <p className="text-sm"><strong>Macros:</strong> {analysisResult.protein}g P / {analysisResult.carbs}g C / {analysisResult.fat}g F</p>
                    </div>
                    <div className="flex space-x-2 mt-6">
                        <button onClick={reset} className="w-full bg-base-300 text-base-content py-3 rounded-lg hover:bg-base-300/80 font-semibold transition-colors">
                            Try Another
                        </button>
                        <button onClick={handleAddAnalyzedFood} disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-focus font-semibold transition-colors flex items-center justify-center disabled:opacity-50">
                             {isLoading ? <Spinner size="sm"/> : 'Accept & Add'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddFood;