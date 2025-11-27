import React from 'react';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import ComputerDesktopIcon from './icons/ComputerDesktopIcon';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        const transitions: Record<Theme, Theme> = {
            light: 'dark',
            dark: 'system',
            system: 'light',
        };
        setTheme(transitions[theme]);
    };

    const icons: Record<Theme, React.ReactNode> = {
        light: <SunIcon className="w-6 h-6" />,
        dark: <MoonIcon className="w-6 h-6" />,
        system: <ComputerDesktopIcon className="w-6 h-6" />,
    };

    const labels: Record<Theme, string> = {
        light: 'Switch to dark mode',
        dark: 'Switch to system theme',
        system: 'Switch to light mode',
    };

    return (
        <button
            onClick={toggleTheme}
            aria-label={labels[theme]}
            className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
            {icons[theme]}
        </button>
    );
};

export default ThemeToggle;
