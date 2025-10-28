
import React from 'react';
import { CodeIcon, ImageIcon, SearchIcon, SparklesIcon, FileTextIcon } from './icons/Icons';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-gray-800 p-4 rounded-lg text-center">
        <div className="flex justify-center mb-3">{icon}</div>
        <h3 className="font-semibold text-gray-400 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
    </div>
);

export const WelcomeScreen: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col justify-center items-center p-8 text-center">
            <div className="mb-8">
                <SparklesIcon className="w-16 h-16 text-blue-500 mx-auto" />
                <h1 className="text-4xl font-bold text-gray-400 mt-4">Gemini Pro Agent</h1>
                <p className="text-gray-500 mt-2 max-w-xl">
                    Your versatile AI assistant. Modify the system prompt, adjust parameters, and interact with text, images, and grounded search results.
                </p>
            </div>
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FeatureCard 
                    icon={<FileTextIcon className="w-8 h-8 text-purple-400" />}
                    title="Source Grounding"
                    description="Add your own documents for the AI to use as context."
                />
                <FeatureCard 
                    icon={<CodeIcon className="w-8 h-8 text-green-500" />}
                    title="Code Generation"
                    description="Ask for code snippets in any language."
                />
                 <FeatureCard 
                    icon={<ImageIcon className="w-8 h-8 text-blue-500" />}
                    title="Multimodal"
                    description="Upload an image and ask questions about it."
                />
                <FeatureCard 
                    icon={<SearchIcon className="w-8 h-8 text-yellow-500" />}
                    title="Search Grounding"
                    description="Get up-to-date answers from Google Search."
                />
            </div>
        </div>
    );
};
