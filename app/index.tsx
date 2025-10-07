import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from "react-native";
import { supabase } from "../client/supabaseClient";
import { Calendar } from "react-native-calendars";

const PAGE_SIZE = 10;

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<any>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayEvents, setDayEvents] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch unique categories for chips
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from("events").select("categories");
      if (!error && data) {
        // Split and flatten all categories
        const allCats = data
          .map((e: any) => e.categories)
          .filter(Boolean)
          .flatMap((catStr: string) => catStr.split(",").map(c => c.trim()));
        const unique = Array.from(new Set(allCats));
        setCategories(unique);
      }
    }
    fetchCategories();
  }, []);

  // Fetch events with filters and pagination
  useEffect(() => {
    setLoading(true);
    async function fetchEvents() {
      let query = supabase.from("events").select("*").order("date", { ascending: true }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (search) query = query.ilike("title", `%${search}%`);
      if (location) query = query.ilike("location", `%${location}%`);
      if (date) query = query.eq("date", date);

      const { data, error } = await query;
      let filteredData = data || [];

      // Filter by categories
      if (selectedCategories.length === 1) {
        filteredData = filteredData.filter(event =>
          event.categories &&
          event.categories.split(",").map((c: string) => c.trim()).includes(selectedCategories[0])
        );
      } else if (selectedCategories.length === 2) {
        filteredData = filteredData.filter(event => {
          const eventCats = event.categories ? event.categories.split(",").map((c: string) => c.trim()) : [];
          return selectedCategories.every(cat => eventCats.includes(cat));
        });
      }

      setEvents(page === 1 ? filteredData : [...events, ...filteredData]);
      setHasMore(filteredData.length === PAGE_SIZE);

      // Prepare calendar markers
      const marked: any = {};
      filteredData.forEach(ev => {
        if (ev.date) {
          marked[ev.date] = marked[ev.date] || { marked: true, dots: [{ color: "#007AFF" }] };
        }
      });
      setCalendarEvents(marked);

      setLoading(false);
    }
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, location, date, selectedCategories, page]);

  // Add this useEffect to reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setEvents([]);
  }, [search, location, date, selectedCategories]);

  // Infinite scroll handler
  const handleLoadMore = () => {
    if (hasMore && !loading) setPage(page + 1);
  };

  // Toggle category selection (max 2)
  const toggleCategory = (cat: string) => {
    setPage(1);
    setEvents([]);
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      } else if (prev.length < 2) {
        return [...prev, cat];
      } else {
        return prev; // Do not allow more than 2
      }
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setDate("");
    setSelectedCategories([]);
    setPage(1);
    setEvents([]);
  };

  // Render category chips
  const renderChips = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={{
            backgroundColor: selectedCategories.includes(cat) ? "#007AFF" : "#fff",
            paddingHorizontal: 16,
            height: 32,
            alignContent: "center",
            justifyContent: "center",
            marginBottom: 20,
            borderRadius: 16,
            marginRight: 8,
            borderWidth: 1,
            borderColor: "#E6F4FE",
          }}
          onPress={() => toggleCategory(cat)}
        >
          <Text style={{ color: selectedCategories.includes(cat) ? "#fff" : "#616161ff", fontSize: 13 }}>{cat}</Text>
        </TouchableOpacity>
      ))}
      {/* Reset Filters Button */}
      <TouchableOpacity
        style={{
          backgroundColor: "#FF5252",
          paddingHorizontal: 16,
          height: 32,
          alignContent: "center",
          justifyContent: "center",
          marginBottom: 80,
          borderRadius: 16,
          marginRight: 8,
        }}
        onPress={resetFilters}
      >
        <Text style={{ color: "#fff", fontSize: 13 }}>Reset Filters</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Calendar day press handler
  const onDayPress = (day: any) => {
    setSelectedDay(day.dateString);
    const eventsForDay = events.filter(ev => ev.date === day.dateString);
    setDayEvents(eventsForDay);
    setModalVisible(true);
  };

  // Render events for selected day in modal
  const renderDayEvents = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={{ flex: 1, padding: 16, backgroundColor: "#F8F8F8" }}>
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>
          Events on {selectedDay}
        </Text>
        <FlatList
          data={dayEvents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                marginBottom: 12,
                backgroundColor: "#fff",
                padding: 12,
                borderRadius: 8,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: "100%", height: 120, borderRadius: 8, marginBottom: 8 }}
                  resizeMode="cover"
                />
              ) : null}
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: "#007AFF", marginBottom: 2 }}>{item.date} {item.location ? `• ${item.location}` : ""}</Text>
              <Text style={{ color: "#007AFF", marginBottom: 2 }}>{item.categories}</Text>
              <Text numberOfLines={2} style={{ color: "#333" }}>{item.description}</Text>
            </View>
          )}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 12,
          }}
          onPress={() => setModalVisible(false)}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 30, paddingBottom: 0, backgroundColor: "#F8F8F8" }}>
      {/* Search Bar */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <TextInput
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 50,
            paddingHorizontal: 20,
            paddingVertical: 12,
            marginRight: 0,
            borderWidth: 1,
            borderColor: "#E6F4FE",
          }}
        />
      </View>

      {/* Filters */}
      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <TextInput
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 16,
            paddingHorizontal: 12,
            marginRight: 8,
            borderWidth: 1,
            borderColor: "#E6F4FE",
          }}
        />
        <TextInput
          placeholder="DD-MM-YYYY"
          value={date}
          onChangeText={setDate}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 16,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: "#E6F4FE",
          }}
        />
      </View>

      {/* Category Chips */}
      {renderChips()}

      {/* Calendar */}
      <Calendar
        markedDates={calendarEvents}
        onDayPress={onDayPress}
        style={{
          marginBottom: 16,
          borderRadius: 8,
          backgroundColor: "#fff",
          elevation: 2,
        }}
        theme={{
          selectedDayBackgroundColor: "#007AFF",
          todayTextColor: "#007AFF",
          dotColor: "#007AFF",
        }}
      />

      {/* Modal for day events */}
      {renderDayEvents()}

      {/* Results List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              marginBottom: 12,
              backgroundColor: "#fff",
              padding: 12,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: "100%", height: 120, borderRadius: 8, marginBottom: 8 }}
                resizeMode="cover"
              />
            ) : null}
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.title}</Text>
            <Text style={{ color: "#007AFF", marginBottom: 2 }}>{item.date} {item.location ? `• ${item.location}` : ""}</Text>
            <Text style={{ color: "#007AFF", marginBottom: 2 }}>{item.categories}</Text>
            <Text numberOfLines={2} style={{ color: "#333" }}>{item.description}</Text>
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#007AFF" /> : null}
      />
    </View>
  );
}
