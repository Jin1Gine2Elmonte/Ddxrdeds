
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { PromptInput } from './components/PromptInput';
import { GoogleGenAI } from "@google/genai";
import type { Message, Config, GroundingSource, LocalSource } from './types';
import { DEFAULT_CONFIG } from './constants';
import { WelcomeScreen } from './components/WelcomeScreen';

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [localSources, setLocalSources] = useState<LocalSource[]>([]);
    const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendMessage = async (prompt: string, image: { data: string; mimeType: string } | null) => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: prompt,
            image: image ? `data:${image.mimeType};base64,${image.data}` : undefined,
        };
        setMessages(prev => [...prev, userMessage]);

        const aiMessageId = (Date.now() + 1).toString();
        const aiMessagePlaceholder: Message = {
            id: aiMessageId,
            role: 'model',
            text: '',
        };
        setMessages(prev => [...prev, aiMessagePlaceholder]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const history = messages.map(msg => {
                const parts: ({ text: string } | { inlineData: { mimeType: string, data: string } })[] = [];
                if (msg.text) {
                    parts.push({ text: msg.text });
                }
                if (msg.role === 'user' && msg.image) {
                    const [meta, base64Data] = msg.image.split(',');
                    const mimeType = meta.match(/:(.*?);/)?.[1];
                    if (mimeType && base64Data) {
                        parts.push({ inlineData: { mimeType, data: base64Data } });
                    }
                }
                return { role: msg.role, parts };
            }).filter(h => h.parts.length > 0);

            let sourceContext = '';
            if (localSources.length > 0) {
                const sourceText = localSources.map(s => `Title: ${s.title}\nContent:\n${s.content}`).join('\n\n---\n\n');
                sourceContext = `Please use the following sources to answer the user's question. Respond with "I don't have enough information in the provided sources" if you cannot answer from the context.\n\nSOURCES:\n${sourceText}\n\n---\n\n`;
            }

            const userParts: ({ text: string } | { inlineData: { mimeType: string, data: string } })[] = [];
            if (image) {
                userParts.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
            }
            userParts.push({ text: `${sourceContext}${prompt}` });
            
            const result = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: [...history, { role: 'user', parts: userParts }],
                systemInstruction: config.systemInstruction,
                generationConfig: {
                    temperature: config.temperature,
                    topK: config.topK,
                    topP: config.topP,
                },
                tools: config.useGrounding ? [{ googleSearch: {} }] : [],
            });
            
            let fullText = '';
            let groundingSources: GroundingSource[] = [];

            for await (const chunk of result) {
                const chunkText = chunk.text;
                fullText += chunkText;

                const metadata = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (metadata) {
                    const sources = metadata
                        .filter((item: any) => item.web)
                        .map((item: any) => ({
                            uri: item.web.uri,
                            title: item.web.title || 'Untitled Source',
                        }));
                    groundingSources = [...new Map([...groundingSources, ...sources].map(item => [item.uri, item])).values()];
                }

                setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId ? { ...msg, text: fullText, sources: groundingSources.length > 0 ? groundingSources : undefined } : msg
                ));
            }

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Error: ${errorMessage}`);
            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId ? { ...msg, text: `Sorry, I encountered an error: ${errorMessage}` } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-screen bg-gray-900 font-sans">
            <Sidebar 
                config={config} 
                onConfigChange={setConfig}
                localSources={localSources}
                onLocalSourcesChange={setLocalSources}
            />
            <main className="flex-1 flex flex-col h-screen">
                {messages.length === 0 ? (
                    <WelcomeScreen />
                ) : (
                    <ChatWindow messages={messages} />
                )}
                <PromptInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    error={error}
                />
            </main>
        </div>
    );
};

export default App;
