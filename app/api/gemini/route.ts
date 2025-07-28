import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const { message, conversationHistory = [], systemPrompt } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Format conversation history for Gemini
        const history = conversationHistory.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Add system prompt as first user message if provided
        if (systemPrompt) {
            history.unshift({
                role: 'user',
                parts: [{ text: 'System: ' + systemPrompt }]
            });
            history.splice(1, 0, {
                role: 'model',
                parts: [{ text: 'I understand. I will act according to these instructions.' }]
            });
        }

        const chat = model.startChat({
            history,
            generationConfig: {
                maxOutputTokens: 150,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // Clean the response for voice output
        const cleanedText = text
            .replace(/[*#_`]/g, '') // Remove markdown formatting
            .replace(/\n+/g, ' ') // Replace newlines with spaces
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();

        return NextResponse.json({ response: cleanedText });

    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: 'Failed to get response from AI' },
            { status: 500 }
        );
    }
}
