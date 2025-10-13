import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../client/supabaseClient';
import { COLORS, FONTS, SIZES } from '../constants/styles';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, signOut, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setUsername(data.username || '');
    }
  };

  const handleSaveUsername = async () => {
    if (!user || !username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim() })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      Alert.alert('Error', 'Failed to update username');
      console.error('Update error:', error);
    } else {
      Alert.alert('Success', 'Username updated successfully');
      setIsEditing(false);
      // Trigger refresh in other components that use username
      refreshProfile();
    }
  };

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
          <Text style={styles.label}>Username</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.value}>{username || 'Not set'}</Text>
          )}
        </View>

        {isEditing ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.editButton, styles.cancelButton]} 
              onPress={() => {
                setIsEditing(false);
                fetchProfile();
              }}
            >
              <Text style={styles.editButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, saving && styles.buttonDisabled]} 
              onPress={handleSaveUsername}
              disabled={saving}
            >
              <Text style={styles.editButtonText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Username</Text>
          </TouchableOpacity>
        )}

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
  input: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius / 2,
    padding: SIZES.base,
    color: COLORS.white,
    ...FONTS.h3,
    marginTop: SIZES.base / 2,
  },
  editButton: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  editButtonText: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SIZES.base,
    marginBottom: SIZES.padding,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
