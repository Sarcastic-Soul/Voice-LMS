'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SpeechSynthesisOptions {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
}

export interface SpeechSynthesisHook {
    speak: (text: string, options?: SpeechSynthesisOptions) => Promise<void>;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    isSpeaking: boolean;
    isPaused: boolean;
    isSupported: boolean;
    voices: SpeechSynthesisVoice[];
    getVoiceByName: (name: string) => SpeechSynthesisVoice | undefined;
}

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const resolveRef = useRef<(() => void) | null>(null);
    const rejectRef = useRef<((error: Error) => void) | null>(null);

    // Check if Speech Synthesis is supported
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // Load available voices
    useEffect(() => {
        if (!isSupported) return;

        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        // Load voices immediately if available
        loadVoices();

        // Some browsers need to wait for the voiceschanged event
        speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        };
    }, [isSupported]);

    const speak = useCallback(async (text: string, options: SpeechSynthesisOptions = {}): Promise<void> => {
        if (!isSupported || !text.trim()) {
            return Promise.reject(new Error('Speech synthesis not supported or empty text'));
        }

        // Stop any current speech
        speechSynthesis.cancel();

        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);

            // Set options
            utterance.rate = options.rate ?? 1;
            utterance.pitch = options.pitch ?? 1;
            utterance.volume = options.volume ?? 1;
            utterance.lang = options.lang ?? 'en-US';

            // Set voice if specified
            if (options.voice) {
                const selectedVoice = voices.find(voice =>
                    voice.name.toLowerCase().includes(options.voice!.toLowerCase()) ||
                    voice.voiceURI.toLowerCase().includes(options.voice!.toLowerCase())
                );
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
            }

            // Event handlers
            utterance.onstart = () => {
                setIsSpeaking(true);
                setIsPaused(false);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                setIsPaused(false);
                utteranceRef.current = null;
                if (resolveRef.current) {
                    resolveRef.current();
                    resolveRef.current = null;
                }
            };

            utterance.onerror = (event) => {
                setIsSpeaking(false);
                setIsPaused(false);
                utteranceRef.current = null;
                const error = new Error(`Speech synthesis error: ${event.error}`);
                if (rejectRef.current) {
                    rejectRef.current(error);
                    rejectRef.current = null;
                }
            };

            utterance.onpause = () => {
                setIsPaused(true);
            };

            utterance.onresume = () => {
                setIsPaused(false);
            };

            // Store references
            utteranceRef.current = utterance;
            resolveRef.current = resolve;
            rejectRef.current = reject;

            // Start speaking
            speechSynthesis.speak(utterance);
        });
    }, [isSupported, voices]);

    const stop = useCallback(() => {
        if (!isSupported) return;

        speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;

        if (resolveRef.current) {
            resolveRef.current();
            resolveRef.current = null;
        }
    }, [isSupported]);

    const pause = useCallback(() => {
        if (!isSupported || !isSpeaking) return;

        speechSynthesis.pause();
        setIsPaused(true);
    }, [isSupported, isSpeaking]);

    const resume = useCallback(() => {
        if (!isSupported || !isPaused) return;

        speechSynthesis.resume();
        setIsPaused(false);
    }, [isSupported, isPaused]);

    const getVoiceByName = useCallback((name: string): SpeechSynthesisVoice | undefined => {
        return voices.find(voice =>
            voice.name.toLowerCase().includes(name.toLowerCase()) ||
            voice.voiceURI.toLowerCase().includes(name.toLowerCase())
        );
    }, [voices]);

    return {
        speak,
        stop,
        pause,
        resume,
        isSpeaking,
        isPaused,
        isSupported,
        voices,
        getVoiceByName
    };
};
