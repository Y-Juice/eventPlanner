import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { supabase } from "../client/supabaseClient";
import { COLORS, FONTS, SIZES } from "../constants/styles";
import { useAuth } from '../contexts/AuthContext';

const cardColors = [COLORS.cardYellow, COLORS.cardPink, COLORS.cardBlue, COLORS.cardGreen];

// Define colors for event markers
const MY_EVENT_COLOR = COLORS.accent;
const BOOKMARKED_EVENT_COLOR = COLORS.white;

export default function CalendarPage() {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayEvents, setDayEvents] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchAllUserEvents = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // Fetch user's own events
    const { data: myEvents, error: myEventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id);

    // Fetch bookmarked events
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('events (*)')
      .eq('user_id', user.id);

    if (myEventsError || bookmarksError) {
      console.error('Error fetching events:', myEventsError || bookmarksError);
      setLoading(false);
      return;
    }

    const bookmarkedEvents = bookmarks ? bookmarks.map(b => b.events) : [];
    
    // Combine and remove duplicates
    const combinedEvents = [...(myEvents || []), ...(bookmarkedEvents || [])];
    const uniqueEvents = Array.from(new Set(combinedEvents.map(e => e.id)))
      .map(id => combinedEvents.find(e => e.id === id));
      
    setAllEvents(uniqueEvents);

    // Create marked dates object
    const markers: any = {};
    uniqueEvents.forEach(event => {
      if (event && event.date) {
        const isMyEvent = event.user_id === user.id;
        const isBookmarked = bookmarkedEvents.some(b => b.id === event.id);

        const dots = [];
        if(isMyEvent) dots.push({ key: 'myEvent', color: MY_EVENT_COLOR });
        if(isBookmarked) dots.push({ key: 'bookmarked', color: BOOKMARKED_EVENT_COLOR });

        markers[event.date] = {
          ...markers[event.date],
          marked: true,
          dots: dots
        };
      }
    });
    
    setMarkedDates(markers);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchAllUserEvents();
    }, [user, fetchAllUserEvents])
  );
  
  const onDayPress = (day: DateData) => {
    setSelectedDay(day.dateString);
    const eventsForDay = allEvents.filter(ev => ev.date === day.dateString);
    setDayEvents(eventsForDay);
    setModalVisible(true);
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.greetingText}>My Calendar</Text>
        </View>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.greetingText}>My Calendar</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please login to see your calendar</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.greetingText}>My Calendar</Text>
      </View>
      <Calendar
        markingType={'multi-dot'}
        markedDates={markedDates}
        onDayPress={onDayPress}
        style={styles.calendar}
        theme={{
          calendarBackground: COLORS.primary,
          dayTextColor: COLORS.text,
          textDisabledColor: COLORS.disabled,
          monthTextColor: COLORS.text,
          arrowColor: COLORS.text,
          todayTextColor: COLORS.accent,
          selectedDayBackgroundColor: COLORS.white,
          selectedDayTextColor: COLORS.primary,
          'stylesheet.calendar.header': {
            week: {
              marginTop: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderColor: COLORS.lightGray,
              paddingBottom: 10,
            }
          }
        }}
      />
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MY_EVENT_COLOR }]} />
          <Text style={styles.legendText}>My Events</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BOOKMARKED_EVENT_COLOR }]} />
          <Text style={styles.legendText}>Bookmarked</Text>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Events on {selectedDay}
          </Text>
          <FlatList
            data={dayEvents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <Link href={`/event/${item.id}`} asChild>
                <TouchableOpacity>
                  <View style={[styles.eventCard, { backgroundColor: cardColors[index % cardColors.length] }]}>
                    {item.image_url && (
                      <Image
                        source={{ uri: item.image_url }}
                        style={{ width: "100%", height: 120, borderRadius: SIZES.base, marginBottom: SIZES.base }}
                        resizeMode="cover"
                      />
                    )}
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventDetails}>{item.date} {item.location ? `• ${item.location}` : ""}</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No events for this day</Text>}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    paddingBottom: 0,
  },
  greetingText: {
    ...FONTS.h1,
    color: COLORS.text,
    fontWeight: '900',
  },
  calendar: {
    borderRadius: SIZES.radius,
    margin: SIZES.padding,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.padding,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SIZES.base,
  },
  legendText: {
    ...FONTS.body,
    color: COLORS.text,
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
  modalContainer: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
    paddingTop: SIZES.marginTop,
  },
  modalTitle: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  closeButton: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding / 1.5,
    borderRadius: SIZES.base,
    alignItems: "center",
    marginTop: SIZES.padding,
  },
  closeButtonText: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  eventCard: {
    marginVertical: SIZES.base,
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
    marginTop: SIZES.base / 2,
  },
});
