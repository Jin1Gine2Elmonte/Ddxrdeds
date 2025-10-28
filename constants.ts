
import type { Config } from './types';

export const DEFAULT_CONFIG: Config = {
    systemInstruction: "You are a helpful and versatile AI assistant. Respond in Markdown format.",
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    useGrounding: false,
};
