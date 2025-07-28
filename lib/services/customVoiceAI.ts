'use client';

import { GeminiService } from './geminiService';

export enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

export interface VoiceMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface VoiceAIConfig {
    subject: string;
    topic: string;
    style: string;
    voice: string;
}

export type VoiceAIEventType =
    | 'call-start'
    | 'call-end'
    | 'message'
    | 'speech-start'
    | 'speech-end'
    | 'error';

export type VoiceAIEventHandler = (data?: any) => void;

export class CustomVoiceAI {
    private geminiService: GeminiService;
    private eventHandlers: Map<VoiceAIEventType, VoiceAIEventHandler[]> = new Map();
    private isActive = false;
    private isMuted = false;
    private currentAudio: HTMLAudioElement | null = null;
    private messages: VoiceMessage[] = [];

    constructor() {
        this.geminiService = new GeminiService();

        // Initialize event handler arrays
        this.eventHandlers.set('call-start', []);
        this.eventHandlers.set('call-end', []);
        this.eventHandlers.set('message', []);
        this.eventHandlers.set('speech-start', []);
        this.eventHandlers.set('speech-end', []);
        this.eventHandlers.set('error', []);
    }

    on(event: VoiceAIEventType, handler: VoiceAIEventHandler) {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.push(handler);
        this.eventHandlers.set(event, handlers);
    }

    off(event: VoiceAIEventType, handler: VoiceAIEventHandler) {
        const handlers = this.eventHandlers.get(event) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }

    private emit(event: VoiceAIEventType, data?: any) {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.forEach(handler => handler(data));
    }

    async start(config: VoiceAIConfig) {
        try {
            this.isActive = true;
            this.emit('call-start');

            // Initialize Gemini with system prompt
            const systemPrompt = `You are a highly knowledgeable tutor teaching a real-time voice session with a student. Your goal is to teach the student about the topic and subject.

      Tutor Guidelines:
      Stick to the given topic - {{ topic }} and subject - {{ subject }} and teach the student about it.
      Keep the conversation flowing smoothly while maintaining control.
      From time to time make sure that the student is following you and understands you.
      Break down the topic into smaller parts and teach the student one part at a time.
      Keep your style of conversation {{ style }}.
      Keep your responses short, like in a real voice conversation.
      Do not include any special characters in your responses - this is a voice conversation.`;

            const greeting = await this.geminiService.initializeChat(
                systemPrompt,
                config.subject,
                config.topic,
                config.style
            );

            // Add greeting message and speak it
            const greetingMessage: VoiceMessage = {
                role: 'assistant',
                content: greeting,
                timestamp: Date.now()
            };

            this.addMessage(greetingMessage);
            await this.speakText(greeting, config.voice);

        } catch (error) {
            console.error('Error starting voice AI:', error);
            this.emit('error', error);
        }
    }

    stop() {
        this.isActive = false;
        this.stopCurrentAudio();
        this.geminiService.clearHistory();
        this.messages = [];
        this.emit('call-end');
    }

    async processUserSpeech(transcript: string, config: VoiceAIConfig) {
        if (!this.isActive || !transcript.trim()) return;

        // Add user message
        const userMessage: VoiceMessage = {
            role: 'user',
            content: transcript,
            timestamp: Date.now()
        };
        this.addMessage(userMessage);

        try {
            // Get response from Gemini
            const response = await this.geminiService.sendMessage(transcript);

            // Add assistant message
            const assistantMessage: VoiceMessage = {
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };
            this.addMessage(assistantMessage);

            // Speak the response
            await this.speakText(response, config.voice);

        } catch (error) {
            console.error('Error processing user speech:', error);
            this.emit('error', error);
        }
    }

    private async speakText(text: string, voice: string) {
        if (!this.isActive || this.isMuted) return;

        try {
            this.emit('speech-start');

            // Call our TTS API
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    voiceId: this.getGoogleVoiceId(voice),
                    style: 'neutral'
                }),
            });

            if (!response.ok) {
                throw new Error('TTS request failed');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            this.currentAudio = new Audio(audioUrl);

            this.currentAudio.onended = () => {
                this.emit('speech-end');
                URL.revokeObjectURL(audioUrl);
            };

            this.currentAudio.onerror = () => {
                this.emit('speech-end');
                this.emit('error', new Error('Audio playback failed'));
                URL.revokeObjectURL(audioUrl);
            };

            await this.currentAudio.play();

        } catch (error) {
            console.error('Error speaking text:', error);
            this.emit('speech-end');
            this.emit('error', error);
        }
    }

    private getGoogleVoiceId(voice: string): string {
        // Map your voice names to Google Cloud TTS voice IDs
        const voiceMap: Record<string, string> = {
            'sarah': 'en-US-Wavenet-C',
            'john': 'en-US-Wavenet-D',
            'emily': 'en-US-Wavenet-E',
            'michael': 'en-US-Wavenet-B',
            'default': 'en-US-Wavenet-D'
        };

        return voiceMap[voice] || voiceMap['default'];
    }

    private addMessage(message: VoiceMessage) {
        this.messages.push(message);
        this.emit('message', {
            type: 'transcript',
            transcriptType: 'final',
            role: message.role,
            transcript: message.content
        });
    }

    private stopCurrentAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
            this.emit('speech-end');
        }
    }

    setMuted(muted: boolean) {
        this.isMuted = muted;
        if (muted) {
            this.stopCurrentAudio();
        }
    }

    isMutedState(): boolean {
        return this.isMuted;
    }

    getMessages(): VoiceMessage[] {
        return this.messages;
    }

    isActiveState(): boolean {
        return this.isActive;
    }
}
