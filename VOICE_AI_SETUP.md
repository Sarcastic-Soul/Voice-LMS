# Voice LMS - Custom Voice AI Setup

This project uses a custom voice AI stack with:
- **Browser Speech Recognition** for speech-to-text
- **Google Gemini Flash 1.5** for AI conversations
- **Browser Speech Synthesis** for voice synthesis (Text-to-Speech)

## Required Environment Variables

Add these to your `.env` file:

```env
# Google AI Services
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

## Setup Instructions

### 1. Get Google AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to `NEXT_PUBLIC_GEMINI_API_KEY`

### 2. Browser Compatibility
Both speech recognition and synthesis features require a modern browser:
- ✅ Chrome/Chromium (Recommended)
- ✅ Edge
- ✅ Safari
- ❌ Firefox (limited support)

## Features

### Voice Recognition
- Real-time speech recognition using browser's built-in APIs
- Automatic transcript generation
- Visual feedback for listening state

### AI Conversation
- Powered by Google Gemini Flash 1.5
- Context-aware responses
- Subject and topic specific tutoring

### Text-to-Speech
- High-quality voice synthesis using browser's native Speech Synthesis API
- Multiple voice options available based on system/browser
- Real-time audio playback
- No external API calls required

## Usage

1. Start the development server: `npm run dev`
2. Navigate to a companion session
3. Click "Start Session" to begin voice interaction
4. Speak naturally - the system will respond with voice
5. Use the microphone button to mute/unmute
6. Click "End Session" to finish

## Troubleshooting

### Speech Recognition Not Working
- Ensure you're using a supported browser
- Check microphone permissions
- Try refreshing the page

### TTS Not Working
- Ensure you're using a supported browser
- Check that speech synthesis is available in your browser/system
- Try refreshing the page
- Check browser console for error messages

### AI Responses Not Working
- Verify Gemini API key is valid
- Check browser console for error messages
- Ensure you have API quota remaining
