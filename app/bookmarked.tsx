import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../client/supabaseClient";
import { COLORS, FONTS, SIZES } from "../constants/styles";
import { useAuth } from '../contexts/AuthContext';

const cardColors = [COLORS.cardYellow, COLORS.cardPink, COLORS.cardBlue, COLORS.cardGreen];

export default function BookmarkedPage() {
  const { user } = useAuth();
  const [bookmarkedEvents, setBookmarkedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarkedEvents = useCallback(async () => {
    if (!user) {
      console.log('No user logged in');
      setLoading(false);
      return;
    }

    console.log('Fetching bookmarks for user:', user.id);
    setLoading(true);
    
    try {
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select(`
          event_id,
          events (
            id,
            title,
            description,
            date,
            location,
            categories,
            imageUrl
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Bookmarks with events data:', bookmarks);
      console.log('Bookmarks error:', bookmarksError);

      if (bookmarksError) {
        console.log('Join query failed, trying fallback approach...');
        
        const { data: bookmarksOnly, error: fallbackError } = await supabase
          .from('bookmarks')
          .select('event_id')
          .eq('user_id', user.id);

        if (fallbackError) {
          console.error('Fallback error:', fallbackError);
          setLoading(false);
          return;
        }

        if (!bookmarksOnly || bookmarksOnly.length === 0) {
          console.log('No bookmarks found');
          setBookmarkedEvents([]);
          setLoading(false);
          return;
        }

        const eventIds = bookmarksOnly.map(b => b.event_id);
        console.log('Event IDs to fetch:', eventIds);
        
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds)
          .order('date', { ascending: false });

        console.log('Events data:', events);

        if (eventsError) {
          console.error('Error fetching events:', eventsError);
          setBookmarkedEvents([]);
        } else {
          setBookmarkedEvents(events || []);
        }
      } else {
        if (!bookmarks || bookmarks.length === 0) {
          console.log('No bookmarks found');
          setBookmarkedEvents([]);
          setLoading(false);
          return;
        }

        const events = bookmarks
          .map(b => b.events)
          .filter(event => event !== null);
        
        console.log('Extracted events:', events);
        setBookmarkedEvents(events);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
    
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchBookmarkedEvents();
    }, [fetchBookmarkedEvents])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.greetingText}>Bookmarked Events</Text>
        </View>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.greetingText}>Bookmarked Events</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please login to view bookmarked events</Text>
        </View>
      </View>
    );
  }

  if (bookmarkedEvents.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.greetingText}>Bookmarked Events</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No bookmarked events yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarkedEvents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Link href={`/event/${item.id}`} asChild>
            <TouchableOpacity>
              <View style={[styles.eventCard, { backgroundColor: cardColors[index % cardColors.length] }]}>
                {item.imageUrl && (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: "100%", height: 120, borderRadius: SIZES.radius / 1.5, marginBottom: SIZES.padding }}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDetails}>{item.date} {item.location ? `• ${item.location}` : ""}</Text>
                <Text style={styles.eventDetails}>{item.categories}</Text>
                <Text numberOfLines={2} style={{ color: COLORS.lightGray }}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        )}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.greetingText}>Bookmarked Events</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: SIZES.padding }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  headerContainer: {
    padding: SIZES.padding,
    paddingTop: SIZES.marginTop,
    paddingBottom: SIZES.padding,
  },
  greetingText: {
    ...FONTS.h1,
    color: COLORS.text,
    fontWeight: 900,
  },
  eventCard: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base * 1.5,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  eventTitle: {
    ...FONTS.h3,
    color: COLORS.black,
  },
  eventDetails: {
    ...FONTS.body,
    color: COLORS.lightGray,
    marginBottom: SIZES.base / 2,
    marginTop: SIZES.base / 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
