'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
}

interface UseSpeechRecognitionReturn {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    isListening: boolean;
    hasRecognitionSupport: boolean;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const useSpeechRecognition = (
    options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
    const {
        continuous = true,
        interimResults = true,
        lang = 'en-US'
    } = options;

    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                setHasRecognitionSupport(true);
                recognitionRef.current = new SpeechRecognition();
                const recognition = recognitionRef.current;

                recognition.continuous = continuous;
                recognition.interimResults = interimResults;
                recognition.lang = lang;

                recognition.onstart = () => {
                    console.log('Speech recognition started');
                    setIsListening(true);
                };

                recognition.onend = () => {
                    console.log('Speech recognition ended');
                    setIsListening(false);
                };

                recognition.onresult = (event: any) => {
                    let interim = '';
                    let final = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        if (result.isFinal) {
                            final += result[0].transcript;
                        } else {
                            interim += result[0].transcript;
                        }
                    }

                    setInterimTranscript(interim);
                    if (final) {
                        setFinalTranscript(prev => prev + final);
                        setTranscript(prev => prev + final);
                    }
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    setIsListening(false);

                    // Don't auto-restart on certain error types
                    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                        console.error('Speech recognition permission denied');
                    }
                };
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [continuous, interimResults, lang]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && hasRecognitionSupport && !isListening) {
            try {
                setTranscript('');
                setInterimTranscript('');
                setFinalTranscript('');
                recognitionRef.current.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                setIsListening(false);
            }
        }
    }, [hasRecognitionSupport, isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && hasRecognitionSupport && isListening) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.error('Error stopping speech recognition:', error);
                setIsListening(false);
            }
        }
    }, [hasRecognitionSupport, isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setFinalTranscript('');
    }, []);

    return {
        transcript,
        interimTranscript,
        finalTranscript,
        isListening,
        hasRecognitionSupport,
        startListening,
        stopListening,
        resetTranscript
    };
};
