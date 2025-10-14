import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../client/supabaseClient';
import { COLORS, FONTS, SIZES } from '../constants/styles';
import { useAuth } from '../contexts/AuthContext';

export default function PlanEvent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleCreateEvent = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from('events')
      .insert([
        {
          title: title.trim(),
          description: description.trim(),
          date: formatDate(date),
          location: location.trim() || null,
          categories: categories.trim() || null,
          image_url: imageUrl.trim() || null,
          user_id: user.id, // Add the user's ID
        }
      ])
      .select();

    setSubmitting(false);

    if (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    } else {
      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => {
          setTitle('');
          setDescription('');
          setDate(new Date());
          setLocation('');
          setCategories('');
          setImageUrl('');
          router.push('/');
        }}
      ]);
    }
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
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Plan Your Event</Text>

        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          onChangeText={setTitle}
          value={title}
          placeholder="Event title"
          placeholderTextColor={COLORS.disabled}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          onChangeText={setDescription}
          value={description}
          placeholder="Event description"
          placeholderTextColor={COLORS.disabled}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Date *</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>📅  {formatDate(date)}</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Date</Text>
                </View>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  textColor={COLORS.white}
                  themeVariant="dark"
                  accentColor={COLORS.accent}
                  style={styles.datePicker}
                />
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        ) : (
          showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
              themeVariant="dark"
              accentColor={COLORS.accent}
            />
          )
        )}

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          onChangeText={setLocation}
          value={location}
          placeholder="Event location"
          placeholderTextColor={COLORS.disabled}
        />

        <Text style={styles.label}>Categories</Text>
        <TextInput
          style={styles.input}
          onChangeText={setCategories}
          value={categories}
          placeholder="Music, Sports, etc."
          placeholderTextColor={COLORS.disabled}
        />

        <Text style={styles.label}>Image URL</Text>
        <TextInput
          style={styles.input}
          onChangeText={setImageUrl}
          value={imageUrl}
          placeholder="https://example.com/image.jpg"
          placeholderTextColor={COLORS.disabled}
        />

        <TouchableOpacity 
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleCreateEvent}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Creating...' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  label: {
    ...FONTS.h3,
    color: COLORS.white,
    marginBottom: SIZES.base / 2,
    marginTop: SIZES.padding,
  },
  input: {
    backgroundColor: COLORS.secondary,
    color: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...FONTS.body,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: COLORS.accent,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding * 2,
    marginBottom: SIZES.padding * 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  dateButton: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButtonText: {
    ...FONTS.body,
    color: COLORS.white,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    paddingBottom: SIZES.padding * 2,
  },
  modalHeader: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    alignItems: 'center',
  },
  modalTitle: {
    ...FONTS.h2,
    color: COLORS.white,
  },
  datePicker: {
    backgroundColor: COLORS.secondary,
    height: 200,
  },
  modalButton: {
    backgroundColor: COLORS.accent,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
  },
});

