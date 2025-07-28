'use client';

export interface GeminiMessage {
    role: 'user' | 'assistant';
    content: string;
}

export class GeminiService {
    private conversationHistory: GeminiMessage[] = [];
    private systemPrompt = '';

    async initializeChat(systemPrompt: string, subject: string, topic: string, style: string) {
        this.systemPrompt = systemPrompt
            .replace(/\{\{ topic \}\}/g, topic)
            .replace(/\{\{ subject \}\}/g, subject)
            .replace(/\{\{ style \}\}/g, style);

        this.conversationHistory = [];

        // Return initial greeting
        const greeting = `Hello, let's start the session. Today we'll be talking about ${topic}.`;
        return greeting;
    }

    async sendMessage(userMessage: string): Promise<string> {
        try {
            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: this.conversationHistory.slice(0, -1), // Don't include the current message
                    systemPrompt: this.systemPrompt
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from Gemini API');
            }

            const data = await response.json();
            const aiResponse = data.response;

            // Add AI response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });

            return aiResponse;
        } catch (error) {
            console.error('Error sending message to Gemini:', error);
            return 'I apologize, but I encountered an error. Could you please try again?';
        }
    }

    getConversationHistory(): GeminiMessage[] {
        return this.conversationHistory;
    }

    clearHistory() {
        this.conversationHistory = [];
        this.systemPrompt = '';
    }
}
