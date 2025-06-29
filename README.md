# React Native OAuth with Supabase

A React Native application demonstrating OAuth authentication using Supabase and Google Sign-In. This project is built with Expo and TypeScript, providing a robust foundation for mobile authentication.

## Features

- 🔐 Google OAuth Authentication
- 📱 Native Google Sign-In on Android
- 🔄 Session Management
- 🎨 Clean and Modern UI
- 🛡️ TypeScript Support
- 📦 Supabase Backend Integration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Google Cloud Console project with OAuth credentials
- Supabase project

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd rn-oauth-supabase
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Running the App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

## Project Structure

- `/app` - Expo Router configuration and main screens
- `/components` - React components including authentication UI
- `/lib` - Utility functions and Supabase configuration
- `/assets` - Static assets like images and fonts

## Authentication Flow

1. The app initializes Google Sign-In configuration on startup
2. Users can sign in using their Google account
3. Upon successful Google authentication, the token is sent to Supabase
4. Supabase validates the token and creates/updates the user session
5. The app maintains the session using AsyncStorage

## Key Dependencies

- `@supabase/supabase-js`: Supabase JavaScript client
- `@react-native-google-signin/google-signin`: Native Google Sign-In
- `expo-web-browser`: Web authentication handling
- `@react-native-async-storage/async-storage`: Session persistence
- `expo-router`: File-based routing

## Error Handling

The application includes comprehensive error handling for:
- Google Sign-In configuration issues
- Authentication failures
- Network errors
- Session management problems

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

1. Google Sign-In Configuration
   - Ensure your Google Cloud Console project is properly configured
   - Verify the correct Web Client ID in environment variables
   - Check that OAuth consent screen is configured

2. Supabase Connection
   - Verify Supabase URL and Anon Key in environment variables
   - Ensure Supabase project has Google OAuth enabled
   - Check CORS configuration in Supabase dashboard

3. Android Build Issues
   - Verify Android SDK installation
   - Check gradle configuration
   - Ensure debug.keystore is properly configured

For more help, please check the [issues](https://github.com/eaaaarl/rn-oauth-supabase/issues) section or create a new issue.
