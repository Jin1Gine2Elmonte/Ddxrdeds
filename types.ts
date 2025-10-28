
export interface GroundingSource {
    uri: string;
    title: string;
}

export interface LocalSource {
    id: string;
    title: string;
    content: string;
}

export interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    image?: string;
    sources?: GroundingSource[];
}

export interface Config {
    systemInstruction: string;
    temperature: number;
    topK: number;
    topP: number;
    useGrounding: boolean;
}
