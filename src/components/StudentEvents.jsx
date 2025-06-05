import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Using FontAwesome5 for variety
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const studentId = ""; // Example student ID

// Mock data - replace with your actual data source
const eventsData = [
  {
    id: '1',
    title: 'Annual Science Fair',
    category: 'Academic',
    date: 'November 28, 2024 at 10:00 AM - 04:00 PM',
    location: 'School Auditorium',
    description: 'Showcasing innovative science projects by students from all grades. Parents are welcome!',
    rsvpRequired: false,
    buttonText: 'View Details',
    buttonIcon: 'info-circle',
  },
  {
    id: '2',
    title: 'Winter Music Concert',
    category: 'Cultural',
    date: 'December 15, 2024 at 06:30 PM',
    location: 'Community Hall',
    description: 'An evening of musical performances by the school band and choir. Limited seats.',
    rsvpRequired: true,
    rsvpText: 'RSVP Required',
    buttonText: 'RSVP / View Details',
    buttonIcon: 'info-circle', // Or a ticket icon
  },
  {
    id: '3',
    title: 'Inter-House Sports Day',
    category: 'Sports',
    date: 'February 10, 2025 at 09:00 AM onwards',
    location: 'School Sports Ground',
    description: 'Exciting track and field events. Come support your house!',
    rsvpRequired: false,
    buttonText: 'View Details',
    buttonIcon: 'info-circle',
  },
];

// Helper for category tag styling
const getCategoryStyle = (category) => {
  switch (category.toLowerCase()) {
    case 'academic':
      return {
        backgroundColor: '#E6F3FF', // Light blue
        textColor: '#007AFF',       // Blue
      };
    case 'cultural':
      return {
        backgroundColor: '#F0E6FF', // Light purple
        textColor: '#8A2BE2',       // Purple
      };
    case 'sports':
      return {
        backgroundColor: '#E6FFE6', // Light green
        textColor: '#34C759',       // Green
      };
    default:
      return {
        backgroundColor: '#F0F0F0', // Light grey
        textColor: '#555555',       // Dark grey
      };
  }
};

const EventCard = ({ event }) => {
  const categoryStyle = getCategoryStyle(event.category);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={[styles.categoryTag, { backgroundColor: categoryStyle.backgroundColor }]}>
          <Text style={[styles.categoryTagText, { color: categoryStyle.textColor }]}>
            {event.category}
          </Text>
        </View>
      </View>

      <View style={styles.eventDetailRow}>
        <Icon name="calendar-alt" size={16} color="#555" style={styles.detailIcon} />
        <Text style={styles.eventDetailText}>{event.date}</Text>
      </View>

      <View style={styles.eventDetailRow}>
        <Icon name="map-marker-alt" size={16} color="#555" style={styles.detailIcon} />
        <Text style={styles.eventDetailText}>{event.location}</Text>
      </View>

      {event.rsvpRequired && event.rsvpText && (
        <View style={[styles.eventDetailRow, styles.rsvpRow]}>
          <Icon name="ticket-alt" size={16} color="#D9534F" style={styles.detailIcon} />
          <Text style={[styles.eventDetailText, styles.rsvpText]}>{event.rsvpText}</Text>
        </View>
      )}

      <View style={styles.descriptionContainer}>
        <Text style={styles.eventDescription}>{event.description}</Text>
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={() => alert(`Details for ${event.title}`)}>
        <Icon name={event.buttonIcon || 'info-circle'} size={18} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.actionButtonText}>{event.buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const StudentEvents = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.headerContainer}>
          <Icon name="calendar-check" size={30} color="#6A0DAD" style={styles.headerIcon} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.mainTitle}>
              School Events for Students {studentId}
            </Text>
            <Text style={styles.subTitle}>
              Upcoming and recent school activities.
            </Text>
          </View>
        </View>

        {eventsData.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Light greyish background for the whole page
  },
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
  },
  headerIcon: {
    marginRight: 15,
    color: '#5D3FD3', // A nice purple
  },
  headerTextContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    color: '#666666',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android Shadow
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to the start for multi-line title
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1, // Allow title to take space and wrap
    marginRight: 8, // Space before tag
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto', // Pushes tag to the right
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
    width: 20, // Ensure consistent alignment
    textAlign: 'center',
  },
  eventDetailText: {
    fontSize: 14,
    color: '#555555',
    flex: 1, // Allow text to wrap
  },
  rsvpRow: {
    marginTop: 4, // A bit more space if RSVP is present
  },
  rsvpText: {
    color: '#D9534F', // Red color for RSVP text
    fontWeight: '600',
  },
  descriptionContainer: {
    backgroundColor: '#F8F9FA', // Very light grey, almost white
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  eventDescription: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#6A0DAD', // Purple color from header icon for consistency
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StudentEvents;