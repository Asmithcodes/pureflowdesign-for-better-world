
import React from 'react';

interface CardProps {
    isSelected: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ isSelected, onClick, children }) => {
    const baseClasses = "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-center";
    const selectedClasses = "bg-blue-100 dark:bg-blue-900/50 border-blue-500 text-blue-800 dark:text-blue-300 shadow-md";
    const unselectedClasses = "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-600";

    return (
        <div 
            onClick={onClick} 
            className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
        >
            {children}
        </div>
    );
};

export default Card;
