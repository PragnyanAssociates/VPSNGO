import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// This interface defines the structure of a single meeting object.
export interface Meeting {
  id: number;
  meeting_datetime: string;
  teacher_id: number;
  teacher_name: string;
  subject_focus: string;
  status: 'Scheduled' | 'Completed';
  notes: string | null;
}

// These are the props (parameters) that our MeetingCard component accepts.
interface MeetingCardProps {
  meeting: Meeting;
  onEdit?: (meeting: Meeting) => void;
  onDelete?: (id: number) => void;
}

// This helper function takes a date string and makes it look nice and readable.
const formatMeetingDate = (isoDate: string): string => {
  if (!isoDate) return 'Invalid Date';
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

// This is the main MeetingCard component.
export const MeetingCard = ({ meeting, onEdit, onDelete }: MeetingCardProps) => {
  const canManage = onEdit && onDelete;

  return (
    <View style={styles.cardContainer}>
      {/* ✅ CORRECTED HEADER STRUCTURE */}
      <View style={styles.cardHeader}>
        {/* Part 1: Icon and Text */}
        <View style={styles.headerLeft}>
            <Text style={styles.icon}>🗓️</Text>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerDate}>{formatMeetingDate(meeting.meeting_datetime)}</Text>
              <Text style={styles.headerSubtitle}>Parent-Teacher Meeting</Text>
            </View>
        </View>

        {/* Part 2: Buttons (only if canManage is true) */}
        {canManage && (
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => onEdit(meeting)} style={[styles.actionBtn, styles.editBtn]}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(meeting.id)} style={[styles.actionBtn, styles.deleteBtn]}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
        )}
      </View>

      {/* The rest of the card remains the same */}
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
            <Text style={styles.icon}>🧑‍🏫</Text>
            <Text style={styles.detailText}>Teacher: {meeting.teacher_name}</Text>
        </View>
        <View style={styles.detailRow}>
            <Text style={styles.icon}>💬</Text>
            <Text style={styles.detailText}>Subject Focus: {meeting.subject_focus}</Text>
        </View>
        <View style={styles.detailRow}>
            <Text style={styles.icon}>ℹ️</Text>
            <Text style={styles.detailText}>Status: </Text>
            <View style={[styles.statusPill, meeting.status === 'Scheduled' ? styles.scheduledPill : styles.completedPill]}>
                <Text style={meeting.status === 'Scheduled' ? styles.scheduledText : styles.completedText}>{meeting.status}</Text>
            </View>
        </View>
      </View>
      <View style={styles.notesContainer}>
        <Text style={styles.notesTitle}>Notes/Summary:</Text>
        <View style={styles.notesBox}>
          <Text style={styles.notesText}>{meeting.notes || 'No notes have been added yet.'}</Text>
        </View>
      </View>
    </View>
  );
};

// ✅ CORRECTED STYLESHEET
const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 15,
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    // --- Style changes are here ---
    cardHeader: {
        flexDirection: 'row',       // Arrange items horizontally
        justifyContent: 'space-between', // Push items to opposite ends
        alignItems: 'center',       // Vertically align items in the middle
        paddingBottom: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Allow this side to take up available space
        paddingRight: 10, // Add some space before the buttons
    },
    cardActions: {
        flexDirection: 'row', // Arrange buttons horizontally
        gap: 8,
    },
    // --- End of style changes ---
    actionBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    editBtn: { backgroundColor: '#ffc107' },
    editBtnText: { color: 'black', fontWeight: '500' },
    deleteBtn: { backgroundColor: '#f44336' },
    deleteBtnText: { color: 'white', fontWeight: '500' },
    icon: { fontSize: 24, marginRight: 12 },
    headerTextContainer: { flex: 1 },
    headerDate: { fontSize: 18, fontWeight: '600', color: '#2d3748' },
    headerSubtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
    cardBody: { gap: 12 },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    detailText: { fontSize: 16, color: '#4a5568', flexShrink: 1 },
    statusPill: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 16, marginLeft: 5 },
    scheduledPill: { backgroundColor: '#e6f7ff' },
    completedPill: { backgroundColor: '#f6ffed' },
    scheduledText: { color: '#1890ff', fontWeight: '500' },
    completedText: { color: '#52c41a', fontWeight: '500' },
    notesContainer: { marginTop: 20 },
    notesTitle: { fontSize: 14, color: '#718096', fontWeight: '500', marginBottom: 8 },
    notesBox: { backgroundColor: '#f7f9fc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12 },
    notesText: { color: '#4a5568', fontSize: 15, lineHeight: 22 },
});