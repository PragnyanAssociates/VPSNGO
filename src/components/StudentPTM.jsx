import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Using FontAwesome5

const { width } = Dimensions.get('window');

const studentId = ""; // Example student ID

// Mock data - replace with your actual data source
const ptmData = [
  {
    id: '1',
    dateTime: 'November 20, 2024 at 03:00 PM',
    meetingType: 'Parent-Teacher Meeting',
    teacher: 'Ms. Davison',
    subjectFocus: 'Mathematics Performance',
    status: 'Scheduled',
    notes: 'Discussion on recent test scores and strategies for improvement.',
  },
  {
    id: '2',
    dateTime: 'May 15, 2024 at 10:30 AM',
    meetingType: 'Parent-Teacher Meeting',
    teacher: 'Mr. Harvey',
    subjectFocus: 'Science Project Feedback',
    status: 'Completed',
    notes: 'Positive feedback on the project. Discussed areas for further exploration.',
  },
  {
    id: '3',
    dateTime: 'February 02, 2024 at 09:00 AM',
    meetingType: 'Parent-Teacher Meeting',
    teacher: 'Ms. Carol',
    subjectFocus: 'Overall Progress Review',
    status: 'Cancelled',
    notes: 'Meeting cancelled due to unforeseen circumstances. Will be rescheduled.',
  },
];

// Helper for status tag styling
const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return {
        backgroundColor: '#E0F2FE', // Light Sky Blue
        textColor: '#0284C7',       // Sky Blue
      };
    case 'completed':
      return {
        backgroundColor: '#D1FAE5', // Light Emerald Green
        textColor: '#059669',       // Emerald Green
      };
    case 'cancelled':
      return {
        backgroundColor: '#FEE2E2', // Light Red
        textColor: '#DC2626',       // Red
      };
    default:
      return {
        backgroundColor: '#F3F4F6', // Light Grey
        textColor: '#4B5563',       // Dark Grey
      };
  }
};

const PTMCard = ({ ptm }) => {
  const statusStyle = getStatusStyle(ptm.status);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="calendar-alt" size={24} color="#6B46C1" style={styles.headerDateTimeIcon} />
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateTimeText}>{ptm.dateTime}</Text>
          <Text style={styles.meetingTypeText}>{ptm.meetingType}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Icon name="chalkboard-teacher" size={16} color="#718096" style={styles.detailIcon} />
        <Text style={styles.detailLabel}>Teacher: </Text>
        <Text style={styles.detailValue}>{ptm.teacher}</Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="comment-dots" size={16} color="#718096" style={styles.detailIcon} />
        <Text style={styles.detailLabel}>Subject Focus: </Text>
        <Text style={styles.detailValue}>{ptm.subjectFocus}</Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="info-circle" size={16} color="#718096" style={styles.detailIcon} />
        <Text style={styles.detailLabel}>Status: </Text>
        <View style={[styles.statusTag, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.statusTagText, { color: statusStyle.textColor }]}>
            {ptm.status}
          </Text>
        </View>
      </View>

      <View style={styles.notesContainer}>
        <Text style={styles.notesLabel}>Notes/Summary:</Text>
        <View style={styles.notesContentBox}>
          <Text style={styles.notesText}>{ptm.notes}</Text>
        </View>
      </View>
    </View>
  );
};

const StudentPTM = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.pageHeaderContainer}>
          <Icon name="users" size={30} color="#6B46C1" style={styles.pageHeaderIcon} />
          <View style={styles.pageHeaderTextContainer}>
            <Text style={styles.pageMainTitle}>
               Meetings Shedules {studentId}
            </Text>
            <Text style={styles.pageSubTitle}>
              View scheduled and past PTMs.
            </Text>
          </View>
        </View>

        {ptmData.map(ptm => (
          <PTMCard key={ptm.id} ptm={ptm} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC', // Very light grey, almost white, for a classic feel
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pageHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 12,
  },
  pageHeaderIcon: {
    marginRight: 16,
    color: '#5A67D8', // Indigo, classic and professional
  },
  pageHeaderTextContainer: {
    flex: 1,
  },
  pageMainTitle: {
    fontSize: 20,
    fontWeight: '600', // Semi-bold for a softer bold look
    color: '#2D3748', // Darker grey-blue
    marginBottom: 4,
  },
  pageSubTitle: {
    fontSize: 14,
    color: '#718096', // Medium grey
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8, // Slightly less rounded for classic
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Subtle border
    // iOS Shadow
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 4,
    // Android Shadow
    elevation: 2, // Subtle elevation
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7', // Light border for separation
  },
  headerDateTimeIcon: {
    marginRight: 12,
    color: '#5A67D8', // Indigo
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateTimeText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  meetingTypeText: {
    fontSize: 13,
    color: '#718096',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 10,
    width: 20, // For alignment
    textAlign: 'center',
    color: '#A0AEC0', // Lighter grey for icons
  },
  detailLabel: {
    fontSize: 14,
    color: '#4A5568', // Medium-dark grey
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#2D3748', // Darker grey-blue
    flex: 1, // Allow wrapping
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // Pill shape
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: 6,
  },
  notesContentBox: {
    backgroundColor: '#F7FAFC', // Very light grey, matching page background
    padding: 12,
    borderRadius: 6, // Subtly rounded
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesText: {
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
  },
});

export default StudentPTM;