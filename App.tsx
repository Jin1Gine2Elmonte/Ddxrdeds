
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { PromptInput } from './components/PromptInput';
import { Chat, GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Message, Config, GroundingSource } from './types';
import { DEFAULT_CONFIG } from './constants';
import { WelcomeScreen } from './components/WelcomeScreen';

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chatRef = useRef<Chat | null>(null);

    const getChatSession = useCallback((newConfig: Config) => {
        // Do not create a new GoogleGenAI instance on every call.
        // It should be created once, but for the sake of simplicity in this example
        // we recreate it to apply new config. A better approach would be to manage this instance.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: newConfig.systemInstruction,
                temperature: newConfig.temperature,
                topK: newConfig.topK,
                topP: newConfig.topP,
                tools: newConfig.useGrounding ? [{ googleSearch: {} }] : [],
            },
        });
    }, []);

    useEffect(() => {
        getChatSession(config);
    }, [config.systemInstruction, config.temperature, config.topP, config.topK, config.useGrounding, getChatSession]);


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
            if (!chatRef.current) {
                getChatSession(config);
            }

            if (!chatRef.current) {
                throw new Error("Chat session not initialized");
            }

            // FIX: Correctly construct the 'parts' array for multimodal input to avoid a TypeScript type error.
            const parts = [];
            if (image) {
                parts.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
            }
            parts.push({ text: prompt });

            const result = await chatRef.current.sendMessageStream({
                message: { parts },
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
            <Sidebar config={config} onConfigChange={setConfig} />
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
