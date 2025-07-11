import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../lib/supabase';
import AuthDisplay from './AuthDisplay';

WebBrowser.maybeCompleteAuthSession();

// Enhanced user interface
interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
}

// Google Sign-In Button Component
const GoogleSignInButton = ({ onPress, loading, disabled }: {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.googleButton,
        (disabled || loading) && styles.googleButtonDisabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.googleButtonContent}>
        {loading ? (
          <ActivityIndicator size="small" color="#4285f4" style={styles.googleIcon} />
        ) : (
          <View style={styles.googleIconContainer}>
            <Text style={styles.googleG}>G</Text>
          </View>
        )}
        <Text style={[
          styles.googleButtonText,
          (disabled || loading) && styles.googleButtonTextDisabled
        ]}>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Configure Google Sign In with better error handling
const configureGoogleSignIn = () => {
  try {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

    if (!webClientId) {
      console.error('Google Web Client ID not found in environment variables');
      return false;
    }

    GoogleSignin.configure({
      webClientId,
      offlineAccess: false,
      forceCodeForRefreshToken: true, // Ensures refresh token is available
      scopes: ['profile', 'email'], // Explicitly define scopes
    });

    return true;
  } catch (error) {
    console.error('Error configuring Google Sign-In:', error);
    return false;
  }
};

export default function Auth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
    isConfigured: false
  });

  useEffect(() => {
    const isConfigured = configureGoogleSignIn();
    setAuthState(prev => ({ ...prev, isConfigured }));

    // Check for existing session
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuthState(prev => ({
          ...prev,
          user: {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            photoURL: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            provider: 'google'
          }
        }));
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    }
  };

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  const signInWithGoogle = async () => {
    try {
      updateAuthState({ loading: true, error: null });

      // Platform check
      if (Platform.OS !== 'android') {
        throw new Error('Google Sign-In is currently only available on Android');
      }

      // Configuration check
      if (!authState.isConfigured) {
        throw new Error('Google Sign-In is not properly configured');
      }

      // Check Play Services availability
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign out any existing user first (optional but recommended)
      await GoogleSignin.signOut();

      // Perform sign in
      const result = await GoogleSignin.signIn();

      if (!result.data) {
        throw new Error('No user data received from Google');
      }

      const { user: googleUser, idToken } = result.data;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        throw new Error(`Supabase authentication failed: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('No user data received from Supabase');
      }

      // Update user state
      const userData: User = {
        id: data.user.id,
        email: data.user.email || googleUser.email,
        displayName: googleUser.name || '',
        photoURL: googleUser.photo || '',
        provider: 'google'
      };

      updateAuthState({ user: userData, error: null });

    } catch (error) {
      let errorMessage = 'An unexpected error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Google Sign-In specific errors
        const googleError = error as any;
        switch (googleError.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            errorMessage = 'Sign-in was cancelled';
            break;
          case statusCodes.IN_PROGRESS:
            errorMessage = 'Sign-in is already in progress';
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage = 'Google Play Services is not available';
            break;
          default:
            errorMessage = googleError.message || 'Google Sign-In failed';
        }
      }

      console.error('Google Sign-In Error:', error);
      updateAuthState({ error: errorMessage });

      // Show user-friendly error
      Alert.alert(
        'Sign-In Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const signOut = async () => {
    try {
      updateAuthState({ loading: true, error: null });

      // Sign out from Google
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.warn('Google sign-out error (non-critical):', error);
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(`Sign-out failed: ${error.message}`);
      }

      updateAuthState({ user: null });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign-out failed';
      console.error('Sign-out error:', error);
      updateAuthState({ error: errorMessage });

      Alert.alert(
        'Sign-Out Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      updateAuthState({ loading: false });
    }
  };

  if (!authState.isConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Google Sign-In configuration error. Please check your environment variables.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {authState.user ? (
        <AuthDisplay user={authState.user} onSignOut={signOut} />
      ) : (
        <View style={styles.signInContainer}>
          <GoogleSignInButton
            onPress={signInWithGoogle}
            loading={authState.loading}
            disabled={authState.loading}
          />

          {authState.error && (
            <Text style={styles.errorText}>{authState.error}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signInContainer: {
    alignItems: 'center',
    width: '100%',
  },
  // Google Button Styles
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 240,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e8eaed',
    opacity: 0.6,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconContainer: {
    width: 18,
    height: 18,
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4285f4',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3c4043',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'center',
  },
  googleButtonTextDisabled: {
    color: '#9aa0a6',
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
});