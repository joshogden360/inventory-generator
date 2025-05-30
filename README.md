# Google SDK Spatial Understanding - AI Household Inventory

An AI-powered household item cataloging system that uses Google Gemini to detect and catalog items from images.

## Features
- Upload images or use webcam to capture household items
- AI-powered object detection using Google Gemini
- Interactive bounding boxes for detected items
- Export inventory list of detected items

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your API key:
   - Create a `.env.local` file (NOT `.env`)
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your-api-key-here
     ```
   - Get your API key from: https://makersuite.google.com/app/apikey

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Troubleshooting

Having issues? Check out our comprehensive [Troubleshooting Guide](TROUBLESHOOTING.md) for:
- Quick diagnostics
- Common error solutions
- Environment setup help
- API configuration issues

## Quick Debug

Open browser console (F12) and verify:
```
Gemini API Key present: true
API Key length: 39
GoogleGenerativeAI initialized successfully
```

If you see any `false` values or errors, refer to the [Troubleshooting Guide](TROUBLESHOOTING.md).
