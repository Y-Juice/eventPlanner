import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { supabase } from "../client/supabaseClient";

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase.from("events").select("*");
      if (!error) setEvents(data || []);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
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
            }}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: "100%", height: 150, borderRadius: 8, marginBottom: 8 }}
                resizeMode="cover"
              />
            ) : null}
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>{item.title}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Location: {item.location}</Text>
            <Text>Categories: {item.categories}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}
