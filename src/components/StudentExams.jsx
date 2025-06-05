import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';

// Data for the quizzes, replicating the structure from the image
const quizzesData = [
  {
    id: '1',
    tag: 'Daily Quiz',
    title: '9 September 2024: Top 10 Hp Gk(Rivers)',
    details: [
      { icon: '⚙️', text: '0 Questions' }, // Gear icon
      { icon: '☰', text: 'Marks' },      // List icon (Marks text, no value as per image)
      { icon: '🕒', text: '10 Mins' },     // Clock icon
    ],
  },
  {
    id: '2',
    tag: 'Daily Quiz',
    title: '9 September 2024: Daily Current Affairs',
    details: [
      { icon: '⚙️', text: '5 Questions' },
      { icon: '☰', text: '5 Marks' },
      { icon: '🕒', text: '5 Mins' },
    ],
  },
  // Add more quiz objects here if needed
];

const StudentExams = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollViewContainer}>
        <View style={styles.headerBar}>
          {/* Removed extra leading spaces from the text */}
          <Text style={styles.headerBarText}>Exams & Quizes</Text>
        </View>

        <View style={styles.quizzesList}>
          {quizzesData.map((quiz) => (
            <View key={quiz.id} style={styles.quizCard}>
              <View style={styles.quizTag}>
                <Text style={styles.quizTagText}>{quiz.tag}</Text>
              </View>
              <Text style={styles.quizTitleText}>{quiz.title}</Text>
              <View style={styles.quizDetailsRow}>
                {quiz.details.map((detail, index) => (
                  <View key={index} style={styles.quizDetailItem}>
                    <Text style={styles.quizDetailIcon}>{detail.icon}</Text>
                    <Text style={styles.quizDetailInfoText}>{detail.text}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.actionButton}>
                {/* Using a simple Unicode play symbol that can be colored */}
                <Text style={styles.actionButtonIcon}>►</Text>
                <Text style={styles.actionButtonText}>Start Now</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Light gray background for the entire screen
  },
  scrollViewContainer: {
    flex: 1,
  },
  headerBar: {
    // backgroundColor: '#343A40', // User had commented this out, keeping it as is.
    paddingTop: 20,        // Retain top padding for header
    paddingBottom: 10,     // Reduced bottom padding for header
    paddingHorizontal: 20, // Retain horizontal padding
  },
  headerBarText: {
    color: '#343A40', // Dark text color for header
    fontSize: 24,
    fontWeight: 'bold',
  },
  quizzesList: {
    paddingTop: 10,         // Reduced top padding for the list of quizzes
    paddingHorizontal: 20,  // Retain horizontal padding for quiz cards
    paddingBottom: 20,      // Retain bottom padding for end of scroll
  },
  quizCard: {
    backgroundColor: '#FFFFFF', // White background for cards
    borderRadius: 12, // Rounded corners for cards
    padding: 20,      // Inner padding for card content
    marginBottom: 20, // Space between cards
    // Shadow for depth (cross-platform)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  quizTag: {
    backgroundColor: '#28A745', // Green background for the "Daily Quiz" tag
    borderRadius: 15,         // Pill-shaped tag
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',  // Position tag to the left
    marginBottom: 12,
  },
  quizTagText: {
    color: '#FFFFFF', // White text for tag
    fontSize: 12,
    fontWeight: 'bold',
  },
  quizTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333', // Dark gray for quiz title
    marginBottom: 12,
    lineHeight: 24,    // Improve readability for multi-line titles
  },
  quizDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18, // Space below details row, before the button
    flexWrap: 'wrap',   // Allow details to wrap on smaller screens
  },
  quizDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,  // Space between each detail item (e.g., Questions, Marks, Time)
    marginBottom: 5,  // Space if items wrap to next line
  },
  quizDetailIcon: {
    fontSize: Platform.OS === 'ios' ? 16 : 14, // Emoji/icon size (can vary by platform)
    color: '#555555', // Medium gray for icons
    marginRight: 6,   // Space between icon and text
  },
  quizDetailInfoText: {
    fontSize: 14,
    color: '#555555', // Medium gray for detail text
  },
  actionButton: {
    backgroundColor: '#007BFF', // Blue background for "Start Now" button
    borderRadius: 8,          // Rounded corners for button
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',     // Align icon and text horizontally
    alignItems: 'center',
    justifyContent: 'center', // Center content within button
    alignSelf: 'flex-end',    // Position button to the right of the card
    minWidth: 130,            // Ensure button is adequately sized
  },
  actionButtonIcon: {
    color: '#FFFFFF', // White color for button icon
    fontSize: 14,     // Size of button icon
    marginRight: 8,   // Space between button icon and text
  },
  actionButtonText: {
    color: '#FFFFFF', // White text for button
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default StudentExams;