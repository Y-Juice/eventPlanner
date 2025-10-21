import NetInfo from '@react-native-community/netinfo';
import { Image } from 'expo-image';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../client/supabaseClient";
import { COLORS, FONTS, SIZES } from "../constants/styles";
import { useAuth } from '../contexts/AuthContext';
import { getData, storeData } from '../lib/cache';


const cardColors = [COLORS.cardYellow, COLORS.cardPink, COLORS.cardBlue, COLORS.cardGreen];

export default function BookmarkedPage() {
  const { user } = useAuth();
  const [bookmarkedEvents, setBookmarkedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarkedEvents = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const cacheKey = `bookmarked_events_${user.id}`;
    const netInfo = await NetInfo.fetch();

    if (netInfo.isConnected) {
      try {
        const { data: bookmarks, error } = await supabase
          .from('bookmarks')
          .select('events (*)')
          .eq('user_id', user.id);

        if (error) throw error;

        const events = bookmarks?.map(b => b.events).filter(Boolean) || [];
        setBookmarkedEvents(events);
        storeData(cacheKey, events);
      } catch (error) {
        console.error('Error fetching bookmarked events:', error);
        const cachedData = await getData(cacheKey);
        if (cachedData) setBookmarkedEvents(cachedData);
      }
    } else {
      const cachedData = await getData(cacheKey);
      if (cachedData) {
        setBookmarkedEvents(cachedData);
      }
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
