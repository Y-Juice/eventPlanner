import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/styles';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.replace('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || 'Not available'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{user?.id || 'Not available'}</Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: SIZES.padding * 2,
    paddingTop: SIZES.marginTop,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.white,
    marginBottom: SIZES.padding * 2,
  },
  infoContainer: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  label: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  value: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  signOutButton: {
    backgroundColor: COLORS.accent,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding * 2,
  },
  signOutButtonText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
