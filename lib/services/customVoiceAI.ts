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
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private messages: VoiceMessage[] = [];
    private speechSynthesis: SpeechSynthesis | null = null;

    constructor() {
        this.geminiService = new GeminiService();

        // Initialize Speech Synthesis if available
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
        }

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
    } async start(config: VoiceAIConfig) {
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
            console.error('❌ CustomVoiceAI: Error starting voice AI:', error);
            this.emit('error', error);
        }
    } stop() {
        console.log('🛑 CustomVoiceAI: Stopping voice AI session', {
            isActive: this.isActive,
            currentUtterance: !!this.currentUtterance,
            messagesCount: this.messages.length
        });

        this.isActive = false;
        console.log('✅ CustomVoiceAI: Set isActive to false');

        this.stopCurrentAudio();
        console.log('🔇 CustomVoiceAI: Stopped current audio');

        this.geminiService.clearHistory();
        console.log('🗑️ CustomVoiceAI: Cleared Gemini history');

        this.messages = [];
        console.log('📝 CustomVoiceAI: Cleared messages array');

        this.emit('call-end');
        console.log('📢 CustomVoiceAI: Emitted call-end event');
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

            // Speak the response and wait for completion
            await this.speakText(response, config.voice);

        } catch (error) {
            console.error('❌ CustomVoiceAI: Error processing user speech:', error);
            this.emit('error', error);
            this.emit('speech-end');
        }
    }

    private async speakText(text: string, voice: string): Promise<void> {
        if (!this.isActive || this.isMuted || !this.speechSynthesis) return;

        return new Promise((resolve) => {
            try {
                this.emit('speech-start');

                // Stop any current speech
                this.speechSynthesis!.cancel();

                // Create new utterance
                const utterance = new SpeechSynthesisUtterance(text);
                this.currentUtterance = utterance;

                // Configure utterance
                utterance.rate = 1;
                utterance.pitch = 1;
                utterance.volume = 1;
                utterance.lang = 'en-US';

                // Set voice based on the voice parameter
                let voices = this.speechSynthesis!.getVoices();

                // If voices are not loaded yet, try to load them
                if (voices.length === 0) {
                    const loadVoices = () => {
                        voices = this.speechSynthesis!.getVoices();
                    };
                    this.speechSynthesis!.addEventListener('voiceschanged', loadVoices);
                    setTimeout(() => {
                        this.speechSynthesis!.removeEventListener('voiceschanged', loadVoices);
                    }, 100);
                }

                const selectedVoice = this.getWebSpeechVoice(voice, voices);
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }

                // Safety timeout to prevent hanging
                const timeout = setTimeout(() => {
                    console.log('⏰ CustomVoiceAI: Speech timeout - forcing completion');
                    this.currentUtterance = null;
                    this.emit('speech-end');
                    resolve();
                }, 15000);

                // Set up event handlers
                utterance.onend = () => {
                    clearTimeout(timeout);
                    this.currentUtterance = null;
                    this.emit('speech-end');
                    resolve();
                };

                utterance.onerror = (event) => {
                    console.error('❌ CustomVoiceAI: Speech synthesis error:', {
                        error: event.error,
                        type: event.type
                    });
                    clearTimeout(timeout);
                    this.currentUtterance = null;
                    this.emit('speech-end');
                    const error = new Error(`Speech synthesis error: ${event.error}`);
                    this.emit('error', error);
                    resolve();
                };

                // Start speaking
                this.speechSynthesis!.speak(utterance);

                // Workaround for Chrome speech synthesis queue issues
                if (this.speechSynthesis!.paused && this.speechSynthesis!.speaking) {
                    this.speechSynthesis!.resume();
                }

            } catch (error) {
                console.error('❌ CustomVoiceAI: Error in speakText:', error);
                this.emit('speech-end');
                this.emit('error', error);
                resolve();
            }
        });
    }

    private getWebSpeechVoice(voice: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
        // Map your voice names to browser speech synthesis voices
        const voiceMap: Record<string, string[]> = {
            'sarah': ['female', 'woman', 'sarah'],
            'john': ['male', 'man', 'john'],
            'emily': ['female', 'woman', 'emily'],
            'michael': ['male', 'man', 'michael'],
            'female': ['female', 'woman'],
            'male': ['male', 'man'],
            'default': ['male', 'man']
        };

        const searchTerms = voiceMap[voice] || voiceMap['default'];

        // Find a voice that matches any of the search terms
        for (const term of searchTerms) {
            const matchedVoice = voices.find(v =>
                v.name.toLowerCase().includes(term) ||
                v.voiceURI.toLowerCase().includes(term)
            );
            if (matchedVoice) {
                return matchedVoice;
            }
        }

        // Fallback to first available voice of preferred gender
        const preferredGender = searchTerms.includes('female') ? 'female' : 'male';
        const genderVoice = voices.find(v =>
            v.name.toLowerCase().includes(preferredGender) ||
            v.voiceURI.toLowerCase().includes(preferredGender)
        );

        // Final fallback to any English voice or first available voice
        return genderVoice ||
            voices.find(v => v.lang.startsWith('en')) ||
            voices[0] ||
            null;
    } private addMessage(message: VoiceMessage) {
        console.log('📝 CustomVoiceAI: Adding message to conversation', {
            role: message.role,
            contentLength: message.content.length,
            contentPreview: message.content.substring(0, 50) + '...',
            timestamp: message.timestamp,
            totalMessages: this.messages.length + 1
        });

        this.messages.push(message);
        this.emit('message', {
            type: 'transcript',
            transcriptType: 'final',
            role: message.role,
            transcript: message.content
        });

        console.log('📢 CustomVoiceAI: Emitted message event for transcript');
    }

    private stopCurrentAudio() {
        if (this.speechSynthesis && this.currentUtterance) {
            this.speechSynthesis.cancel();
            this.currentUtterance = null;
            this.emit('speech-end');
        }
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
    } setMuted(muted: boolean) {
        console.log('🔇 CustomVoiceAI: Setting muted state', {
            previousMuted: this.isMuted,
            newMuted: muted,
            isActive: this.isActive,
            hasCurrentUtterance: !!this.currentUtterance
        });

        this.isMuted = muted;
        if (muted) {
            console.log('🔇 CustomVoiceAI: Muted - stopping current audio');
            this.stopCurrentAudio();
        }

        console.log('✅ CustomVoiceAI: Mute state updated successfully');
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
