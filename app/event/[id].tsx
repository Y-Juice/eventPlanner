import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../client/supabaseClient';
import { COLORS, FONTS, SIZES } from '../../constants/styles';
import { useAuth } from '../../contexts/AuthContext';
import EventMap from '../components/EventMap';

export default function EventDetails() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching event:', error);
        } else {
          console.log('Fetched event data:', data);
          setEvent(data);
        }
        setLoading(false);
      };

      fetchEvent();
    }
  }, [id]);

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (user && id) {
        const { data } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('event_id', id)
          .single();

        if (data) {
          setIsBookmarked(true);
        } else {
          setIsBookmarked(false);
        }
      }
    };

    checkBookmarkStatus();
  }, [user, id]);

  const handleBookmark = async () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to bookmark events',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') }
        ]
      );
      return;
    }

    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', id);

      if (error) {
        console.error('Error removing bookmark:', error);
        Alert.alert('Error', 'Failed to remove bookmark');
      } else {
        setIsBookmarked(false);
        Alert.alert('Success', 'Bookmark removed!');
      }
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert([
          {
            user_id: user.id,
            event_id: id,
          }
        ]);

      if (error) {
        console.error('Error adding bookmark:', error);
        Alert.alert('Error', 'Failed to add bookmark');
      } else {
        setIsBookmarked(true);
        Alert.alert('Success', 'Event bookmarked!');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Event not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.image} />
        )}

        <View style={[styles.contentContainer, !event.imageUrl && { paddingTop: 80 }]}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.date}>{new Date(event.date).toLocaleDateString()} • {event.location}</Text>

          {event.location && (
            <EventMap location={event.location} height={200} />
          )}

          <Text style={styles.description}>{event.description}</Text>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleBookmark}
          >
            <Text style={styles.buttonText}>
              {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Add to Calendar (iCal)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 50, // Added more space from the top
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    paddingTop: 0,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 20,
  },
  image: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.white,
    marginBottom: SIZES.base,
    paddingTop: 20,
  },
  date: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.padding,
  },
  description: {
    ...FONTS.body,
    color: COLORS.white,
    marginBottom: SIZES.padding,
  },
  button: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  buttonText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});
