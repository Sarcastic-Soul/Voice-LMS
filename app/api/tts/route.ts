import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize the Text-to-Speech client
const client = new TextToSpeechClient({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

export async function POST(request: NextRequest) {
    try {
        const { text, voiceId = 'en-US-Wavenet-D', style = 'neutral' } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Configure the TTS request
        const ttsRequest = {
            input: { text },
            voice: {
                languageCode: 'en-US',
                name: voiceId,
                ssmlGender: voiceId.includes('female') || voiceId.includes('Wavenet-A') || voiceId.includes('Wavenet-C') || voiceId.includes('Wavenet-E') || voiceId.includes('Wavenet-F') || voiceId.includes('Wavenet-G') || voiceId.includes('Wavenet-H')
                    ? 'FEMALE' as const
                    : 'MALE' as const,
            },
            audioConfig: {
                audioEncoding: 'MP3' as const,
                speakingRate: style === 'fast' ? 1.2 : style === 'slow' ? 0.8 : 1.0,
                pitch: 0,
                volumeGainDb: 0,
            },
        };

        // Perform the text-to-speech request
        const [response] = await client.synthesizeSpeech(ttsRequest);

        if (!response.audioContent) {
            throw new Error('No audio content received');
        }

        // Return the audio as a response
        return new NextResponse(response.audioContent as Uint8Array, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': response.audioContent.length.toString(),
            },
        });

    } catch (error) {
        console.error('TTS Error:', error);
        return NextResponse.json(
            { error: 'Failed to synthesize speech' },
            { status: 500 }
        );
    }
}
