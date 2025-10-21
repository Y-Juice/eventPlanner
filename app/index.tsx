import NetInfo from '@react-native-community/netinfo';
import { Image } from 'expo-image';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { supabase } from "../client/supabaseClient";
import { COLORS, FONTS, SIZES } from "../constants/styles";
import { useAuth } from '../contexts/AuthContext';
import { getData, storeData } from '../lib/cache';

const PAGE_SIZE = 10;
const cardColors = [COLORS.cardYellow, COLORS.cardPink, COLORS.cardBlue, COLORS.cardGreen];
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
    fontWeight: 900,
    paddingBottom: SIZES.padding,
  },
  subGreetingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.padding,
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
  modalContainer: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  modalTitle: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZES.padding,
    paddingTop: 40,
  },
  closeButton: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.padding / 1.5,
    borderRadius: SIZES.base,
    alignItems: "center",
    marginTop: SIZES.padding,
  },
  closeButtonText: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  monthTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.padding,
    marginTop: SIZES.base,
  },
  showAllButton: {
    backgroundColor: COLORS.accent,
    padding: SIZES.padding / 1.5,
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginTop: SIZES.padding,
  },
  showAllButtonText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});


export default function HomePage() {
  const { user, profileVersion } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<any>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayEvents, setDayEvents] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('Guest');
  const [dateFilter, setDateFilter] = useState<string | null>(null); // New state for filtering
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const getMonthRange = (yearMonth: string) => {
    const [yearNum, monthNum] = yearMonth.split('-').map(Number);
    const firstDay = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
    const lastDate = new Date(yearNum, monthNum, 0).getDate();
    const lastDay = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDate).padStart(2, '0')}`;
    return { firstDay, lastDay };
  };

  const getMonthLabel = (yearMonth: string) => {
    try {
      const [y, m] = yearMonth.split('-').map(Number);
      const d = new Date(y, m - 1, 1);
      return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    } catch {
      return yearMonth;
    }
  };

  const fetchUsername = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching username:', error);
    } else if (data) {
      setUsername(data.username || 'Guest');
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsername();
    } else {
      setUsername('Guest');
    }
  }, [user, profileVersion]);

  const fetchEvents = useCallback(async (isRefetch = false) => {
    setLoading(true);
    const currentPage = isRefetch ? 1 : page;
    const cacheKey = `events_page_${currentPage}_filter_${dateFilter || 'all'}`;

    const netInfo = await NetInfo.fetch();

    if (netInfo.isConnected) {
      let query = supabase.from("events").select("*")
        .order("date", { ascending: true });

      if (dateFilter) {
        const { firstDay, lastDay } = getMonthRange(dateFilter);
        query = query
          .gte("date", firstDay)
          .lte("date", lastDay);
      } else {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte("date", today);
      }
      
      query = query.range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching events:", error);
        const cachedData = await getData(cacheKey);
        if (cachedData) {
          setEvents(currentPage === 1 ? cachedData : prevEvents => [...prevEvents, ...cachedData]);
        }
      } else {
        const filteredData = data || [];
        storeData(cacheKey, filteredData);
        if (currentPage === 1) {
          setEvents(filteredData);
        } else {
          setEvents(prevEvents => [...prevEvents, ...filteredData]);
        }
        setHasMore(filteredData.length === PAGE_SIZE);
      }
    } else {
      const cachedData = await getData(cacheKey);
      if (cachedData) {
        if (currentPage === 1) {
          setEvents(cachedData);
        } else {
          setEvents(prevEvents => [...prevEvents, ...cachedData]);
        }
        setHasMore(cachedData.length === PAGE_SIZE);
      }
    }

    const monthCacheKey = `month_events_${currentMonth}`;
    if (netInfo.isConnected) {
      const { data: monthEvents, error } = await supabase.from("events").select("date")
        .gte("date", getMonthRange(currentMonth).firstDay)
        .lte("date", getMonthRange(currentMonth).lastDay);
      
      if (error) {
        console.error("Error fetching month events:", error);
        const cachedMonthEvents = await getData(monthCacheKey);
        if (cachedMonthEvents) setCalendarEvents(cachedMonthEvents);
      } else {
        const marked: any = {};
        if (monthEvents) {
          monthEvents.forEach(ev => {
            if (ev.date) {
              marked[ev.date] = { ...marked[ev.date], marked: true, dotColor: COLORS.white };
            }
          });
        }
        storeData(monthCacheKey, marked);
        setCalendarEvents(marked);
      }
    } else {
      const cachedMonthEvents = await getData(monthCacheKey);
      if (cachedMonthEvents) {
        setCalendarEvents(cachedMonthEvents);
      }
    }

    setLoading(false);
  }, [page, currentMonth, dateFilter]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchEvents(true);
    }, [dateFilter])
  );

  useEffect(() => {
    if (page > 1) {
      fetchEvents();
    }
  }, [page]);

  const handleLoadMore = () => {
    if (hasMore && !loading) setPage(page + 1);
  };

  const onDayPress = (day: any) => {
    setSelectedDay(day.dateString);
    const eventsForDay = events.filter(ev => ev.date === day.dateString);
    if (eventsForDay.length === 0) {
      // If no events are loaded for that day, fetch them specifically
      setDateFilter(day.dateString);
    }
    setDayEvents(eventsForDay);
    setModalVisible(true);
  };

  const renderDayEvents = () => (
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
            <View style={[styles.eventCard, { backgroundColor: cardColors[index % cardColors.length] }]}>
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: "100%", height: 120, borderRadius: SIZES.base, marginBottom: SIZES.base }}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDetails}>{item.date} {item.location ? `• ${item.location}` : ""}</Text>
              <Text style={styles.eventDetails}>{item.categories}</Text>
              <Text numberOfLines={2} style={{color: COLORS.lightGray}}>{item.description}</Text>
            </View>
          )}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderDayEvents()}
      <FlatList
        data={events}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color={COLORS.white} /> : null}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.greetingText}>Hi, {username}</Text>

            <Calendar
              markedDates={calendarEvents}
              onDayPress={onDayPress}
              onMonthChange={(m: any) => {
                const ym = `${m.year}-${String(m.month).padStart(2, '0')}`;
                setCurrentMonth(ym);
                setDateFilter(ym); // Set filter to the new month
              }}
              style={{
                borderRadius: SIZES.radius,
                marginBottom: SIZES.padding,
              }}
              theme={{
                calendarBackground: COLORS.secondary,
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
            {dateFilter && (
              <TouchableOpacity style={styles.showAllButton} onPress={() => setDateFilter(null)}>
                <Text style={styles.showAllButtonText}>Show All Upcoming Events</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.monthTitle}>
              {dateFilter ? `Events for ${getMonthLabel(dateFilter)}` : "Upcoming Events"}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: SIZES.padding }}
      />
    </View>
  );
}
