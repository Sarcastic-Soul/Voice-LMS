# Voice LMS - Custom Voice AI Setup

This project has been updated to use a custom voice AI stack replacing VAPI with:
- **Browser Speech Recognition** for speech-to-text
- **Google Gemini Flash 1.5** for AI conversations
- **Google Cloud Text-to-Speech** for voice synthesis

## Required Environment Variables

Add these to your `.env` file:

```env
# Google AI & Cloud Services
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
GOOGLE_CLOUD_PRIVATE_KEY=your_private_key_here
GOOGLE_CLOUD_CLIENT_EMAIL=your_client_email_here
```

## Setup Instructions

### 1. Get Google AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to `NEXT_PUBLIC_GEMINI_API_KEY`

### 2. Setup Google Cloud Text-to-Speech
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Text-to-Speech API
4. Create a service account:
   - Go to IAM & Admin > Service Accounts
   - Create new service account
   - Grant "Text-to-Speech Client" role
   - Create and download JSON key
5. Extract the following from the JSON key:
   - `project_id` → `GOOGLE_CLOUD_PROJECT_ID`
   - `private_key` → `GOOGLE_CLOUD_PRIVATE_KEY`
   - `client_email` → `GOOGLE_CLOUD_CLIENT_EMAIL`

### 3. Browser Compatibility
The speech recognition feature requires a modern browser:
- ✅ Chrome/Chromium
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
- High-quality voice synthesis using Google Cloud
- Multiple voice options
- Real-time audio playback

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
- Verify Google Cloud credentials are correct
- Check that Text-to-Speech API is enabled
- Ensure the service account has proper permissions

### AI Responses Not Working
- Verify Gemini API key is valid
- Check browser console for error messages
- Ensure you have API quota remaining
