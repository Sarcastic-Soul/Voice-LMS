'use client';

import { useEffect, useRef, useState } from 'react'
import { cn, getSubjectColor } from "@/lib/utils";
import { voiceAI } from "@/lib/vapi.sdk";
import { CallStatus } from "@/lib/services/customVoiceAI";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from '@/constants/soundwaves.json'
import { addToSessionHistory } from "@/lib/actions/companion.actions";

const CompanionComponent = ({
    companionId,
    subject,
    topic,
    name,
    userName,
    userImage,
    style,
    voice
}: CompanionComponentProps) => {
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const lastTranscriptRef = useRef<string>('');

    const {
        finalTranscript,
        isListening,
        hasRecognitionSupport,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeechRecognition({
        continuous: true,
        interimResults: true,
        lang: 'en-US'
    });

    // Handle speech recognition results
    useEffect(() => {
        if (finalTranscript && finalTranscript !== lastTranscriptRef.current && callStatus === CallStatus.ACTIVE) {
            lastTranscriptRef.current = finalTranscript;
            handleUserSpeech(finalTranscript);
            resetTranscript();
        }
    }, [finalTranscript, callStatus]);

    // Lottie animation control
    useEffect(() => {
        if (lottieRef.current) {
            if (isSpeaking) {
                lottieRef.current.play();
            } else {
                lottieRef.current.stop();
            }
        }
    }, [isSpeaking]);

    // Setup voice AI event listeners
    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
            if (hasRecognitionSupport) {
                startListening();
            }
        };

        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
            stopListening();
            addToSessionHistory(companionId);
        };

        const onMessage = (message: any) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = {
                    role: message.role,
                    content: message.transcript
                };
                setMessages((prev) => [newMessage, ...prev]);
            }
        };

        const onSpeechStart = () => {
            setIsSpeaking(true);
            setIsProcessing(false);
        };

        const onSpeechEnd = () => {
            setIsSpeaking(false);
        };

        const onError = (error: Error) => {
            console.error('Voice AI Error:', error);
            setIsProcessing(false);
        };

        voiceAI.on('call-start', onCallStart);
        voiceAI.on('call-end', onCallEnd);
        voiceAI.on('message', onMessage);
        voiceAI.on('error', onError);
        voiceAI.on('speech-start', onSpeechStart);
        voiceAI.on('speech-end', onSpeechEnd);

        return () => {
            voiceAI.off('call-start', onCallStart);
            voiceAI.off('call-end', onCallEnd);
            voiceAI.off('message', onMessage);
            voiceAI.off('error', onError);
            voiceAI.off('speech-start', onSpeechStart);
            voiceAI.off('speech-end', onSpeechEnd);
        };
    }, [companionId, hasRecognitionSupport, startListening, stopListening]);

    const handleUserSpeech = async (transcript: string) => {
        if (isProcessing || !transcript.trim()) return;

        setIsProcessing(true);
        await voiceAI.processUserSpeech(transcript, {
            subject,
            topic,
            style,
            voice
        });
    };

    const toggleMicrophone = () => {
        const newMutedState = !isMuted;
        voiceAI.setMuted(newMutedState);
        setIsMuted(newMutedState);

        if (newMutedState) {
            stopListening();
        } else if (callStatus === CallStatus.ACTIVE && hasRecognitionSupport) {
            startListening();
        }
    };

    const handleCall = async () => {
        if (!hasRecognitionSupport) {
            alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        setCallStatus(CallStatus.CONNECTING);

        try {
            await voiceAI.start({
                subject,
                topic,
                style,
                voice
            });
        } catch (error) {
            console.error('Failed to start voice AI:', error);
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        voiceAI.stop();
        stopListening();
    };

    return (
        <section className="flex flex-col h-[70vh]">
            <section className="flex gap-8 max-sm:flex-col">
                <div className="companion-section">
                    <div className="companion-avatar" style={{ backgroundColor: getSubjectColor(subject) }}>
                        <div
                            className={cn(
                                'absolute transition-opacity duration-1000',
                                callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                callStatus === CallStatus.CONNECTING && 'opacity-100 animate-pulse'
                            )}
                        >
                            <Image
                                src={`/icons/${subject}.svg`}
                                alt={subject}
                                width={150}
                                height={150}
                                className="max-sm:w-fit"
                            />
                        </div>

                        <div className={cn(
                            'absolute transition-opacity duration-1000',
                            callStatus === CallStatus.ACTIVE ? 'opacity-100' : 'opacity-0'
                        )}>
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={soundwaves}
                                autoplay={false}
                                className="companion-lottie"
                            />
                        </div>
                    </div>
                    <p className="font-bold text-2xl">{name}</p>
                </div>

                <div className="user-section">
                    <div className="user-avatar">
                        <Image
                            src={userImage}
                            alt={userName}
                            width={130}
                            height={130}
                            className="rounded-lg"
                        />
                        <p className="font-bold text-2xl">{userName}</p>
                    </div>

                    {!hasRecognitionSupport && (
                        <div className="text-red-500 text-sm text-center mb-2">
                            Speech recognition not supported in this browser
                        </div>
                    )}

                    <button
                        className="btn-mic"
                        onClick={toggleMicrophone}
                        disabled={callStatus !== CallStatus.ACTIVE}
                    >
                        <Image
                            src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'}
                            alt="mic"
                            width={36}
                            height={36}
                        />
                        <p className="max-sm:hidden">
                            {isMuted ? 'Turn on microphone' : 'Turn off microphone'}
                        </p>
                    </button>

                    <button
                        className={cn(
                            'rounded-lg py-2 cursor-pointer transition-colors w-full text-white',
                            callStatus === CallStatus.ACTIVE ? 'bg-red-700' : 'bg-primary',
                            callStatus === CallStatus.CONNECTING && 'animate-pulse',
                            !hasRecognitionSupport && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
                        disabled={!hasRecognitionSupport && callStatus === CallStatus.INACTIVE}
                    >
                        {callStatus === CallStatus.ACTIVE
                            ? "End Session"
                            : callStatus === CallStatus.CONNECTING
                                ? 'Connecting'
                                : 'Start Session'
                        }
                    </button>

                    {isProcessing && (
                        <div className="text-sm text-gray-500 text-center mt-2">
                            Processing...
                        </div>
                    )}

                    {isListening && callStatus === CallStatus.ACTIVE && (
                        <div className="text-sm text-green-500 text-center mt-2">
                            🎤 Listening...
                        </div>
                    )}
                </div>
            </section>

            <section className="transcript">
                <div className="transcript-message no-scrollbar">
                    {messages.map((message, index) => {
                        if (message.role === 'assistant') {
                            return (
                                <p key={index} className="max-sm:text-sm">
                                    {name.split(' ')[0].replace(/[.,]/g, '')}: {message.content}
                                </p>
                            );
                        } else {
                            return (
                                <p key={index} className="text-primary max-sm:text-sm">
                                    {userName}: {message.content}
                                </p>
                            );
                        }
                    })}
                </div>
                <div className="transcript-fade" />
            </section>
        </section>
    );
};

export default CompanionComponent;
