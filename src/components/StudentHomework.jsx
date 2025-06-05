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
import Icon from 'react-native-vector-icons/FontAwesome5'; // Using FontAwesome5

const { width } = Dimensions.get('window');
const studentId = ""; // Example student ID

// Mock data - replace with your actual data source
const assignmentsData = [
  {
    id: '1',
    title: 'Algebra Worksheet Chapter 5',
    subject: 'Mathematics',
    dueDate: 'Nov 10, 2024',
    submittedDate: 'Nov 09, 2024',
    grade: 'A',
    status: 'Graded', // 'Graded', 'Submitted', 'Pending', 'Overdue'
  },
  {
    id: '2',
    title: 'Essay: The Impact of the Industrial Revolution',
    subject: 'History',
    dueDate: 'Nov 15, 2024',
    submittedDate: 'Nov 14, 2024',
    grade: null,
    status: 'Submitted',
  },
  {
    id: '3',
    title: 'Book Report: To Kill a Mockingbird',
    subject: 'English Literature',
    dueDate: 'Nov 20, 2024',
    submittedDate: null,
    grade: null,
    status: 'Pending',
  },
  {
    id: '4',
    title: 'Lab Report: Photosynthesis Experiment',
    subject: 'Science',
    dueDate: 'Nov 05, 2024', // Past due date
    submittedDate: null, // Not submitted
    grade: null,
    status: 'Overdue',
  },
  {
    id: '5',
    title: 'Geometry Problem Set 3',
    subject: 'Mathematics',
    dueDate: 'Nov 25, 2024',
    submittedDate: null,
    grade: null,
    status: 'Pending',
  },
];

// Helper for status-specific styles
const getStatusStyles = (status) => {
  switch (status.toLowerCase()) {
    case 'graded':
      return {
        bgColor: '#EBF4FF', // Light Blue
        textColor: '#3B82F6', // Blue
        icon: 'check-circle',
      };
    case 'submitted':
      return {
        bgColor: '#E6FFF3', // Light Green
        textColor: '#10B981', // Green
        icon: 'check-circle',
      };
    case 'pending':
      return {
        bgColor: '#FFFBEB', // Light Yellow
        textColor: '#F59E0B', // Amber/Yellow
        icon: 'hourglass-half',
      };
    case 'overdue':
      return {
        bgColor: '#FFF1F2', // Light Red
        textColor: '#EF4444', // Red
        icon: 'exclamation-circle',
      };
    default:
      return {
        bgColor: '#F3F4F6', // Light Gray
        textColor: '#6B7280', // Gray
        icon: 'question-circle',
      };
  }
};

const AssignmentCard = ({ assignment, onViewDetails }) => {
  const statusStyle = getStatusStyles(assignment.status);

  return (
    <View style={[styles.card, { backgroundColor: statusStyle.bgColor }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.assignmentTitle}>{assignment.title}</Text>
        <View style={styles.statusTag}>
          <Icon name={statusStyle.icon} size={14} color={statusStyle.textColor} style={styles.statusIcon} />
          <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
            {assignment.status}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Icon name="book-open" size={14} color="#6B7280" style={styles.detailIcon} />
        <Text style={styles.detailText}>{assignment.subject}</Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="calendar-alt" size={14} color="#6B7280" style={styles.detailIcon} />
        <Text style={styles.detailText}>Due: {assignment.dueDate}</Text>
      </View>

      {assignment.submittedDate && (
        <View style={styles.detailRow}>
          <Icon name="calendar-check" size={14} color="#6B7280" style={styles.detailIcon} />
          <Text style={styles.detailText}>Submitted: {assignment.submittedDate}</Text>
        </View>
      )}

      {assignment.grade && (
        <View style={styles.detailRow}>
          <Icon name="graduation-cap" size={14} color="#4B5563" style={styles.detailIcon} />
          <Text style={styles.gradeLabel}>Grade: </Text>
          <Text style={styles.gradeValue}>{assignment.grade}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.detailsButton} onPress={() => onViewDetails(assignment)}>
        <Icon name="arrow-alt-circle-down" size={16} color="#3B82F6" style={styles.detailsButtonIcon} />
        <Text style={styles.detailsButtonText}>View Assignment Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const StudentHomework = () => {
  const handleViewDetails = (assignment) => {
    // Implement navigation or modal to show assignment details
    alert(`Viewing details for ${assignment.title}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.pageHeaderContainer}>
          <View style={styles.pageHeaderIconContainer}>
            <Icon name="pencil-alt" size={24} color="#FFFFFF" />
            {/* Alternative icon: "file-alt" or "edit" */}
          </View>
          <View style={styles.pageHeaderTextContainer}>
            <Text style={styles.pageMainTitle}>
              Assignments & Homework for Student {studentId}
            </Text>
            <Text style={styles.pageSubTitle}>
              Track upcoming and submitted assignments.
            </Text>
          </View>
        </View>

        {assignmentsData.map(assignment => (
          <AssignmentCard key={assignment.id} assignment={assignment} onViewDetails={handleViewDetails} />
        ))}

        <View style={styles.footerNoteContainer}>
          <Text style={styles.footerNoteText}>
            Note: Submission status and grades are updated by teachers. Please allow some time for updates after submission.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Very light gray, almost white background
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pageHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  pageHeaderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24, // Circular background
    backgroundColor: '#F97316', // Orange accent
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 3, // Slight shadow for the icon container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pageHeaderTextContainer: {
    flex: 1,
  },
  pageMainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // Dark Gray
    marginBottom: 4,
  },
  pageSubTitle: {
    fontSize: 14,
    color: '#6B7280', // Medium Gray
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    // backgroundColor is set dynamically by getStatusStyles
    // iOS Shadow
    shadowColor: '#9CA3AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Android Shadow
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // For potentially multi-line titles
    marginBottom: 12,
  },
  assignmentTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937', // Dark Gray
    flex: 1, // Allow title to wrap
    marginRight: 8,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12, // Pill shape
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
  },
  statusIcon: {
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    // color is set dynamically by getStatusStyles
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
    width: 18, // Consistent icon width for alignment
    textAlign: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563', // Slightly darker medium gray
  },
  gradeLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  gradeValue: {
    fontSize: 14,
    color: '#10B981', // Green for grade, or match status color
    fontWeight: 'bold',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 6, // Make it feel more like a link
  },
  detailsButtonIcon: {
    marginRight: 6,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#3B82F6', // Blue, standard link color
    fontWeight: '500',
  },
  footerNoteContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#F3F4F6', // Light gray for note background
    borderRadius: 8,
  },
  footerNoteText: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default StudentHomework;