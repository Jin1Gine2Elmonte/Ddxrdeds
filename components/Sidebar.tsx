
import React, { useState } from 'react';
import type { Config } from '../types';
import { SettingsIcon, CodeIcon, ChevronDownIcon, ChevronUpIcon } from './icons/Icons';

interface SidebarProps {
    config: Config;
    onConfigChange: (newConfig: Config) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ config, onConfigChange }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleConfigChange = <T extends keyof Config,>(key: T, value: Config[T]) => {
        onConfigChange({ ...config, [key]: value });
    };

    return (
        <aside className="w-80 bg-gray-800 border-r border-gray-700 p-4 flex flex-col h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-400 flex items-center">
                    <CodeIcon className="w-6 h-6 mr-2 text-blue-500" />
                    Gemini Agent
                </h1>
            </div>

            <div className="mb-6">
                <label htmlFor="system-instruction" className="block text-sm font-medium text-gray-500 mb-2">System Instruction</label>
                <textarea
                    id="system-instruction"
                    rows={6}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={config.systemInstruction}
                    onChange={(e) => handleConfigChange('systemInstruction', e.target.value)}
                    placeholder="e.g., You are a helpful AI assistant."
                />
            </div>

            <div className="border-t border-gray-700 pt-4">
                 <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-400 mb-2 focus:outline-none">
                    <span className="flex items-center">
                        <SettingsIcon className="w-5 h-5 mr-2" />
                        Configuration
                    </span>
                    {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </button>
               {isExpanded && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                         <label htmlFor="grounding" className="text-sm text-gray-500">Google Search Grounding</label>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="grounding"
                                checked={config.useGrounding}
                                onChange={(e) => handleConfigChange('useGrounding', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                    <div>
                        <label htmlFor="temperature" className="block text-sm text-gray-500 mb-1">Temperature: {config.temperature.toFixed(2)}</label>
                        <input
                            type="range"
                            id="temperature"
                            min="0"
                            max="1"
                            step="0.01"
                            value={config.temperature}
                            onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                     <div>
                        <label htmlFor="topP" className="block text-sm text-gray-500 mb-1">Top P: {config.topP.toFixed(2)}</label>
                        <input
                            type="range"
                            id="topP"
                            min="0"
                            max="1"
                            step="0.01"
                            value={config.topP}
                            onChange={(e) => handleConfigChange('topP', parseFloat(e.target.value))}
                           className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                     <div>
                        <label htmlFor="topK" className="block text-sm text-gray-500 mb-1">Top K: {config.topK}</label>
                        <input
                            type="range"
                            id="topK"
                            min="1"
                            max="120"
                            step="1"
                            value={config.topK}
                            onChange={(e) => handleConfigChange('topK', parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
               )}
            </div>
            <div className="mt-auto pt-4 text-xs text-gray-600 text-center">
                <p>Powered by Gemini</p>
            </div>
        </aside>
    );
};
