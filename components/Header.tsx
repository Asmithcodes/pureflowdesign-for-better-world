import React from 'react';
import SpannerIcon from './icons/SpannerIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import ThemeToggle from './ThemeToggle';

type Theme = 'light' | 'dark' | 'system';

interface HeaderProps {
    onShowManuals: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const Header: React.FC<HeaderProps> = ({ onShowManuals, theme, setTheme }) => {
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <SpannerIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                        PureFlowDesign for better World
                    </h1>
                </div>

                <div className="flex-1"></div>

                <div className="flex items-center space-x-4">
                     <div className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
                        Powered by Thoyam Cognitive
                    </div>
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                    <button onClick={onShowManuals} aria-label="Show Manuals" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <InformationCircleIcon className="w-7 h-7" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;