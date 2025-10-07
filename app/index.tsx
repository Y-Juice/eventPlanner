import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { supabase } from "../client/supabaseClient";
import { COLORS, FONTS, SIZES } from "../constants/styles";

const PAGE_SIZE = 10;
const cardColors = [COLORS.cardYellow, COLORS.cardPink, COLORS.cardBlue, COLORS.cardGreen];
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  headerContainer: {
    padding: SIZES.padding,
    paddingTop: 50,
    paddingBottom: 0,
  },
  greetingText: {
    ...FONTS.h1,
    color: COLORS.text,
    fontWeight: 900,
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
});


export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<any>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayEvents, setDayEvents] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
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

  useEffect(() => {
    setLoading(true);
    async function fetchEvents() {
      const { firstDay, lastDay } = getMonthRange(currentMonth);
      let query = supabase.from("events").select("*")
        .order("date", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
        .gte("date", firstDay)
        .lte("date", lastDay);

      const { data } = await query;
      const filteredData = data || [];

      setEvents(page === 1 ? filteredData : [...events, ...filteredData]);
      setHasMore(filteredData.length === PAGE_SIZE);

      const marked: any = {};
      filteredData.forEach(ev => {
        if (ev.date) {
          marked[ev.date] = { ...marked[ev.date], marked: true, dotColor: COLORS.white };
        }
      });
      setCalendarEvents(marked);
      setLoading(false);
    }
    fetchEvents();
  }, [page, currentMonth]);
  
  useEffect(() => {
    setPage(1);
    setEvents([]);
  }, [currentMonth]);

  const handleLoadMore = () => {
    if (hasMore && !loading) setPage(page + 1);
  };

  const onDayPress = (day: any) => {
    setSelectedDay(day.dateString);
    const eventsForDay = events.filter(ev => ev.date === day.dateString);
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
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color={COLORS.white} /> : null}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.greetingText}>Hi, Tomas</Text>
            <Text style={styles.subGreetingText}>Here are your events.</Text>

            <Calendar
              markedDates={calendarEvents}
              onDayPress={onDayPress}
              onMonthChange={(m: any) => {
                const ym = `${m.year}-${String(m.month).padStart(2, '0')}`;
                setCurrentMonth(ym);
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
            <Text style={styles.monthTitle}>
              Events for {getMonthLabel(currentMonth)}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: SIZES.padding }}
      />
    </View>
  );
}
