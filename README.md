# Phillipian Mobile App

Welcome to _The Phillipian_ vol. CXLVII's Mobile App

developed and maintained by Tianyi Gu, Managing Editor, CXLVII

(to be released on iOS and Android web store)
Access _The Phillipian's_ online website [here](https://phillipian.net)!


# Running Locally

## Get Started

Install dev dependencies:

### `npm install`

### For iOS Development

1. Install Cocoapods if you haven't already:
   ```bash
   sudo gem install cocoapods
   ```

2. Generate native iOS project files:
   ```bash
   npx expo prebuild
   ```

3. Open the iOS project in Xcode:
   ```bash
   open ios/*.xcworkspace
   ```

## Run The App

### `npm start`

Runs your app in development mode.

Install the [Expo app](https://expo.io) on your phone and scan the generated QR code.

### `npm run ios/npm run android`

Opens app on iOS or Android Simulator (installation needed)

## Features

### Article Summarization
The app now includes an AI-powered article summarization feature:
- Click the "Generate Summary" button at the bottom of any article
- View a concise summary in a modal panel
- Close the summary with the X button to return to the article

### Backend Setup
The summarization feature requires a Flask backend server:
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the Flask server:
   ```bash
   python server/app.py
   ```

The server runs on port 5001 and provides the `/api/summarize` endpoint for article summarization.

### Configuration
- Update `src/config/api.ts` with your local server IP address
- Default port is 5001
- Make sure your device and server are on the same network

## Development Notes
- The app uses React Native with Expo
- Backend uses Flask with CORS enabled
- Article summaries are generated in real-time
- Dark mode support throughout the app
