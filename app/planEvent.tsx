import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/styles';
import { useAuth } from '../contexts/AuthContext';

export default function PlanEvent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.replace('/login');
    }
  }, [user, loading, router]);

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
        <Text style={styles.title}>Create Event</Text>
        <Text style={styles.subtitle}>Plan your next event</Text>
        
        {/* TODO: Add event creation form */}
        <Text style={styles.placeholderText}>Event creation form coming soon...</Text>
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
    marginBottom: SIZES.base,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.padding * 2,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  placeholderText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.padding * 3,
  },
});
