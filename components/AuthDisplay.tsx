import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Enhanced interface to match the Auth component
interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
}

interface AuthDisplayProps {
  user: User | null;
  onSignOut: () => Promise<void> | void;
}

export default function AuthDisplay({ user, onSignOut }: AuthDisplayProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await onSignOut();
    } catch (error) {
      console.error('Sign out error in display:', error);
      Alert.alert(
        'Sign Out Error',
        'There was a problem signing you out. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: handleSignOut,
        },
      ]
    );
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';

    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getDisplayName = (): string => {
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      // Extract name from email if no display name
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'User';
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notSignedInContainer}>
          <Text style={styles.notSignedInText}>Not signed in</Text>
          <Text style={styles.notSignedInSubtext}>
            Please sign in to continue
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        {user.provider && (
          <View style={styles.providerBadge}>
            <Text style={styles.providerText}>
              {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <View style={styles.imageContainer}>
          {user.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={styles.profileImage}
              onError={() => console.log('Failed to load profile image')}
            />
          ) : (
            <View style={[styles.profileImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>
                {getInitials(user.displayName)}
              </Text>
            </View>
          )}
          <View style={styles.onlineIndicator} />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.displayName} numberOfLines={1}>
            {getDisplayName()}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>
          <Text style={styles.userId}>ID: {user.id.slice(0, 8)}...</Text>
        </View>
      </View>

      {/* Stats or Additional Info */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={styles.statValue}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Account</Text>
          <Text style={styles.statValue}>Verified</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => Alert.alert('Profile', 'Profile management coming soon!')}
          disabled={isSigningOut}
        >
          <Text style={styles.profileButtonText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.signOutButton,
            isSigningOut && styles.signOutButtonDisabled
          ]}
          onPress={confirmSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.signOutText, styles.loadingText]}>
                Signing out...
              </Text>
            </View>
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  providerBadge: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  providerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#f0f0f0',
  },
  placeholderImage: {
    backgroundColor: '#4285f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userId: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e1e1e1',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: 12,
  },
  profileButton: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#f44336',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonDisabled: {
    backgroundColor: '#ffcccb',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
  notSignedInContainer: {
    alignItems: 'center',
    padding: 40,
  },
  notSignedInText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  notSignedInSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});